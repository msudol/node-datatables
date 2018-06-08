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

// for encrypting at some point
var crypto = require('crypto');

// connect the NedbStore to session
var NedbStore = require('nedb-session-store')(session);

var router = express.Router();
var TableApi = require('./routes/tableApi');
var Auth = require('./routes/auth');
var CheckSess = require('./routes/checkSess');

// yes it's a class for the webserver, why? I don't know yet but we'll see.
class WebServer {
    
    constructor(port, db, userDb) {
        
        this.port = port;
        this.db = db;
        this.userDb = userDb;
        this.app = app;
        this.router = router; 
        
        // this feels bloated now
        this.tableApi = new TableApi(this.db);
        this.auth = new Auth(this.userDb);
        this.checkSess = new CheckSess(this.userDb);
        
        this.app.use(
            session({
                secret: sharedSecretKey,
                resave: false,
                saveUninitialized: false,
                cookie: {
                    path: '/',
                    httpOnly: true,
                    //maxAge: 365 * 24 * 60 * 60 * 1000   // e.g. 1 year
                    maxAge: 24 * 60 * 60 * 1000,   // e.g. 1 year
                    secure: false,        // set to true to ensure only usable over https
                    ephemeral: true     // deletes cookie when browser is closed        
                },
                store: new NedbStore({
                    filename: 'sess/nedb_persistence_file.db'
                })
            })
        );
   
        // Create a private endpoint that requires authentication with session handling using express-session and session-nedb-store    
        this.app.use( '/client', [ this.auth.handler, express.static( __dirname + '/client' ) ] );   
        
        // serve static files from the public folder at /   
        this.app.use( [ this.checkSess.handler, express.static('public') ] );      

        // the api route handler - only allow the api if  authorized
        this.app.use( '/api', [ this.auth.handler, this.tableApi.handler ] ); 
       
    }
    
    init() {
        // start the server
        this.server = this.app.listen(this.port, () => console.log('Example app listening on port 3000!'));         
    }
    
    stop() {
        // stop the server - could be useful
        this.server.close();
    }
    
}

                
module.exports = WebServer;