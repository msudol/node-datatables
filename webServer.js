/* expressServ.js 
* 
* Setup express web server
* 
* This will serve the web client to interface with the database
*/
"use strict";

var express = require('express');
var ex = express();

// yes it's a class for the webserver, why? I don't know yet but we'll see.
class WebServer {
    
    constructor() {
        ex.get('/', (req, res) => res.send('Hello World!'));
        ex.listen(3000, () => console.log('Example app listening on port 3000!'));
    }
    
}

module.exports = WebServer;