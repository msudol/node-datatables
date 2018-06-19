/* checkSess 
* 
* The plan with this is to know on the public routes, if a user is logged in - it's basically auth.js at this point and needs work
*
* TODO: Check for authorization on the public routes (return session info if exists)
* 
*/
"use strict";

var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
// for future var LdapAuth = require('ldapauth-fork');

var UserManager = require('../userManager.js');

class CheckSess {
    
    constructor(userDb, userTableName) {
        // auth.handler will be the middleware we use in webserver for this private route
        this.userDb = userDb;
        this.userTableName = userTableName;
        this.userManager = new UserManager(this.userDb, this.userTableName);
        this.handler = router;   
        this.userList = [];
        var self = this;
        // initialize some things
        this.init(function() {
            // setup handlers AKA routes and middleware
            self.handlers();
        });
    }
    
    // very simple valid user check
    isValidUser(userName) {
        var self = this;
        //console.log("Checking valid user: " + userName);
        var validUsers = self.userList;
        if (validUsers.includes(userName)) {
            return true;
        } else {
            return false;
        }
    }
    
    // simple check for user / pass combo
    isValidPassword(userName, password, failure, success) {
        var self = this;
        
        // call the verify user routine
        self.userManager.verifyUser(userName, password, function(err, isTrue) {
            if (err) {
                console.error(err);
            }            
            if (isTrue) {
                return success();
            } else {
                return failure();
            }          
        });     
        
    }
    
    init(callback) {
        var self = this;
        // create userlist 
        self.userDb.find(self.userTableName, {}, function(err, docs) {           
            for (var i = 0; i < docs.length; i++) {
                self.userList.push(docs[i].userName);
            } 
            return callback();
        });
    }
    
    handlers() {
        var self = this;
        
        // need to handle post requests
        self.handler.use(bodyParser.urlencoded({ extended: false }));
        self.handler.use(bodyParser.json());
        
        /*** Important Note:  Login and Logout routes must supercede the authorization handler ***/

        // login only with post function
        self.handler.post('/login', function (req, res) {
            //console.log("Handling post login for: " + JSON.stringify(req.body));
            if (!req.body.username || !req.body.password) {
                console.log("Missing username or password");
                //res.status(401);    
                res.send("Login failed");   
            } else if (self.isValidUser(req.body.username)) { 
                self.isValidPassword(req.body.username, req.body.password, function() {
                    console.log("Login failed, bad password");
                    //res.status(401);    
                    res.send("Login failed");   
                }, function() {
                    // this is ugly and will have to be better
                    req.session.user = req.body.username;
                    req.session.loggedIn = true;
                    console.log("Logging in with user: " + req.body.username);                       
                    res.send({redirect: '/client'});
                });
            } else {
                console.log("Login failed, bad user");
                //res.status(401);    
                res.send("Login failed");                
            }
        });
        
        //http://localhost:3000/<private>/logout
        self.handler.all('/logout', function (req, res) {
            req.session.destroy(function() {
                //res.send("logout success!");  
                res.redirect(301, '/');
            });
        });
        
        // middleware that is specific to this router
        self.handler.use(function(req, res, next) {
            // check the session for the value loggedIn 
            if (req.session && self.isValidUser(req.session.user) && req.session.loggedIn) {
                // do something for valid users
                next();
            } else {
                // do something for anon users
                next();
            }
        });         
    }
    
}

module.exports = CheckSess;