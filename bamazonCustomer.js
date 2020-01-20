var inquirer = require('inquirer');
var clc = require("cli-color");
var mysql = require("mysql");
var Table = require('cli-table');
console.clear();
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Identity&1",
    database: "bamazon_db"
});
connection.connect(function (err) {
    if (err) throw err;
    // console.log("connected as id " + connection.threadId);
    displayProducts();
});

var displayProducts = function () {

    var query = "Select * FROM products";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log(clc.red(" Current Inventory at Bamazon"));
        console.log(" ----------------------------------");
        var displayTable = new Table({
            head: ["Item ID", "Product Name", "Department Name", "Price", "Stock Quantity"],
            colWidths: [10, 25, 25, 10, 20]
        });
        for (var i = 0; i < res.length; i++) {
            displayTable.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
            );
        }
        console.log(displayTable.toString());
        customerPurchase(res);
    });
}

function customerPurchase(res) {

    inquirer.prompt([{
        type: "input",
        name: "itemId",
        message: "Please provide the Item ID of the product you wish to purchase.",
    },
    {
        type: "input",
        name: "quantity",
        message: "How many units do you wish to purchase?",
    }])
        .then(function (answers) {
            var updatedStockQuantity;

            var userItemId = answers.itemId;
            var userQuantity = answers.quantity;
            var query = "Select stock_quantity,price,product_name FROM products WHERE item_id = " + userItemId;
            connection.query(query, function (err, res) {
                if (err) throw err;
                else {
                        if (res[0].stock_quantity - userQuantity > 0) {
                        var quantityAtItemId = res[0].stock_quantity;
                        updatedStockQuantity = quantityAtItemId - userQuantity;
           
                        console.log(clc.magenta("You have purchased " + userQuantity + " " + res[0].product_name +
                            "\nfor a total cost of: $" + res[0].price * userQuantity));



                        var query = "UPDATE products SET stock_quantity = " +
                            updatedStockQuantity + " WHERE item_id = " + answers.itemId;
                        connection.query(query, function (err, res) {
                            if (err) throw err;
                            else {
                                console.log("Product quantity updated");
                                connection.end();
                            }
                        });
                    }
                    else {

                        console.log(clc.red("There is not enough stock inventory to fulfill your order."));
                        console.log(clc.red("Please try to order again."));

                        customerPurchase();
                    }
                }
            });
        });
}
