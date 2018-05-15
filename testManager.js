/* tests.js 
* 
* Class will manage tests
* 
*/
"use strict";

class TestManager {

    constructor(db) {
        this.db = db;
        return this;
    }

    init() {
        
        var db = this.db;
        
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
        
        // not running in sync to previous test..  need to have a done.next system in place.
        // test writing to a sub table
        db.write("test3", {g:"hello", h:"world", i:"!"}, function(err, newDoc) {
            console.log("Wrote data: " + newDoc);
        });
    }
    
}

module.exports = TestManager;