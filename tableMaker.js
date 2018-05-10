/* tableMaker.js 
* 
* Class will create tables / documents if they don't already exist.
*/

"use strict"

var Datastore = require('nedb');

class TableMaker {
    
    // arguments for table, and database to build it in
    constructor(table, db, rootName) {
        var self = this;
        this.table = table;
        this.db = db;
        this.rootName = rootName;
        this.init();
    }
    
    init() {
        
        var self = this;
        
        // how does this know to look at root?
        this.db[this.rootName].find({name: this.table.name}, function(err, docs) {
            
            // init the datastore for this table.name if exists OR create it
            self.db[self.table.name] = new Datastore({filename: 'db/' + self.table.name + '.db', autoload: true});
            
            // no docs were found - need to create the table
            if (docs.length == 0) {
                console.log("No document found for: " + self.table.name + " creating one!");
                self.db[self.rootName].insert(self.table, function (err, newDoc) {   
                    // no need for anything here we're just making the table
                });     
            }
            else if (docs.length == 1) {
                console.log("A document was found for: " + self.table.name + " time to party!");
            }
            else {
                console.log("Something went wrong");
            }
            
        });   
    }
    
};
                          
module.exports = TableMaker;                
