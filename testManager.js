/* tests.js 
* 
* Class will manage tests
* 
*/
"use strict";

class TestManager {

    constructor(db) {
        this.db = db;
        this.testList = [this.testRootTableName, this.testRootTableDocs, this.testDropTable, this.testRootTableDocs, this.testWriteTable];
        return this;
    }

    init() {   
        console.log("Running Tests");
        var self = this;
        
        // would be nice to do some sort of test running from the above array instead
        self.testRootTableName(function() {
            self.testRootTableDocs(function() { 
                self.testDropTable(function() {
                    self.testRootTableDocs(function() {
                        self.testWriteTable(function() { 
                            self.testNewSubTable(function() {
                                self.testRootTableDocs(function () {
                                     console.log("done");  
                                })
                            })
                        })
                    })
                })
            })
        });

    }
        
    // This will run tests in order
    runner() { 

    }
    
    // break these out into modules in the tests folder eventually
    testRootTableName(callback) {
        var db = this.db;
        // present some data about the root table.
        console.log("Root table name is: " + db.rootName);
        return callback();
    }
    
    testRootTableDocs(callback) { 
        var db = this.db;
        // get the root table docs
        db.find(db.rootName, {}, function (err, docs) {
            console.log("Current tables managed: ");
            // fails if tables need to be created because of aSync but works if they already exist
            for (var i = 0; i < docs.length; i++) {
                console.log(" - " + docs[i].name);
            }
            return callback();
        }); 
    }
    
    testDropTable(callback) {
        var db = this.db;
        db.drop("test1", function(err, numRemoved, tableName) {
            console.log("Dropping " + tableName);
            return callback();
        });  
    }
    
    testWriteTable(callback) {
        var db = this.db;
        // test writing to a sub table
        db.write("test3", {g:"hello ", h:"world", i:"!"}, function(err, newDoc) {
            console.log("Wrote data: " + JSON.stringify(newDoc));
            return callback();
        });    
    }
    
    testNewSubTable(callback) {
        var db = this.db;
        var testTable = {name: 'test4', fields: ['key', 'val', 'derp']};
        // test creating a new subtable
        db.subTable(testTable.name, testTable, function() {
            console.log("Created new subtable");
            return callback();
        })
    }
    
}

module.exports = TestManager;