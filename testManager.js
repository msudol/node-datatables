/* tests.js 
* 
* Class will manage tests
* 
*/
"use strict";

class TestManager {

    constructor(db) {
        this.db = db;
        this.isRunning = false;
        return this;
    }

    init() {   
        console.log("Running Tests");
        var self = this;
        self.testList = [self.testRootTableName, self.testRootTableDocs, self.testDropTable, self.testRootTableDocs, self.testWriteTable, self.testNewSubTable, self.testRootTableDocs, self.testNewSubTableWrite, self.testTableAllowedFields, self.testGetAllFromTable];
        self.runner(self.testList, 0);
    }
        
    // This will run tests in order
    runner(testList, curTest) { 
        var self = this;
        self.isRunning = true; 
        console.log("=== TEST RUNNER === TEST: " + curTest);
        self.testList[curTest](self);
        self.runnerCheck(testList, curTest, self);  
    }
    
    // recursive function to check if a test is running
    runnerCheck(testList, curTest, self) {    
        var isRunning = self.isRunning;
        
        if (isRunning) {
            setTimeout(function() {
                self.runnerCheck(testList, curTest, self);
            }, 100)
        }
        else {
            if ((curTest + 1) == testList.length) {
                console.log("=== Done tests! ===");
            }
            else {
                self.runner(testList, curTest + 1);
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
            console.log(" - Dropping " + tableName);
            self.isRunning = false;
            return;
        });  
    }
    
    testWriteTable(self) {
        // test writing to a sub table
        self.db.write("test3", {g:"hello ", h:"world", i:"!"}, function (err, newDoc) {
            console.log("- Wrote data: " + JSON.stringify(newDoc));
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
        self.db.write("test4", {key:"unique", h:"testing", i:"once"}, function (err, newDoc) {
            console.log("- Wrote data: " + JSON.stringify(newDoc));
            
            // try writing another to the unique key - key in this table
             self.db.write("test4", {key:"unique", h:"testing", i:"twice"}, function (err, newDoc) {
                console.log("- Wrote data: " + JSON.stringify(newDoc));
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
            for (var i = 0; i < docs.length; i++) {
                console.log(" - " + JSON.stringify(docs[i]));
            }
            self.isRunning = false;
            return;            
        })
    }
    
}

module.exports = TestManager;