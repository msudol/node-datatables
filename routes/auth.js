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
        
        this.handler = router;        
        var self = this;
       
        // middleware that is specific to this router
        this.handler.use(function(req, res, next) {
            //console.log("Checking Authorization");
            if (req.session && req.session.user === "user" && req.session.admin) {
                return next();
            } else {
                return res.sendStatus(401);
            }
        });
               
        //http://localhost:3000/private/login/?username=user&password=password
        this.handler.get('/login', function (req, res) {
          if (!req.query.username || !req.query.password) {
            res.send('login failed');    
          } else if (req.query.username === "user" || req.query.password === "password") {
              // this is ugly and will have to be better
            req.session.user = "user";
            req.session.admin = true;
            res.send("login success!");
          }
        });

        //http://localhost:3000/private/logout
        // Logout endpoint
        this.handler.get('/logout', function (req, res) {
            req.session.destroy(function() {
                res.send("logout success!");    
            });
        });

    }
    
}

module.exports = Auth;