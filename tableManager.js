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
    
    /**
     * @constructor A new instance of TableManager
     * @param   {string} rootName name of root the table
     * @param   {object} tables   object containing tables to initialize, set to false to initialize from the filesystem
     * @param   {string} path     path of the table
     * @param   {string} type     nedd
     * @returns {object} Reference to this.
     */
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
    
    /**
     * @function Initialize the table manager
     * @param {function} callback Callback function
     * @param {boolean}  logging  Set logging state
     */
    init(callback, logging) {
        var self = this;
        var callback = callback;
        this.logging = logging || false;
        
        if (self.logging) console.log("Initializing TableManager for: " + self.path + "/" + self.rootName);
        
        // root instance will contain all the table references
        this.db[this.rootName] = new Datastore({filename: self.path + '/' + self.rootName + '.db', autoload: true});
        
        // Using a unique constraint with the index for root table names (filename)
        this.db[this.rootName].ensureIndex({ fieldName: 'name', unique: true }, function (err) {
            if (err) {
                console.error(err);
            } else {
                if (self.logging) console.log("Ensure Index: Complete");
            }
            // inspect the tables
            self.inspectTables(callback, logging);
        });
    }
    
    // called by init to inspect tables after ensuring the index.
    inspectTables(callback, logging) {
        var self = this;
        var callback = callback;
        this.logging = logging || false;
        
        // the tables param is sent as false - use root table listing of tables instead
        if (!this.tables) {
            if (self.logging) console.log("Inspecting Subtables from root.");
            self.db[this.rootName].find({}, function(err, docs) {
                if (err) {
                    console.error(err);
                } 
                if (docs.length === 0) {
                    if (self.logging) console.log(self.path + '/' + self.rootName + " done initializing, running callback");
                    return callback();                           
                } else {
                    var i = 0;
                    for (var t = 0; t < docs.length; t++) {
                        self.subTable(docs[t].name, docs[t], function(done) {
                            i++;
                            // the last subtable has finished initializing
                            if (i >= docs.length) {
                                if (self.logging) console.log(self.path + '/' + self.rootName + " done initializing, running callback");
                                return callback();        
                            }
                        });                       
                    } 
                }
            }); 
        } 
        // tables were sent as a javascript object
        else {
            if (self.logging) console.log("Inspecting Subtables from default tables.");
            if (self.tables.length === 0) {
                if (self.logging) console.log(self.path + '/' + self.rootName + " done initializing, running callback");
                return callback();                           
            } else {       
                var i = 0;
                for (var t = 0; t < self.tables.length; t++) { 
                    // call subtable create function
                    self.subTable(self.tables[t].name, self.tables[t], function(done) {
                        i++;
                        // the last subtable has finished initializing
                        if (i >= self.tables.length) {
                            if (self.logging) console.log(self.path + '/' + self.rootName + " done initializing, running callback");
                            return callback();        
                        }
                    });   
                }
            }
        }        
    }
    
    /**
     * Create a sub table 
     * @param   {string} tableName - A unique table name
     * @param   {object}   tableObj - The table object to create, expects {name: str, fields: array, unique: array, group: object, settings: object}
     * @param   {function} callback - Callback Function
     * @returns {function} - Callback Function
     */
    subTable(tableName, tableObj, callback) {  
        var self = this;
        var tableName = tableName;
        var callback = callback;
        
        // inspect the tableObj and deny it, if it fails the required data
        if ((!tableObj.name) || (!tableObj.desc) || (!tableObj.fields) || (!tableObj.unique) || (!tableObj.group) || (!tableObj.settings)) {
            console.log("Cannot create subtable without required fields.");
            return;
        }
        
        // inspect the root table
        this.db[this.rootName].find({name: tableName}, function(err, docs) {
            if (err) {
                console.error(err);  
            }
            
            // create the new subtable
            self.db[tableName] = new Datastore({filename: self.path + '/' + tableName + '.db', autoload: true});
            
            // if the table object has a unique field, make some fields be unique.
            if ((tableObj.unique !== undefined) && (tableObj.unique.length > 0)) {
                for (var i = 0; i < tableObj.unique.length; i++) {
                    // ensure index on any fields that are to be unique
                    self.db[tableName].ensureIndex({ fieldName: tableObj.unique[i], unique: true }, function (err) {
                        if (err) {
                           if (err.errorType == "uniqueViolated") {
                                console.error(err.errorType);
                            } else {                  
                                console.error(err);
                            }
                        } 
                    });
                }
            }
            
            // no doc reference in the root database was found - need to create the table for tracking
            if (docs.length === 0) {
                self.db[self.rootName].insert(tableObj, function (err, newDoc) {   
                    // init the datastore for this table.name into the root tracking if exists OR create it
                    if (err) {
                       if (err.errorType == "uniqueViolated") {
                            console.error(err.errorType);
                        } else {                  
                            console.error(err);
                        }
                    } 
                    if (self.logging) console.log("Creating sub table: " + tableName);
                    return callback();
                });     
            }
            else {
                if (self.logging) console.log("Initializing sub table: " + tableName);
                return callback();
            }
            
        });    
    }
    
    // extend the nedb/mongo find function for tableMan class
    find(tableName, query, callback) {   
        var self = this;
        
        if (this.db[tableName] === undefined) {
            return callback("Table doesn't exist!", []);
        }
        
        self.db[tableName].find(query, function(err, docs) {
            if (err) {
                console.error(err);
            }   
            if (self.logging) console.log("Searching " + tableName + " for " + JSON.stringify(query) + ": Found " + docs.length + " docs.");
            return callback(err, docs);
        }); 
    }
    
    // extend nedb to drop a database (may not need for mongo) 
    drop(tableName, callback) {
        var self = this;
        var tableName = tableName;
        var callback = callback;
        
        if (this.db[tableName] === undefined) {
            return callback("Table doesn't exist!", 0, tableName);
        }
        
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
    
    // need to insert to a table, data, with a return function
    insert(tableName, data, callback) {
        var self = this;
        var data = data;
        var callback = callback;
        
        if (this.db[tableName] === undefined) {
            return callback("Table doesn't exist!", []);
        }
        
        this.db[tableName].insert(data, function(err, newDoc) {
            if (err) {
               if (err.errorType == "uniqueViolated") {
                    console.error(err.errorType);
                } else {                  
                    console.error(err);
                }
            } 
            //TODO: query the root table and reject fields that are not allowed
            return callback(err, newDoc);
        });
    }

    // need to insert to a table, data, with a return function
    update(tableName, query, data, options, callback) {
        var self = this;
        var data = data;
        var callback = callback;
        
        if (this.db[tableName] === undefined) {
            return callback("Table doesn't exist!", 0);
        }
        
        this.db[tableName].update(query, data, options, function(err, numReplaced) {

            if (err) {
               if (err.errorType == "uniqueViolated") {
                    console.error(err.errorType);
                } else {                  
                    console.error(err);
                }
            } 
            //TODO: query the root table and reject fields that are not allowed
            return callback(err, numReplaced);
        });
    }
    

    // need to remove info from a table, with a return function
    remove(tableName, query, callback) {
        var self = this;
        var data = data;
        var callback = callback;
        
        if (this.db[tableName] === undefined) {
            return callback("Table doesn't exist!", 0);
        }
        
        this.db[tableName].remove(query, {multi: true}, function(err, numReplaced) {
            if (err) {          
                console.error(err);
            }
            return callback(err, numReplaced);
        });
    }
    
    // assumes tablename is going to be unique from setting indexing and returns the fields key.
    // TODO: implement this in someway
    allowedFields(tableName, callback) {
        var self = this;
        var tableName = tableName;
        if (self.logging) console.log("Checking allowed fields for: " + tableName);
        
        if (this.db[tableName] === undefined) {
            return callback("Table doesn't exist!");
        }
        
        this.db[this.rootName].find({name: tableName}, function(err, docs) {   
            return callback(err, docs[0].fields);
        });  
    }
    
}

module.exports = TableManager;
