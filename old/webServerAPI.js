/* webServerAPI.js 
* 
* Handle API calls
* 
* This will serve the web client to interface with the database
*/
"use strict";

var express = require('express');
var router = express.Router();

// yes it's a class for the webserver, why? I don't know yet but we'll see.
class ApiHandler {
    
    constructor() {
        console.log("API Handler Initialized");  
        
        router.use(function (req, res, next) {
          console.log('Time:', Date.now());
          next();
        })
        
        
    }
    
    handler() {
        return function(req, res, next) {
            router.get('/', function (req, res) {
                console.log("API Handler fielding request!");
                res.send('hello, user!');
            }); 
        }
    }
    
}

module.exports = ApiHandler;