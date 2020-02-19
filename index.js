var db = require("mysql");
var fs = require("fs");

var host = "localhost";
var user = "root";
var password = "password";
var database = "tempdb";
var inputSQL = process.argv.slice(2)[0] || `SELECT * FROM ${database}.users LIMIT 25`;

var sql = fs.readFileSync("sqldump.sql").toString();

const con = db.createConnection({
    host: host,
    user: user,
    password: password,
    multipleStatements: true
});

//Creating the connection instance for database creation and population.
con.connect(function(err) {
    if (err) throw err;
    console.log("INIT: Connected.");
    //Creates the database if it doesn't already exist on the MySQL server.
    con.query(`CREATE DATABASE IF NOT EXISTS ${database}`, function (err) {
        if (err) throw err;
        console.log("INIT: Database created.");
        console.log();
    }); 
    
    //Removes any previous instances of the 'users' table.
    con.query(`USE ${database}; DROP TABLE IF EXISTS users`, function (err) {
        if (err) throw err;
        console.log("INIT: Users table dropped.");
        console.log();
    });
    //Creates a 'users' table from the assignment's SQL script.
    con.query(`USE ${database}; ${sql}`, function(err, result) {
        if (err) throw err;
        console.log("INIT: Users table recreated.");
        console.log();
    });

    //Queries the database with user input.
    con.query(inputSQL, function(err, queryResult) {
        if (err) throw err;
        console.log("Users in table: " + Object.keys(queryResult).length);
        //Saves results from user query to JSON file.
        fs.writeFileSync('table.json', JSON.stringify(queryResult), function (err) {
            if (err) throw err;
            console.log("Results saved to file.");
        });
    
        //Reads the previously saved file and stores the contents in a variable.
        var fileResult = fs.readFileSync('table.json');
        //Compares the result of the initial query to the contents stored in the file to ensure integrity.
        if (JSON.stringify(queryResult) == fileResult) {
            //Iterates over the results of the initial query and deletes the matching user accounts from it.
            for (item in Object.keys(queryResult)){
                con.query(`USE ${database}; DELETE FROM users ` + 
                `WHERE users.id = '${queryResult[item].id}' &&` +
                `users.firstName = '${queryResult[item].firstName}' &&` +
                `users.lastName = '${queryResult[item].lastName}'&&` +
                `users.email = '${queryResult[item].email}'` +
                `LIMIT 1`, function (err){
                    if (err) throw err;
                });
                console.log(`Deleting by ID: ${queryResult[item].id}`);
            }
            console.log(`Deleted ${Object.keys(queryResult).length} entries.`)
            console.log();
        }
    });
});