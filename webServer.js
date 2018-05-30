/* webServer.js 
* 
* Setup express web server
* 
* This will serve the web client to interface with the database
*/
"use strict";

var express = require('express');
var app = express();
var router = express.Router();

// import WebServer Class
var WebServerAPI = require('./webServerAPI.js');

// yes it's a class for the webserver, why? I don't know yet but we'll see.
class WebServer {
    
    constructor() {
        
        this.app = app;
        this.router = router; 
        
        this.api = require('./routes/api');
        
        // serve static files from the public folder at /
        this.app.use(express.static('public'));
   
        // the api route handler
        this.app.use('/api', this.api); 
        
        // get /test custom route
        this.app.get('/test', (req, res) => res.send('Hello World!'));
        
        // start the server
        this.app.listen(3000, () => console.log('Example app listening on port 3000!')); 
        
    }
    
}

                
module.exports = WebServer;