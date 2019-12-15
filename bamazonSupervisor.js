// make variables for the required packages
let mysql = require("mysql");
let inquirer = require("inquirer");
// blank space variable to help get columns to line up
let blank = "";

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
      choices: ["VIEW SALES BY DEPARTMENT", "CREATE NEW DEPARTMENT", "EXIT"]
    })
    .then(function(question) {
      // based on their answer, either call the bid or the post functions
      if (question.manage === "VIEW SALES BY DEPARTMENT") {
       departmentSales();
      } 
       else if (question.manage === "CREATE NEW DEPARTMENT") {
        addDepartment();
       } 
      else {
        console.log("Goodbye!")
        connection.end();
      }
    });
}

// function to check on sales by department
function departmentSales() {
    // Jim helped me with this SELECT but I'm not sure it's working 100%
    let query = "SELECT * FROM departments INNER JOIN (SELECT products.department_name, sum(products.total_sales) as totalSales FROM products INNER JOIN departments GROUP BY department_name) as dynamicTable on dynamicTable.department_name = departments.department_name";

    connection.query(query, function(err, results) {
    if (err) throw err;

        // display column heads
        console.log("| ID | DEPARTMENT    | OVERHEAD COSTS | TOTAL SALES    | TOTAL PROFIT |");
        console.log("| -- | ------------- | -------------- | -------------- | ------------ |");
        // loop through the results
        for (var i = 0; i < results.length; i++) {
            // make sales = 0 if there is no current sales
            if (results[i].totalSales === null) {
                results[i].totalSales = 0;
            }
            // display results, convert numbers to 2 decimal places and call function to add speces in between each item
            console.log("  " + results[i].department_id + "    " + 
            results[i].department_name + spacer(results[i].department_name) + "$" + results[i].overhead_costs.toFixed(2) + spacer(results[i].overhead_costs.toFixed(2)) + "$" + results[i].totalSales.toFixed(2) + spacer(results[i].totalSales.toFixed(2)) + "$" + (results[i].totalSales - results[i].overhead_costs).toFixed(2));      
        }
        start();
    });
}

// function to add new department
function addDepartment() {
  // prompt for info about the deparment being added
  inquirer
    .prompt([
      {
        name: "department",
        type: "input",
        message: "Department Name:"
      },
      {
        name: "overhead",
        type: "input",
        message: "Overhead Costs:"
      }
    ])
    .then(function(answer) {
      answer.price = parseFloat(answer.price);
      // when finished prompting, insert a new item into the db with that info
      connection.query(
        "INSERT INTO departments SET ?",
        {
          department_name: answer.department,
          overhead_costs: answer.overhead
        },
        function(err) {
          if (err) throw err;
          console.log("Your department was created successfully!");
          // restart app
          start();
        }
      );
    });
}

// function to add the right amount of space between results so columns line up
function spacer(data) {
    data = data.toString();
    blank = "";
    for (i = 0; i < (16 - data.length); i++) {
        blank += " ";
    }
    return blank;
}
