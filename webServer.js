/* webServer.js 
* 
* Setup express web server
* 
* This will serve the web client to interface with the database
*/
"use strict";

// trying out some session storage
var sharedSecretKey = 'simplesecret';
// let's get sessions now
var session = require('express-session');
// can't have a webserver without express
var express = require('express');
var app = express();

// connect the NedbStore to session
var NedbStore = require('nedb-session-store')(session);

var router = express.Router();
var Api = require('./routes/api');
var Auth = require('./routes/auth');

// yes it's a class for the webserver, why? I don't know yet but we'll see.
class WebServer {
    
    constructor(db) {
        
        this.db = db;
        this.app = app;
        this.router = router; 
        
        this.api = new Api(this.db);
        this.auth = new Auth();
        
        this.app.use(
            session({
                secret: sharedSecretKey,
                resave: false,
                saveUninitialized: false,
                cookie: {
                    path: '/',
                    httpOnly: true,
                    maxAge: 365 * 24 * 60 * 60 * 1000   // e.g. 1 year
                },
                store: new NedbStore({
                    filename: 'sess/nedb_persistence_file.db'
                })
            })
        );
   
        // Create a private endpoint that requires basic authentication with session handling using express-session and session-nedb-store
        this.app.use( "/private", [ this.auth.handler, express.static( __dirname + "/private" ) ] );   
        
        // serve static files from the public folder at /   
        this.app.use(express.static('public'));      

        // the api route handler
        this.app.use('/api', this.api.handler); 
        
        // get /test custom route
        this.app.get('/test', (req, res) => res.send('Hello World!'));
        
        // start the server
        this.app.listen(3000, () => console.log('Example app listening on port 3000!')); 
        
    }
    
}

                
module.exports = WebServer;