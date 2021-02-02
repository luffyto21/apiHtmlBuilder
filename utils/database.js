const mysql = require('mysql');
const config = require('config'); 
var con = mysql.createPool({
    host: config.get("database.DBHOST"),
    database: config.get("database.DBNAME"), 
    user: config.get("database.DBUSER"),
    password: config.get("database.DBPSSW"),
    port: config.get("database.DBPORT")
  });    

 module.exports = con;