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
// yes it's a class for the webserver, why? I don't know yet but we'll see.
class WebServer {
    
    constructor(db) {
        
        this.db = db;
        this.app = app;
        this.router = router; 
        
        this.api = new Api(this.db);
        
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
   
        /*** TESTING AUTH - move to a submodule at some point ***/
        
        // Authentication and Authorization Middleware
        var auth = function(req, res, next) {
            console.log("Checking Authorization");
            if (req.session && req.session.user === "user" && req.session.admin) {
                return next();
            } else {
                return res.sendStatus(401);
            }
        };

        // Login endpoint - uses a get query at the moment - http://localhost:3000/login/?username=user&password=password
        app.get('/login', function (req, res) {
          if (!req.query.username || !req.query.password) {
            res.send('login failed');    
          } else if (req.query.username === "user" || req.query.password === "password") {
              // this is ugly and will have to be better
            req.session.user = "user";
            req.session.admin = true;
            res.send("login success!");
          }
        });

        // Logout endpoint
        app.get('/logout', function (req, res) {
          req.session.destroy();
          res.send("logout success!");
        });

        
        // serve static files from the public folder at /   
        this.app.use(express.static('public'));      
        
        // Get content endpoint
        app.use( "/private", [ auth, express.static( __dirname + "/private" ) ] );      
        
        
        /*** END AUTH TEST ***/
        
        
        
        // the api route handler
        this.app.use('/api', this.api.handler); 
        
        // get /test custom route
        this.app.get('/test', (req, res) => res.send('Hello World!'));
        
        // start the server
        this.app.listen(3000, () => console.log('Example app listening on port 3000!')); 
        
    }
    
}

                
module.exports = WebServer;