/* Auth.js 
* 
* Authorization handler
* 
*/
"use strict";

var express = require('express');
var router = express.Router();


class Auth {
    
    constructor() {
        
        // auth.handler will be the middleware we use in webserver for this private route
        this.handler = router;        
        var self = this;
           
        /*** Important Note:  Login and Logout routes must supercede the authorization handler ***/
        
        //http://localhost:3000/<private>/login?username=user&password=password
        this.handler.get('/login', function (req, res) {
            if (!req.query.username || !req.query.password) {
                res.send('login failed');    
            } else if (self.isValidUser(req.query.username) || req.query.password === "password") {
                // this is ugly and will have to be better
                req.session.user = req.query.username;
                req.session.loggedIn = true;
                res.send("login success!");
                
            } else {
                res.send('login failed');     
            }
            console.log("Logging in with user: " + req.query.username);
        });

        //http://localhost:3000/<private>/logout
        this.handler.get('/logout', function (req, res) {
            req.session.destroy(function() {
                res.send("logout success!");    
            });
        });
        
        // middleware that is specific to this router
        this.handler.use(function(req, res, next) {
            console.log("Checking Authorization");
            if (req.session && self.isValidUser(req.session.user) && req.session.loggedIn) {
                return next();
            } else {
                return res.sendStatus(401);
            }
        });        
    }
    
    // very simple valid user check
    isValidUser(userName) {
        console.log("Checking valid user: " + userName);
        var validUsers = ["user", "test", "admin"];
        if (validUsers.includes(userName)) {
            return true;
        } else {
            return false;
        }
    }
    
}

module.exports = Auth;