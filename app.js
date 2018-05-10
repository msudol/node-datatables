/* app.js */
"use strict";

// import TableManer class 
var TableManager = require('./tableManager.js');

// Tables array should eventually come from a client tool or a config file.
// These tables represent the tables that are managed overall.
var tables = [
    {name: 'test1', fields: ['a','b','c']},
    {name: 'test2', fields: ['d','e','f']},
    {name: 'test3', fields: ['g','h','i']}
]

// initialize an instance of TableManager, with the root table table and the tables it's going to manage.
var db = new TableManager('root', tables);

console.log("Root table name is: " + db.rootName);
