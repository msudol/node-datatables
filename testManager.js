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
        this.userManager = new UserManager(this.db, this.userDb, "users");
        return this;
    }

    init(callback) {   
        var self = this;
        self.testList = [self.testRootTableName, self.testNewSubTable1, self.testRootTableDocs, self.testDropTable, self.testRootTableDocs, self.testNewSubTable2, self.testNewSubTable3, self.testWriteTable, self.testRootTableDocs, self.testNewSubTableWrite, self.testTableAllowedFields, self.testGetAllFromTable, self.testNewUserSubTable, self.testCreateUser, self.testUpdateUser, self.testViewUser, self.testVerifyUser, self.testAllowedAccess];
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

    // test list the root table docs - repeated test
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
    
    // test creating a new subtable test 1
    testNewSubTable1(self) {
        var group = {};
        group.users = {
            query: true, 
            insert: true,
            update: true,
            remove: true,
            create: false,
            drop: false,
        };
        group.admins = {
            query: true, 
            insert: true,
            update: true,
            remove: true,
            create: true,
            drop: true,
        };        
        
        var testTable = {name: 'test1', desc: 'Just a test', fields: ['key', 'val', 'etc'], unique: ['key'], group: group};
        console.log(" - Test creating table 1");
        // test creating a new subtable
        self.db.subTable(testTable.name, testTable, function () {
            console.log(" - Created new subtable");
            self.isRunning = false;
            return;
        })
    }
    
    // test drop table test1
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
        
    // this should fail because the table was dropped in a previous test
    testWriteTable(self) {
        // test writing to a sub table - this should fail if this already exists since this table has a unique key set
        console.log(" - Test writing table");
        self.db.insert("test1", {key:"hello ", val:"world", etc:"!"}, function (err, newDoc) {
            if (err) {
                console.log("- Error writing: " + err.errorType);
            } else {
                console.log("- Wrote data: " + JSON.stringify(newDoc));
            }
            self.isRunning = false;
            return;
        });    
    }
    
    // test creating a new subtable test2 
    testNewSubTable2(self) {
        var group = {};
        group.users = {
            query: true, 
            insert: true,
            update: true,
            remove: true,
            create: false,
            drop: false,
        };
        group.admins = {
            query: true, 
            insert: true,
            update: true,
            remove: true,
            create: true,
            drop: true,
        };        
        var testTable = {name: 'test2', desc: 'Another test table', fields: ['key', 'val', 'etc'], unique: ['key'], group: group};
        console.log(" - Test creating table test 2");
        // test creating a new subtable
        self.db.subTable(testTable.name, testTable, function () {
            console.log(" - Created new subtable");
            self.isRunning = false;
            return;
        })
    }
    
    // test creating a new subtable test2 
    testNewSubTable3(self) {
        var group = {};
        group.admins = {
            query: true, 
            insert: true,
            update: true,
            remove: true,
            create: true,
            drop: true,
        };
        var testTable = {name: 'adminOnly', desc: 'An admin only table', fields: ['key', 'val', 'etc'], unique: ['key'], group: group};
        console.log(" - Test creating table test 3");
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
        self.db.insert("test2", {key:"unique", val:"testing", etc:"once"}, function (err, newDoc) {
            if (err) {
                console.log("- Error writing: " + err.errorType);
            } else {
                console.log("- Wrote data: " + JSON.stringify(newDoc));
            }
            
            // try writing another to the unique key - key in this table
            self.db.insert("test2", {key:"unique", val:"testing", etc:"twice"}, function (err, newDoc) {
                if (err) {
                    console.log("- Error writing: " + err.errorType);
                } else {
                    console.log("- Wrote data: " + JSON.stringify(newDoc));
                }
                self.db.insert("adminOnly", {key:"permission", val:"denied", etc:"maybe"}, function (err, newDoc) {
                    if (err) {
                        console.log("- Error writing: " + err.errorType);
                    } else {
                        console.log("- Wrote data: " + JSON.stringify(newDoc));
                    }
                    self.isRunning = false;
                    return;
                }); 
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
        var tableName = "test2";
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
        var testTable = {name: 'users', fields: ["userName","firstName","lastName","password","email","group","salt"], unique: ["userName"], group: ['admins']};
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
        self.userManager.createUser("user","Test","Dummy","password","test@dummy.com",['users'], {}, function(err, newDoc) {
            console.log("Creating user 1");
            if (err) {
                console.log(" - Error writing: " + err.errorType);
            } else {
                console.log(" - Wrote data: " + JSON.stringify(newDoc));
            }
            
            // create another user in the callback
            self.userManager.createUser("user2","Test","Dummy","password","test@dummy.com",['users'], {}, function(err, newDoc) {
                console.log("Creating user 2");
                if (err) {
                    console.log(" - Error writing: " + err.errorType);
                } else {
                    console.log(" - Wrote data: " + JSON.stringify(newDoc));
                }
                
                // create an admin user in the callback
                self.userManager.createUser("admin","Test","Dummy","password","test@dummy.com",['users','admins'], {}, function(err, newDoc) {
                    console.log("Creating user 3");
                    if (err) {
                        console.log(" - Error writing: " + err.errorType);
                    } else {
                        console.log(" - Wrote data: " + JSON.stringify(newDoc));
                    }
                    
                    //end test
                    self.isRunning = false;
                    return;
                }); 
            }); 
        });   
    }
    
    // test updating a user - this seems to duplicate the user - does NEDB clear out the old one at some point?
    testUpdateUser(self) {
        console.log(" - Test updating user info");
        self.userManager.updateUser("user", {firstName: "Bob", lastName: "Jones"}, function(err, numReplaced) {
            if (err) {
                console.log(" - Error writing: " + err.errorType);
            } else {
                console.log(" - Wrote data to # of docs : " + numReplaced);
            }
            self.isRunning = false;
            return;
        });   
    }
    
    testViewUser(self) {
        console.log(" - Test view user");
        self.userManager.viewUser("user", function(err, doc) {
            if (err) {
                console.log(" - Error viewing user: " + err.errorType);
            } else {
                console.log(" - User Data : " + JSON.stringify(doc));
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
    
    // test the users access to tables in the root table
    testAllowedAccess(self) {
        console.log(" - Test allowed access");
        self.userManager.allowedAccess("user", function(err, docs) {
            if (err) {
                console.log(" - Error viewing user: " + err.errorType);
            } else {
                console.log(" - User Data : " + JSON.stringify(docs));
            }
            // end test
            self.isRunning = false;
            return;            
        });
    }    
}

module.exports = TestManager;