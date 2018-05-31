/* tableManager.js 
* 
* Class will manage tables / documents
* 
* Initially this is built for nedb but should eventually support mongo too
*/
"use strict";

// require nedb or mongo
var Datastore = require('nedb');
var fs = require('fs');

class TableManager {
    
    constructor(rootName, tables, path, type) {
        this.rootName = rootName;
        this.tables = tables;
        this.path = path || 'db';
        // type will default to nedb if mongodb is not defined
        this.type = type || 'nedb';
        this.db = {}; 
        this.logging = false;
        return this; 
    }
    
    // function to init the table manager
    init(callback, logging) {
        var self = this;
        var callback = callback;
        this.logging = logging || false;
        
        // root instance will contain all the table references
        this.db[this.rootName] = new Datastore({filename: this.path + '/' + this.rootName + '.db', autoload: true});
        // Using a unique constraint with the index for root table names (filename)
        this.db[this.rootName].ensureIndex({ fieldName: 'name', unique: true }, function (err) {
            if (err) {
                console.error(err);
            }
        });
        
        var i = 0;
        for (var t = 0; t < this.tables.length; t++) { 
            // call subtable create function
            this.subTable(this.tables[t].name, this.tables[t], function(done) {
                //console.log(i);
                i++;
                // the last subtable has finished initializing
                if (i >= self.tables.length) {
                    return callback();        
                }
            });   
        } 
    }
    
    /**
     * Create a sub table 
     * @param   {string} tableName [A unique table name]
     * @param   {object}   tableObj  [The table object to create, expects {name: str, fields: array, unique: array}]
     * @param   {function} callback  [Callback Function]
     * @returns {function} [Callback Function]
     */
    subTable(tableName, tableObj, callback) {  
        var self = this;
        var tableName = tableName;
        var tableObj = tableObj;
        var callback = callback;
        
        // inspect the root table
        this.db[this.rootName].find({name: tableName}, function(err, docs) {
            if (err) {
                console.error(err);
            }
            
            // create the new subtable
            self.db[tableName] = new Datastore({filename: 'db/' + tableName + '.db', autoload: true});
            
            // if the table object has a unique field, make some fields be unique.
            if ((tableObj.unique !== undefined) && (tableObj.unique.length > 0)) {
                for (var i = 0; i < tableObj.unique.length; i++) {
                    // ensure index on any fields that are to be unique
                    self.db[tableName].ensureIndex({ fieldName: tableObj.unique[i], unique: true }, function (err) {
                        if (err) {
                            console.error(err);
                        }
                    });
                }
            }
            
            // no doc reference in the root database was found - need to create the table for tracking
            if (docs.length == 0) {
                self.db[self.rootName].insert(tableObj, function (err, newDoc) {   
                    // init the datastore for this table.name into the root tracking if exists OR create it
                    if (err) {
                        console.error(err);
                    }
                    console.log("Creating sub table: " + tableName);
                    return callback();
                });     
            }
            else {
                console.log("Initializing sub table: " + tableName);
                return callback();
            }
            
        });    
    }
    
    // extend the nedb/mongo find function for tableMan class
    find(tableName, findStr, callback) {   
        var self = this;
        
        self.db[tableName].find(findStr, function(err, docs) {
            if (err) {
                console.error(err);
            }   
            if (self.logging) console.log("Searching " + tableName + " for " + JSON.stringify(findStr) + ": Found " + docs.length + " docs.");
            return callback(err, docs);
        }); 
    }
    
    // extend nedb to drop a database (may not need for mongo) 
    drop(tableName, callback) {
        var self = this;
        var tableName = tableName;
        var callback = callback;
        
        this.db[tableName].remove({ }, { multi: true }, function (err, numRemoved) {
            if (err) {
                console.error(err);
            }             
            self.db[tableName].loadDatabase(function (err) {
                if (err) {
                    console.error(err);
                }   
                
                // now remove the file
                fs.unlink(self.path + "/" + tableName + ".db", function(err) {
                    if (err) throw err;
                });
                
                // remove root table reference
                self.db[self.rootName].remove({name: tableName}, {}, function(err, numRemoved) {
                    // done?
                    return callback(err, numRemoved, tableName);
                });
                
            });
        });
    }
    
    // need to write to a table, data, with a return function
    write(tableName, data, callback) {
        var data = data;
        var callback = callback;
        this.db[tableName].insert(data, function(err, newDoc) {

            if (err) {
                console.error(err);
            } 
            //TODO: query the root table and reject fields that are not allowed
            return callback(err, newDoc);
        });
    }

    // assumes tablename is going to be unique from setting indexing and returns the fields key.
    allowedFields(tableName, callback) {
        var tableName = tableName;
        console.log("Checking allowed fields for: " + tableName);
        this.db[this.rootName].find({name: tableName}, function(err, docs) {   
            return callback(err, docs[0].fields);
        });  
    }
    
}

module.exports = TableManager;
