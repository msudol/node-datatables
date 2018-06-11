/* tests.js 
* 
* Class will manage tests
* 
*/
"use strict";

// import TableManager class 
var UserManager = require('./userManager.js');

class TestManager {

    constructor(db, userDb) {
        this.db = db;
        this.userDb = userDb;
        this.isRunning = false;
        // for the users table
        this.userManager = new UserManager(this.userDb, "users");
        return this;
    }

    init(callback) {   
        var self = this;
        self.testList = [self.testRootTableName, self.testRootTableDocs, self.testDropTable, self.testRootTableDocs, self.testWriteTable, self.testNewSubTable, self.testRootTableDocs, self.testNewSubTableWrite, self.testTableAllowedFields, self.testGetAllFromTable, self.testNewUserSubTable, self.testCreateUser, self.testUpdateUser, self.testVerifyUser];
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
    
    // test list the root table docs
    testRootTableDocs(self) { 
        // get the root table docs
        console.log(" - Current tables managed: ");
        self.db.find(self.db.rootName, {}, function (err, docs) {
            // fails if tables need to be created because of aSync but works if they already exist
            for (var i = 0; i < docs.length; i++) {
                console.log(" - " + docs[i].name);
            }
            self.isRunning = false;
            return;
        }); 
    }
    
    // test dropping a table
    testDropTable(self) {
        console.log(" - Test dropping table");
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
        console.log(" - Test writing table");
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
    
    // test creating a new subtable
    testNewSubTable(self) {
        var testTable = {name: 'test4', fields: ['key', 'val', 'derp'], unique: ['key']};
        console.log(" - Test creating table");
        // test creating a new subtable
        self.db.subTable(testTable.name, testTable, function () {
            console.log(" - Created new subtable");
            self.isRunning = false;
            return;
        })
    }
    
    // test writing to a new subtable
    testNewSubTableWrite(self) {
        // test writing to a sub table
        console.log(" - Test new sub table writing")
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
    
    // test check the allowed fields in a table
    testTableAllowedFields(self) {
        console.log(" - Testing allowed fields");
        self.db.allowedFields("test2", function (err, fields) {
            console.log(" - " + fields);
            self.isRunning = false;
            return;
        });
    }
    
    // test getting all data from a table
    testGetAllFromTable(self) {
        var tableName = "test3";
        console.log(" - Test get all from table");
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
    
    // test creating the users sub table.
    testNewUserSubTable(self) {
        console.log(" - Test create new user table");
        
        var testTable = {name: 'users', fields: ["userName","firstName","lastName","password","email","group","salt"],"unique":["userName"]};
        // test creating a new subtable
        self.userDb.subTable(testTable.name, testTable, function () {
            console.log(" - Created new users subtable");
            self.isRunning = false;
            return;
        })
    }
    
    // test creating a user
    testCreateUser(self) {
        console.log(" - Test create new users");
        
        self.userManager.createUser("user","Test","Dummy","password","test@dummy.com","users", function(err, newDoc) {
            if (err) {
                console.log("- Error writing: " + err.errorType);
            } else {
                console.log("- Wrote data: " + JSON.stringify(newDoc));
            }
            
            // create another user
            self.userManager.createUser("user2","Test","Dummy","password","test@dummy.com","users", function(err, newDoc) {
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
    
    // test updating a user - this seems to duplicate the user - does NEDB clear out the old one at some point?
    testUpdateUser(self) {
        console.log(" - Test updating user info");

        self.userManager.updateUser("user", {firstName: "Bob", lastName: "Jones"}, function(err, numReplaced) {
            if (err) {
                console.log("- Error writing: " + err.errorType);
            } else {
                console.log("- Wrote data to # of docs : " + numReplaced);
            }
            self.isRunning = false;
            return;
        });   
    }
    
    // test verifying that a user is valid
    testVerifyUser(self) {
        console.log(" - Test verify user");
        
        self.userManager.verifyUser("user", "password", function(err, isTrue) {
            if (isTrue) {
                console.log("Yay!");
            } else {
                console.log("Bah.");
            }
            
            self.isRunning = false;
            return;            
        });
    }
}

module.exports = TestManager;