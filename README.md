# Bamazon-app

### Overview

The Bamazon App is actually 3 apps -- bamazonCustomer, bamazonManager and bamazonSupervisor. Each is designed to take node inputs from the user, query or write to a MySql database, and return relevant results. The customer app allows product purchases; the manager displays stock levels, allows updating of inventory, and the creation new items; and the supervisor app checks department sales and allows the creation of new departments.

### App organization

Each app begins by loading all the relevant npm packages and creating variables. It then takes the user inputs and runs functions based on the user selection. All the functions are grouped at the bottom of the file. One extra function determines appropriate amount of space needed to be added in between each result so the columns line up.

### Instructions

The customer app allows the customer to purchase from a list of products. They enter the number of units they want to buy and the app returns the total dollar amount of their sale.

The supervisor app starts by giving the user a list of options -- list all products, list items with low inventory, adjust inventory or add a new product. The two "view" options simply return a list of items. If "adjust inventory" is selected, the user can select which item he wants to adjust and then how many units he wants to add/subtract. If "add new product" is selected it will prompt the user to list product name, department, price and stock quantity.

The manager app displays sales by department and allows the user to create a new department (although that department won't show up on the sales list until sales have been made).

### App in action

Since the app uses a local MySql database you can view it here:
https://www.youtube.com/watch?v=9Zuu0ajPWSg

### Technoligies used in app

* node.js
* inquirer
* javascript
* MySql

### My role

I created the databases and based the code on exercises we had done in class
