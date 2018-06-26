/* api.js 
* 
* A web API to extend the functions of NEDB.  The api functions behave and expect exactly what NEDB does
* 
*/
"use strict";

var express = require('express');
var router = express.Router();

var UserManager = require('../userManager.js');

class Api {
    
    constructor(db, userDb, userTableName) {
        this.handler = router;        
        this.db = db;
        this.userDb = userDb;
        this.userTableName = userTableName;
        this.userManager = new UserManager(this.db, this.userDb, this.userTableName);        
        var self = this;
        
        // middleware that is specific to this router
        this.handler.use(function timeLog (req, res, next) {
            console.log('Time: ', Date.now());
            next();
        });

        // define the home page route
        this.handler.get('/', function (req, res) {
            res.send('API home page');
        });

        // define the about route
        this.handler.get('/about', function (req, res) {
            res.send('About API');
        });

        // create subtable
        // api/create/{"name":"test5","desc":"A description",fields":["time","temp"]}
        // TODO: check api user "group" permission to find out if they are allowed to create
        this.handler.get('/create/:table', function (req, res) {
            console.log(req.params);
            var table = JSON.parse(req.params.table);
            
            self.db.subTable(table.name, table, function(err, docs) {
                if (err) {
                    if (err.errorType == "uniqueViolated") {
                        res.send('Cannot write a duplicate unique key!');
                    } else {  
                        res.send('An error occurred!');
                    }
                } else {
                    res.send("Table created or initialized");
                }
            });  
        });
        
        // find
        // api/find/test4/query/{}
        // TODO: check api user "group" permission and find out if they can see the table queried
        this.handler.get('/find/:dbName/query/:query', function (req, res) {
            console.log(req.params);
            var dbName = req.params.dbName;
            var query = JSON.parse(req.params.query);
            
            self.db.find(dbName, query, function(err, docs) {
                if (err) {
                    res.send('An error occurred!');
                } else {
                    res.send(docs);
                }
            });  
        });
        
        // specific find function to datatables - this needed to be changed so it should return a columns obj and a data obj
        // TODO: check api user "group" permission and find out if they can see the table queried
        this.handler.get('/dfind/:dbName/query/:query', function (req, res) {
            console.log(req.params);
            var dbName = req.params.dbName;
            var query = JSON.parse(req.params.query);

            //console.log(req.session);
            
            // querying the root server!
            if (dbName == self.db.rootName) {
                self.userManager.allowedAccess(req.session.user, function(err, docs) {
                    if (err) {
                        res.send('An error occurred!');
                    } else {
                        // send back a data obj
                        var columns = [];

                        var columnNames = Object.keys(docs[0]);
                        for (var i in columnNames) {
                            columns.push({data: columnNames[i], title: columnNames[i]});
                        }                    

                        var data = docs;
                        res.send({data: data, columns: columns});
                    } 
                });
            } else {                                 
                self.db.find(dbName, query, function(err, docs) {
                    if (err) {
                        res.send('An error occurred!');
                    } else {
                        // send back a data obj
                        var columns = [];

                        var columnNames = Object.keys(docs[0]);
                        for (var i in columnNames) {
                            columns.push({data: columnNames[i], title: columnNames[i]});
                        }                    

                        var data = docs;
                        res.send({data: data, columns: columns});
                    }
                });  
            }
        });
            
        // insert
        // api/insert/test4/doc/{}
        // TODO: check api user "group" permission and find out if they are allowed to insert
        this.handler.get('/insert/:dbName/doc/:doc', function (req, res) {
            console.log(req.params);
            var dbName = req.params.dbName;
            var doc = JSON.parse(req.params.doc);
            
            self.db.insert(dbName, doc, function(err, newDoc) {
                if (err) {
                    if (err.errorType == "uniqueViolated") {
                        res.send('Cannot write a duplicate unique key!');
                    } else {  
                        res.send('An error occurred!');
                    }
                } else {
                    var retDocs = JSON.stringify(newDoc);
                    res.send(retDocs);
                }
            });  
        });
        
        
        // update
        // api/update/test4/query/{}/update/{}/opts/{}
        // TODO: check api user "group" permission and find out if they are allowed to update
        this.handler.get('/update/:dbName/query/:query/update/:update/opts/:opts', function (req, res) {
            console.log(req.params);
            var dbName = req.params.dbName;
            var query = JSON.parse(req.params.query);
            var update = JSON.parse(req.params.update);
            var opts = JSON.parse(req.params.opts) || {};
            
            self.db.update(dbName, query, update, opts, function(err, numReplaced) {
                if (err) {
                    if (err.errorType == "uniqueViolated") {
                        res.send('Cannot write a duplicate unique key!');
                    } else {  
                        res.send('An error occurred!');
                    }
                } else {
                    var retDocs = numReplaced;
                    res.send(retDocs);
                }
            });  
        });
            
    }  
    
}

module.exports = Api;