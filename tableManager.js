/* tableManager.js 
* 
* Class will manage tables / documents
*/
"use strict";

// require nedb or mongo
var Datastore = require('nedb');

// require tableMaker class
var TableMaker = require('./tableMaker.js');

class TableManager {
    
    constructor(rootName, tables) {
        
        this.rootName = rootName;
        this.tables = tables;
        this.db = {};
        this.init();
        
    }
    
    init() {
        
        // root instance will contain all the table references
        this.db[this.rootName] = new Datastore({filename: 'db/' + this.rootName + '.db', autoload: true});
        
        // Using a unique constraint with the index for root table names (filename)
        this.db[this.rootName].ensureIndex({ fieldName: 'name', unique: true }, function (err) {
            //console.error(err);
        });
        
        for (var t = 0; t < this.tables.length; t++) { 
    
            new TableMaker(this.tables[t], this.db, this.rootName);

        }
        
        return this;
        
    }
    
}

module.exports = TableManager;
