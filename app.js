/* app.js */
"use strict";

// import TableManer class 
var TableManager = require('./tableManager.js');

// Tables array should eventually come from a client tool or a config file.
// These tables represent the tables that are managed overall.
var tables = [
    {name: 'test1', fields: ['a', 'b', 'c']},
    {name: 'test2', fields: ['d', 'e', 'f']},
    {name: 'test3', fields: ['g', 'h', 'i']}
];

/* DOING SOME THINGS TO EXERCISE TABLEMANAGER */

// initialize an instance of TableManager, with the root table table and the tables it's going to manage.
// syntax (root table name, list of tables to manage, relative path for installation (defaults to 'db'), optional type of nedb or mongo)
var db = new TableManager('root', tables, 'db');

var onTableInit = function(db) {
    
    // present some data about the root table.
    console.log("Root table name is: " + db.rootName);

    // get the root table docs
    db.find(db.rootName, {}, function (err, docs) {
        console.log("Current tables managed: ");

        // fails if tables need to be created because of aSync but works if they already exist
        for (var i = 0; i < docs.length; i++) {
            console.log(" - " + docs[i].name);
        }
    });
    
    db.drop("test1", function(err, numRemoved, tableName) {
        console.log("Dropping " + tableName);

        // get the root table docs
        db.find(db.rootName, {}, function (err, docs) {
            console.log("Current tables managed: ");

            // fails if tables need to be created because of aSync but works if they already exist
            for (var i = 0; i < docs.length; i++) {
                console.log(" - " + docs[i].name);
            }
        });
    });
    
}

db.init(function() {
    onTableInit(db);
});

