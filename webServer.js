/* webServer.js 
* 
* Setup express web server
* 
* This will serve the web client to interface with the database
*/
"use strict";

// let's get sessions now
var session = require('express-session');
// can't have a webserver without express
var express = require('express');
// instance of express web server
var app = express();
// for encrypting stored passwords
var crypto = require('crypto');
// connect the NedbStore to session
var NedbStore = require('nedb-session-store')(session);
// instance of express router for routes
var router = express.Router();

// get our routes
var TableApi = require('./routes/tableApi');
var Auth = require('./routes/auth');
var CheckSess = require('./routes/checkSess');

// yes it's a class for the webserver, why? I don't know yet but we'll see.
class WebServer {
    
    constructor(config, db, userDb) {
        var self = this;
        this.config = config;
        this.port = config.port;
        this.db = db;
        this.userDb = userDb;
        this.app = app;
        this.router = router; 
        
        // this feels bloated now
        this.tableApi = new TableApi(this.db, this.userDb, "users");
        
        // send the tableName that users are stored in, in this instance of the server
        this.auth = new Auth(this.db, this.userDb, "users");
        this.checkSess = new CheckSess(this.db, this.userDb, "users");
        this.app.use(
            session({
                secret: self.config.session.sharedSecretKey,
                resave: false,
                saveUninitialized: false,
                cookie: {
                    path: '/',
                    httpOnly: true,
                    //maxAge: 24 * 60 * 60 * 1000,   //maxAge: 24 * 60 * 60 * 1000   // e.g. 1 day
                    //maxAge: 5 * 60 * 1000, // 5 minutes for testing
                    secure: false,        // set to true to ensure only usable over https
                    ephemeral: true,     // deletes cookie when browser is closed  - can't have ephemeral AND maxAge apparently      
                    sameSite: true      // enforce same site
                },
                store: new NedbStore({
                    filename: 'sess/nedb_persistence_file.db'
                })
            })
        );
   
        // Create a private endpoint that requires authentication with session handling using express-session and session-nedb-store    
        this.app.use( '/client', [ this.auth.handler, express.static( __dirname + '/client' ) ] );   
        
        // serve static files from the public folder at / and run it through the checkSess handler 
        this.app.use( [ this.checkSess.handler, express.static('public') ] );      

        // the api route handler - only allow the api if  authorized
        this.app.use( '/api', [ this.auth.handler, this.tableApi.handler ] ); 
       
    }
    
    init() {
        // start the server
        this.server = this.app.listen(this.port, () => console.log('Example app listening on port: ' + this.port));         
    }
    
    stop() {
        // stop the server - could be useful
        this.server.close();
    }
    
}
            
module.exports = WebServer;
