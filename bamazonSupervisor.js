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
    supervisorChoices();
});
function supervisorChoices(){
    inquirer.prompt({
        type: "list",
        name: "supervisorChoice",
        message: "Choose what you would like to do: ",
        choices: ["View Products Sales by Department", "Create New Department"]

    })
        .then(function (answer) {
console.log(answer)
            switch (answer.supervisorChoice) {
                case "View Products Sales by Department":
                    supervisorViewSalesByDepartment();
                    break;
                case "Create New Department":
                    supervisorCreateNewDepartment();
                    break;
                default:
                    break;
            }
        })
}
function supervisorViewSalesByDepartment(){
    var query = "Select * FROM departments";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log(clc.red("Product Sales by Department"));
        console.log(" ----------------------------------");
        var displayTable = new Table({
            head: ["Department ID", "Department Name", "OverHead Costs", "Product Sales", "Total Profit"],
            colWidths: [25, 25, 25, 25, 25]
        });
        for (var i = 0; i < res.length; i++) {
            displayTable.push(
                [res[i].department_id, res[i].department_name,
                res[i].over_head_costs, res[i].product_sales, res[i].total_profit]
            );
        }
        console.log(displayTable.toString());
      connection.end();
    });



}