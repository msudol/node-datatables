/* tests.js 
* 
* Class will manage tests
* 
*/
"use strict";

class TestManager {

    constructor(db, userDb) {
        this.db = db;
        this.userDb = userDb;
        this.isRunning = false;
        return this;
    }

    init(callback) {   
        console.log("Running Tests");
        var self = this;
        self.testList = [self.testRootTableName, self.testRootTableDocs, self.testDropTable, self.testRootTableDocs, self.testWriteTable, self.testNewSubTable, self.testRootTableDocs, self.testNewSubTableWrite, self.testTableAllowedFields, self.testGetAllFromTable, self.testNewUserSubTable, self.testCreateUser];
        self.runner(self.testList, 0, callback);
    }
        
    // This will run tests in order
    runner(testList, curTest, callback) { 
        var self = this;
        self.isRunning = true; 
        console.log("=== TEST RUNNER === TEST: " + curTest);
        self.testList[curTest](self);
        self.runnerCheck(testList, curTest, self, callback);  
    }
    
    // recursive function to check if a test is running
    runnerCheck(testList, curTest, self, callback) {    
        var isRunning = self.isRunning;
        
        if (isRunning) {
            setTimeout(function() {
                self.runnerCheck(testList, curTest, self, callback);
            }, 100)
        }
        else {
            if ((curTest + 1) == testList.length) {
                console.log("=== Done tests! ===");
                return callback();
            }
            else {
                self.runner(testList, curTest + 1, callback);
            }
        }
    }
    
    // break these out into modules in the tests folder eventually
    testRootTableName(self) {
        // present some data about the root table.
        console.log(" - Root table name is: " + self.db.rootName);
        self.isRunning = false;
        return;
    }
    
    testRootTableDocs(self) { 
        // get the root table docs
        self.db.find(self.db.rootName, {}, function (err, docs) {
            console.log(" - Current tables managed: ");
            // fails if tables need to be created because of aSync but works if they already exist
            for (var i = 0; i < docs.length; i++) {
                console.log(" - " + docs[i].name);
            }
            self.isRunning = false;
            return;
        }); 
    }
    
    testDropTable(self) {
        self.db.drop("test1", function (err, numRemoved, tableName) {
            if (err) {
                console.error(err)
            }
            else {
                console.log(" - Dropping " + tableName);
            }
            self.isRunning = false;
            return;
        });  
    }
    
    testWriteTable(self) {
        // test writing to a sub table - this should fail if this already exists since this table has a unique key set
        self.db.insert("test3", {g:"hello ", h:"world", i:"!"}, function (err, newDoc) {
            if (err) {
                console.log("- Error writing: " + err.errorType);
            } else {
                console.log("- Wrote data: " + JSON.stringify(newDoc));
            }
            self.isRunning = false;
            return;
        });    
    }
    
    testNewSubTable(self) {
        var testTable = {name: 'test4', fields: ['key', 'val', 'derp'], unique: ['key']};
        // test creating a new subtable
        self.db.subTable(testTable.name, testTable, function () {
            console.log(" - Created new subtable");
            self.isRunning = false;
            return;
        })
    }
    
    testNewSubTableWrite(self) {
        // test writing to a sub table
        self.db.insert("test4", {key:"unique", h:"testing", i:"once"}, function (err, newDoc) {
            if (err) {
                console.log("- Error writing: " + err.errorType);
            } else {
                console.log("- Wrote data: " + JSON.stringify(newDoc));
            }
            
            // try writing another to the unique key - key in this table
            self.db.insert("test4", {key:"unique", h:"testing", i:"twice"}, function (err, newDoc) {
                if (err) {
                    console.log("- Error writing: " + err.errorType);
                } else {
                    console.log("- Wrote data: " + JSON.stringify(newDoc));
                }
                self.isRunning = false;
                return;
            }); 
            
        });    
    }
    
    testTableAllowedFields(self) {
        self.db.allowedFields("test2", function (err, fields) {
            console.log(" - " + fields);
            self.isRunning = false;
            return;
        });
    }
    
    testGetAllFromTable(self) {
        var tableName = "test3";
        
        self.db.find(tableName, {}, function (err, docs) {
            console.log(" - Current tables in : " + tableName);
            // fails if tables need to be created because of aSync but works if they already exist
            if (docs.length == 0) {
                console.log("No tables found.");
            } else {
                for (var i = 0; i < docs.length; i++) {
                    console.log(" - " + JSON.stringify(docs[i]));
                }
            }
            self.isRunning = false;
            return;            
        })
    }
    
    testNewUserSubTable(self) {
        var testTable = {name: 'users', fields: ["userName","firstName","lastName","password","email"],"unique":["userName"]};
        // test creating a new subtable
        self.userDb.subTable(testTable.name, testTable, function () {
            console.log(" - Created new users subtable");
            self.isRunning = false;
            return;
        })
    }
    
    testCreateUser(self) {
        var tableName = "users";
        
        self.userDb.insert(tableName, {userName: "user", firstName: "Test", lastName: "Dummy", password: "password", email:"test@dummy.com"}, function (err, newDoc) {
            if (err) {
                console.log("- Error writing: " + err.errorType);
            } else {
                console.log("- Wrote data: " + JSON.stringify(newDoc));
            }
            self.isRunning = false;
            return;
        });
    }    
}

module.exports = TestManager;