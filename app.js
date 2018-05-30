/* app.js */
"use strict";

// import TableManager class 
var TableManager = require('./tableManager.js');

// import TestManager Class
var TestManager = require('./testManager.js');

// import WebServer Class
var WebServer = require('./webServer.js');

// get command line args
var processArgs = process.argv;

// Tables array should eventually come from a client tool or a config file.
// These tables represent the tables that are managed overall.
var Tables = require('./tables.js');

/* DOING SOME THINGS TO EXERCISE TABLEMANAGER */
// initialize an instance of TableManager, with the root table table and the tables it's going to manage.
// syntax (root table name, list of tables to manage, relative path for installation (defaults to 'db'), optional type of nedb or mongo)
var db = new TableManager('root', Tables, 'db');

// function will be sent to the table init function as a callback.
var onTableInit = function (db) {
    
    if (processArgs.includes("runtests")) {
        console.log("Running Tests");
        var initTest = new TestManager(db);
        initTest.init();
    } else {

    }
};

// intitialize the DB and send a callback function that -should- run when the db is all setup.
db.init(function () {
    onTableInit(db);
}, true);

// setup instance of an express web server for this DB.
var ws = new WebServer(db);

