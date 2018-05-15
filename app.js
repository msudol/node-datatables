/* app.js */
"use strict";

// import TableManager class 
var TableManager = require('./tableManager.js');
var TestManager = require('./testManager.js');

// get command line args
var processArgs = process.argv;


// Tables array should eventually come from a client tool or a config file.
// These tables represent the tables that are managed overall.
var rootTables = [
    {name: 'test1', fields: ['a', 'b', 'c']},
    {name: 'test2', fields: ['d', 'e', 'f']},
    {name: 'test3', fields: ['g', 'h', 'i']}
];

/* DOING SOME THINGS TO EXERCISE TABLEMANAGER */
// initialize an instance of TableManager, with the root table table and the tables it's going to manage.
// syntax (root table name, list of tables to manage, relative path for installation (defaults to 'db'), optional type of nedb or mongo)
var db = new TableManager('root', rootTables, 'db');

// function will be sent to the table init function as a callback.
var onTableInit = function(db) {
    
    if (processArgs.includes("notest")) {
        console.log("Skipping Tests");
    }
    else {    
        var initTest = new TestManager(db);
        initTest.init();
    }
};

// intitialize the DB and send a callback function that -should- run when the db is all setup.
db.init(function() {
    onTableInit(db);
});

