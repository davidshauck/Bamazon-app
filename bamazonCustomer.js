let mysql = require("mysql");
let inquirer = require("inquirer");
let stockMessage = "";
let choiceArray = [];
let orderTotal = "";
let newTotal = 0;

// create the connection information for the sql database
let connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "Hazel123",
  database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});

// function which prompts the user for what action they should take
function start() {
  inquirer
    .prompt({
      name: "buy",
      type: "list",
      message: "What would you like to do today?",
      choices: ["SHOP", "EXIT"]
    })
    .then(function(question) {
      // based on their answer, either call the bid or the post functions
      if (question.buy === "SHOP") {
       buyItem();
      } 
      else {
        console.log("Thank you for shopping with us!")
        connection.end();
      }
    });
}

function buyItem() {
  // query the database for all items being sold
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    // once you have the items, prompt the user for which they'd like to bid on
    inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: function() {
            
            for (var i = 0; i < results.length; i++) {
                // display stock message based on how many in stock
                if (results[i].stock_qty < 50) {
                    stockMessage = " Hurry, we only have " + results[i].stock_qty + " left!"
                }
                else {
                    stockMessage = " There are " + results[i].stock_qty + " in stock"
                }
              // push the items to the array  
              choiceArray.push(results[i].product_name + " $" + results[i].price + stockMessage);
            }
            return choiceArray;
          },
          message: "Please select the item you wish to purchase:"
        },
        {
          name: "qty",
          type: "input",
          message: "How many units would you like?"
        }
      ])
      .then(function(answer) {
        // loop through results to compare answer to choices
        let chosenItem;
        for (let i = 0; i < results.length; i++) {
          // set chosenItem to the results when they're equal
          if ((choiceArray[i]) === answer.choice) {
            chosenItem = results[i];
          }
        }
        // only sell the item if there is enough in stock
        if (parseInt(chosenItem.stock_qty) > parseInt(answer.qty)) {
          orderTotal = (answer.qty * chosenItem.price).toFixed(2);
          // subtract the amount sold from the stock on hand
          let newQty = parseInt(chosenItem.stock_qty - answer.qty);
          // update the database
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_qty: newQty
              },
              {
                item_id: chosenItem.item_id
              }
            ],
            function(error) {
              if (error) throw err;
              // display customer's order total
              console.log("Your order total: $" + orderTotal);
            }
          );
          // if there are no sales yet make sales = $0
          if (chosenItem.total_sales === null || (chosenItem.total_sales === NaN)) {
            chosenItem.total_sales = 0;
          } else {
            newTotal = parseFloat(chosenItem.total_sales) + parseFloat(orderTotal);
          }
          // update database
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                total_sales: newTotal
              },
              {
                item_id: chosenItem.item_id
              }
            ],
            function(error) {
              if (error) throw err;
              console.log("Thank you for shopping with us!");
              choiceArray = []
              start();
            }
          );
        }
        else {
          // if there wasn't enough in stock
          console.log("Sorry, we only have " + chosenItem.stock_qty + " on hand");
          choiceArray = []
          start();
        }
      });
  });
}