let mysql = require("mysql");
let inquirer = require("inquirer");
let stockArray = [];

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
      name: "manage",
      type: "list",
      message: "\nWhat would you like to do today?",
      choices: ["VIEW ALL PRODUCTS", "VIEW LOW INVENTORY", "ADJUST INVENTORY", "ADD NEW PRODUCT", "EXIT"]
    })
    .then(function(question) {
      // based on their answer, either call the bid or the post functions
      if (question.manage === "VIEW ALL PRODUCTS") {
       viewProducts();
      } 
      else if (question.manage === "VIEW LOW INVENTORY") {
        viewLow();
       } 
      else if (question.manage === "ADJUST INVENTORY") {
        addInventory();
       } 
       else if (question.manage === "ADD NEW PRODUCT") {
        addProduct();
       } 
      else {
        console.log("Goodbye!")
        connection.end();
      }
    });
}


function viewProducts() {
  // query the database for all items being auctioned
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    // display in columns
    console.log("| ID | PRODUCT       | DEPARTMENT    | PRICE          | ON HAND |");
    console.log("| -- | ------------- | ------------- | -------------- | ------- |");
    // display all the products
    for (var i = 0; i < results.length; i++) {
      console.log("  " + results[i].item_id + smallSpacer(results[i].item_id) + results[i].product_name + spacer(results[i].product_name) + results[i].department_name + spacer(results[i].department_name) + "$" + results[i].price + spacer(results[i].price) + results[i].stock_qty);
    }
    start();
  });
}
// function for low stock
function viewLow() {
  // query the database for all items being auctioned
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    // once you have the items, prompt the user for which they'd like to bid on
    console.log("\nThese items have less than 50 units in stock")

    console.log("| ID | PRODUCT       | DEPARTMENT    | PRICE          | ON HAND |");
    console.log("| -- | ------------- | ------------- | -------------- | ------- |");
    // loop through results
    for (var i = 0; i < results.length; i++) {
      if (results[i].stock_qty < 50) {
        console.log("  " + results[i].item_id + smallSpacer(results[i].item_id) + results[i].product_name + spacer(results[i].product_name) + results[i].department_name + spacer(results[i].department_name) + "$" + results[i].price + spacer(results[i].price) + results[i].stock_qty);
      }
    }
    // start over
    start();
});
}
// add inventory function
function addInventory() {
  // query the database for all items being auctioned
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    // once you have the items, prompt the user for which they'd like to selecg
    inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: function() {
            
            for (var i = 0; i < results.length; i++) {

              stockArray.push(results[i].product_name + " | " + results[i].department_name + " | $" + results[i].price + " | QTY: " + results[i].stock_qty);
            }
            // console.log(stockArray);
            return stockArray;
          },
          message: "Please select the item you wish to edit:"
        },
        {
          name: "qty",
          type: "input",
          message: "How many units would you like to add/subtract?"
        }
      ])
      .then(function(answer) {
        // set the chosenItem to the selection when they're equal
        let chosenItem;
        for (let i = 0; i < results.length; i++) {
          if ((stockArray[i]) === answer.choice) {
            chosenItem = results[i];
          }
        }
          // update the quantity variable
          let newQty = parseInt(chosenItem.stock_qty) + parseInt(answer.qty);
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
              console.log("That item has been updated");
                start();
            }
          );

      });
  });
}
// add products function
function addProduct() {
  // prompt for info about the item being added
  inquirer
    .prompt([
      {
        name: "product",
        type: "input",
        message: "Product name:"
      },
      {
        name: "department",
        type: "input",
        message: "Department:"
      },
      {
        name: "price",
        type: "input",
        message: "Price: $",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      },
      {
        name: "quantity",
        type: "input",
        message: "Stock on hand:",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function(answer) {
      answer.price = parseFloat(answer.price);
      // when finished prompting, insert a new item into the db with that info
      connection.query(
        "INSERT INTO products SET ?",
        {
          product_name: answer.product,
          department_name: answer.department,
          price: answer.price,
          stock_qty: answer.quantity
        },
        function(err) {
          if (err) throw err;
          console.log("Your product was created successfully!");
          // restart the app
          start();
        }
      );
    });
}

// function to add the right number of spaces between columns so they line up
function spacer(data) {
  data = data.toString();
  blank = "";
  for (i = 0; i < (16 - data.length); i++) {
      blank += " ";
  }
  return blank;
}

// function to add space after ID so columns line up
function smallSpacer(data) {
  data = data.toString();
  blank = "";
  if (data.length === 2) {
    blank = "   ";
  } else {
    blank = "    "
  }
  return blank;
}