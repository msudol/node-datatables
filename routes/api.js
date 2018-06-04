/* api.js 
* 
* A web API to extend the functions of NEDB.  The api functions behave and expect exactly what NEDB does
* 
*/
"use strict";

var express = require('express');
var router = express.Router();

class Api {
    
    constructor(db) {
        this.handler = router;        
        this.db = db;
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
        // api/create/{"name":"test5","fields":["time","temp"]}
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
        this.handler.get('/find/:dbName/query/:query', function (req, res) {
            console.log(req.params);
            var dbName = req.params.dbName;
            var query = JSON.parse(req.params.query);
            
            self.db.find(dbName, query, function(err, docs) {
                if (err) {
                    res.send('An error occurred!');
                } else {
                    //var retDocs = "";
                    //for (var i = 0; i < docs.length; i++) {
                    //     retDocs += " - " + JSON.stringify(docs[i]) + "<br>";
                    //}
                    res.send(docs);
                }
            });  
        });
        
        //TODO: edit this find to data specifically tailored for datatables 
        // should return a columns obj and a data obj
        this.handler.get('/dfind/:dbName/query/:query', function (req, res) {
            console.log(req.params);
            var dbName = req.params.dbName;
            var query = JSON.parse(req.params.query);
            
            self.db.find(dbName, query, function(err, docs) {
                if (err) {
                    res.send('An error occurred!');
                } else {
                    // send back a data obj
                    var dtdocs = {data: docs};
                    res.send(dtdocs);
                }
            });  
        });
        
        
        // insert
        // api/insert/test4/doc/{}
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