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

//var RootTables = require('./tests/tables.js');
//var UserTables = require('./tests/users.js');
//var defaultUsers = require('./tests/defaultUsers.js');

// initialize an instance of TableManager, with the root table table and the tables it's going to manage.
//adding false for the 2nd param makes the manager initiliaze from what lives in root
var db = new TableManager('root', false, 'db');
// take an object insteaf of false with: var db = new TableManager('root', RootTables, 'db');

// init the userDB - we can add false to not user the test table above at some point
var userDb = new TableManager('root', false, 'db/users');
// take an object insteaf of false with: var userDb = new TableManager('root', UserTables, 'db/users');

// function will be sent to the table init function as a callback.
var onRootTableInit = function (db) {
    if (processArgs.includes("logging")) {
        //todo set a logging state here
    }
    // tests or no tests on startup
    if (processArgs.includes("runtests")) {
        var initTest = new TestManager(db, userDb);
        // run the tests and when done callback
        initTest.init(function() {
            return startWebServer();
        });
    } else {    
        return startWebServer();
    }
};

// Start the webserver on a callback from the last database initialized during startup
var startWebServer = function() {
    // setup instance of an express web server for this DB.
    var ws = new WebServer("3000", db, userDb);
    ws.init();
}

// intitialize the DBs in a chain and send a callback function that -should- run when the db is all setup.
userDb.init(function() {
    console.log("Initializing User DB");
    // init the datatables db's
    db.init(function () {
        onRootTableInit(db);
    }, true);
    
    /* insert user from tests for now
    userDb.insert("users", defaultUsers[0], function (err, newDoc) {
        if (err) {
            console.log("- Error writing default user: " + err.errorType);
        } else {
            console.log("- Wrote default user: " + JSON.stringify(newDoc));
        }
    }); 
    */    
}, true);
