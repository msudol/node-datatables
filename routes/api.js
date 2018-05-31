/* api.js 
* 
* Class will the api
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

        // find
        // api/find/test4/opts/{}
        this.handler.get('/find/:dbName/opts/:opts', function (req, res) {
            console.log(req.params);
            var dbName = req.params.dbName;
            var findStr = JSON.parse(req.params.opts);
            
            self.db.find(dbName, findStr, function(err, docs) {
                if (err) {
                    res.send('An error occurred!');
                } else {
                    var retDocs = "";
                    for (var i = 0; i < docs.length; i++) {
                        retDocs += " - " + JSON.stringify(docs[i]) + "<br>";
                    }
                    res.send(retDocs);
                }
            });  
        });
        
        // create subtable
        // api/create/{"name":"test5","fields":["time","temp"]}
        this.handler.get('/create/:opts', function (req, res) {
            console.log(req.params);
            var table = JSON.parse(req.params.opts);
            
            self.db.subTable(table.name, table, function(err, docs) {
                if (err) {
                    res.send('An error occurred!');
                } else {
                    res.send("Table created or initialized");
                }
            });  
        });
 
    }  
    
}

module.exports = Api;