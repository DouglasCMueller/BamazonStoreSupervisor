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
    console.log("connected as id " + connection.threadId);
    managerChoices();
});

function managerChoices(res) {
    inquirer.prompt({
        type: "list",
        name: "managerChoice",
        message: "Choose what you would like to do: ",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]

    })
        .then(function (answer) {

            switch (answer.managerChoice) {
                case "View Products for Sale":
                    managerViewProductsForSale();
                    break;
                case "View Low Inventory":
                    managerViewLowInventory();
                    break;
                case "Add to Inventory":
                    managerAddToInventory();
                    break;
                case "Add New Product":
                    managerAddNewProduct();
                    break;
                default:
                    break;
            }
        })
}
function managerViewProductsForSale() {

    var query = "Select * FROM products";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log(clc.red(" Current Inventory at Bamazon"));
        console.log(" ----------------------------------");
        var displayTableInventory = new Table({
            head: ["Item ID", "Product Name", "Department Name", "Price", "Stock Quantity"],
            colWidths: [10, 25, 25, 10, 20]
        });
        for (var i = 0; i < res.length; i++) {
            displayTableInventory.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
            );
        }
        console.log(displayTableInventory.toString());
        connection.end();
    });
}
function managerViewLowInventory() {
    var query = "Select * FROM products WHERE stock_quantity < 5";
    connection.query(query, function (err, res) {
        if (err) throw err;

        console.log(clc.red(" Current Low Inventory at Bamazon"));
        console.log(" ----------------------------------");
        var displayTableLowInventory = new Table({
            head: ["Item ID", "Product Name", "Department Name", "Price", "Stock Quantity"],
            colWidths: [10, 25, 25, 10, 20]
        });
        for (var i = 0; i < res.length; i++) {
            displayTableLowInventory.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
            );
        }
        console.log(displayTableLowInventory.toString());
        connection.end();

    });
}

function managerAddToInventory() {
    console.clear();
    inquirer.prompt([{
        type: "input",
        name: "itemId",
        message: "Please provide the Item ID of the product you wish to add inventory.",
    },
    {
        type: "input",
        name: "quantity",
        message: "How many units do you wish to add?",
    }])
        .then(function (answers) {
            var updatedStockQuantity;
            var managerItemId = answers.itemId;
            var managerQuantity = parseInt(answers.quantity);

            var query = "Select stock_quantity,product_name FROM products WHERE item_id = " + managerItemId;
            connection.query(query, function (err, res) {
                if (err) throw err;
                else {
                    var quantityAtItemId = res[0].stock_quantity;

                    updatedStockQuantity = parseInt(quantityAtItemId + managerQuantity);

                    console.log(clc.magenta("You have added " + managerQuantity + " " + res[0].product_name +
                        "\nto inventory"));

                    var query = "UPDATE products SET stock_quantity = " +
                        updatedStockQuantity + " WHERE item_id = " + managerItemId;
                    connection.query(query, function (err, res) {
                        if (err) throw err;
                        else {
                            console.log("Product quantity updated");
                            connection.end();
                        }
                    });

                }
            });
        });
}

function managerAddNewProduct() {
    console.clear();
    inquirer.prompt([
        {
            type: "input",
            name: "product_name",
            message: "Please provide the product name: ",
        },
        {
            type: "input",
            name: "department_name",
            message: "Please provide the department name: ",
        },
        {
            type: "input",
            name: "price",
            message: "Please provide the price of the product: ",
        },
        {
            type: "input",
            name: "stock_quantity",
            message: "Please provide the stock quantity of the product: ",
        }
    ])
        .then(function (answers) {
            console.log(answers)

            connection.query(
                "INSERT INTO products SET ?",
                {
                    product_name: answers.product_name,
                    department_name: answers.department_name,
                    price: answers.price,
                    stock_quantity: answers.stock_quantity
                },
                function (err) {
                    if (err) throw err;
                    console.log("Your product was added successfully.");
                    connection.end();

                }

            );
        })
}
