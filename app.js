/* app.js */
"use strict";
// import configurations
var Config = require('./config.js');
// import TableManager class 
var TableManager = require('./tableManager.js');
// import TestManager Class
var TestManager = require('./testManager.js');
// import WebServer Class
var WebServer = require('./webServer.js');
// get command line args
var processArgs = process.argv;

// initialize an instance of TableManager, with the root table table and the tables it's going to manage.
// adding false for the 2nd param makes the manager initialize from what already lives in the directory
var db = new TableManager('root', false, 'db');

// init the userDB - we can add false to not use the test table above 
var userDb = new TableManager('root', false, 'db/users');

// tack on an encyrption key variable to userDb
userDb.masterKey = Config.masterKey;

// function will be sent to the table init function as a callback.
var onRootTableInit = function (db) {
    if (processArgs.includes("logging")) {
        //todo set a logging state here
    }
    // tests or no tests on startup
    if (processArgs.includes("runtests")) {
        var initTest = new TestManager(db, userDb);
        // run the tests and when done callback
        initTest.init(function () {
            return startWebServer();
        });
    } else {
        return startWebServer();
    }
};

// Start the webserver on a callback from the last database initialized during startup
var startWebServer = function () {
    // setup instance of an express web server for this DB.
    var ws = new WebServer("3000", db, userDb);
    ws.init();
};

// intitialize the DBs in a chain and send a callback function that -should- run when the db is all setup.
userDb.init(function () {
    console.log("Initializing User DB");
    // init the main datatables db's
    db.init(function () {
        onRootTableInit(db);
    }, true);
}, true);
