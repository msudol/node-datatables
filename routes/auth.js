/* Auth.js 
* 
* Authorization handler
* 
*/
"use strict";

var express = require('express');
var router = express.Router();


class Auth {
    
    constructor(userDb) {
        
        // auth.handler will be the middleware we use in webserver for this private route
        this.userDb = userDb;
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
        console.log("Checking valid user: " + userName);
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
        
        self.userDb.find("users", { userName: userName }, function(err, docs) {   
            if (err) {
                console.error(err);
            }
            if (password == docs[0].password) {
                return success();
            }
            else {
                return failure();
            }
        }); 
    }
    
    init(callback) {
        var self = this;
        // create userlist 
        self.userDb.find("users", {}, function(err, docs) {           
            for (var i = 0; i < docs.length; i++) {
                self.userList.push(docs[i].userName);
            }
            console.log("Found users doc: " + self.userList);   
            return callback();
        });
    }
    
    handlers() {
        var self = this;
        /*** Important Note:  Login and Logout routes must supercede the authorization handler ***/
        
        //http://localhost:3000/<private>/login?username=user&password=password
        //TODO: improve security measures
        self.handler.get('/login', function (req, res) {
            if (!req.query.username || !req.query.password) {
                console.log("Missing username or password");
                res.send('login failed');    
            } else if (self.isValidUser(req.query.username)) {
                
                self.isValidPassword(req.query.username, req.query.password, function() {
                    console.log("Login failed, bad password");
                    res.send('login failed');                     
                }, function() {
                    // this is ugly and will have to be better
                    req.session.user = req.query.username;
                    req.session.loggedIn = true;
                    res.send("login success!"); 
                    console.log("Logging in with user: " + req.query.username);                    
                });
            } else {
                console.log("Login failed, bad user");
                res.send('login failed');     
            }
            
        });

        //http://localhost:3000/<private>/logout
        self.handler.get('/logout', function (req, res) {
            req.session.destroy(function() {
                res.send("logout success!");    
            });
        });
        
        // middleware that is specific to this router
        self.handler.use(function(req, res, next) {
            //console.log("Checking Authorization");
            if (req.session && self.isValidUser(req.session.user) && req.session.loggedIn) {
                return next();
            } else {
                return res.sendStatus(401);
            }
        });         
    }
    
}

module.exports = Auth;