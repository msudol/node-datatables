/* userManager.js 
* 
* User handler - will be able to create, edit, delete, and query users and user information
* particularly important for the webserver auth system to compare auth data against.
* 
* encyrption provided partly from this example https://gist.github.com/AndiDittrich/4629e7db04819244e843
*/
"use strict";

var _crypto = require('crypto');

class UserManager {
    
    /**
     * Initialize a session of user manager
     * @param   {object} db        the root table this instance is managing
     * @param   {object} userDb    the userDb table this instance is managing
     * @param   {string} tableName the table name
     * @returns {[[Type]]} [[Description]]
     */
    constructor(db, userDb, tableName) {
        this.db = db;
        this.userDb = userDb;
        this.tableName = tableName;
        this.masterKey = userDb.masterKey;
        
        if (this.masterKey === undefined) {
            console.error("No user database master key set. Exiting!");
            return process.kill(process.pid);
        }
    }

    /**
     * Encrypts text by given key
     * @param   {String} text       string that needs encrypting
     * @param   {Buffer} masterkey  a master key
     * @returns {String} encrypted text, base64 encoded
     */
    encrypt(text, masterkey){
        // random initialization vector
        const iv = _crypto.randomBytes(16);
        // random salt
        const salt = _crypto.randomBytes(64);
        // derive key: 32 byte key length - in assumption the masterkey is a cryptographic and NOT a password there is no need for
        // a large number of iterations. It may can replaced by HKDF
        const key = _crypto.pbkdf2Sync(masterkey, salt, 2145, 32, 'sha512');
        // AES 256 GCM Mode
        const cipher = _crypto.createCipheriv('aes-256-gcm', key, iv);
        // encrypt the given text
        const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
        // extract the auth tag
        const tag = cipher.getAuthTag();
        // generate output
        return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
    }

    /**
     * Decrypts text by given key
     * @param   {String} encdata   base64 encoded input data
     * @param   {Buffer} masterkey master key
     * @returns {String} decrypted (original) text
     */
    decrypt(encdata, masterkey){
        // base64 decoding
        const bData = Buffer.from(encdata, 'base64');
        // convert data to buffers
        const salt = bData.slice(0, 64);
        const iv = bData.slice(64, 80);
        const tag = bData.slice(80, 96);
        const text = bData.slice(96);
        // derive key using; 32 byte key length
        const key = _crypto.pbkdf2Sync(masterkey, salt , 2145, 32, 'sha512');
        // AES 256 GCM Mode
        const decipher = _crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(tag);
        // encrypt the given text
        const decrypted = decipher.update(text, 'binary', 'utf8') + decipher.final('utf8');
        return decrypted;
    }    
    
    /**
     * Create a new user in the users table
     * @param   {string}   userName  A unique username
     * @param   {string}   firstName First Name
     * @param   {string}   lastName  Last Name
     * @param   {string}   password  Password
     * @param   {string}   email     Email Address
     * @param   {Object}   group     Groups user belongs to
     * @param   {Object}   settings  User settings object                          
     * @param   {function} callback  Callback function
     * @returns {function} callback
     */
    createUser(userName, firstName, lastName, password, email, group, settings, callback) {
        var self = this;
        // make sure group is an array
        group = group instanceof Array ? group : [group];
        var enc = this.encrypt(password, self.masterKey);
        self.userDb.insert(self.tableName, {userName: userName, firstName: firstName, lastName: lastName, password: enc, email: email, group: group, settings: settings}, function (err, newDoc) {
            return callback(err, newDoc);
        });          
    }   
    
    // TODO
    // edit a user given username and the and opts object with what is being edited
    updateUser(userName, opts, callback) {
        var self = this;
        //opts can be {firstName, lastName, password, email, group, settings}
        
        // if pwd is set, encrypt and resave
        if ((opts.password !== undefined) && (opts.password !== null)) {
            var enc = this.encrypt(password, self.masterKey);
            opts.password = enc;
        }
        
        // tablename, the user, the data to update, empty object passed to db.update for options default, then callback func
        self.userDb.update(self.tableName, {userName: userName}, {$set: opts}, {}, function(err, numReplaced) {
            return callback(err, numReplaced);
        });
    }
    
    // view a user, will return the users details except password
    viewUser(userName, callback) {
        var self = this;

        self.userDb.find(self.tableName, {userName: userName}, function(err, docs) {
            if (err) {
                console.log("- Error finding docs");
                return callback(err, false);
            } else {
                // TODO - strip out password
                return callback(err, docs[0]);
            }
        });
    }
    
    // verifiy a user exists
    verifyUser(userName, password, callback) {
        var self = this;
        
        self.userDb.find(self.tableName, {userName: userName}, function(err, docs) {
            if (err) {
                console.log("- Error finding docs");
                 return callback(err, false);
            } else {
                if (password == self.decrypt(docs[0].password, self.masterKey)) {
                    console.log("Password verified");
                    return callback(err, true);
                } else {
                    console.log("Password failed");
                    return callback(err, false);
                }
            }
        });
    }
    
    // allowed tables returns access allowed for a given user based on the rootTable
    // should return an object containing query: true, insert: true, update: true, remove: true
    allowedTables(userName, callback) {
        var self = this;

        self.userDb.find(self.tableName, {userName: userName}, function(err, docs) {
            if (err) {
                console.log("- Error finding docs");
                return callback(err, docs);
            } else {
                if (docs[0]) {
                    //get this users group membersip from docs[0]
                    var groups = docs[0].group;
                    var settings = docs[0].settings;
                    // http://localhost:3000/api/find/root/query/{"$or":[{"group.users.query":true},{"group.admins.query":true}]}
                    var query = [];

                    // query access for the groups the user is in
                    for (var i = 0; i < groups.length; i++) { 
                        var str = '{"group.'+groups[i]+'.query":true}';
                        query.push(JSON.parse(str));
                    }

                    self.db.find(self.db.rootName, {$or:query}, function(err, docs) {
                        if (err) {
                            return callback(err, docs);
                        } 
                        console.log(docs); 
                        return callback(err, docs);
                    });
                } else {
                    return callback("No access");
                }
            }
        });         
    }
    
    /**
     * @function Query if a user has a specific level of access for a specific table
     * @param   {string} userName  A user name
     * @param   {string} tableName A table name
     * @param   {string} perm      A permission
     * @param   {function} callback  Callback function expects (err, bool)
     * @returns {function} Return the callback function
     */  
    hasPermission(userName, tableName, perm, callback) {
        var self = this;
        var tableName = tableName;
        
        self.userDb.find(self.tableName, {userName: userName}, function(err, docs) {
            if (err) {
                console.log("- Error finding docs");
                return callback(err, false);
            } else {
                if (docs[0]) {
                    //get this users group membersip from docs[0]
                    var groups = docs[0].group;
                    var settings = docs[0].settings;

                    // do the query on specific table in the root table 
                    self.db.find(self.db.rootName, {name: tableName}, function(err, docs) {
                        if (err) {
                            return callback(err, false);
                        } else {
                            if (docs[0]) {
                                var hasPerm = false;
                                for (var i = 0; i < groups.length; i++) { 
                                    if ((docs[0].group[groups[i]]) && (docs[0].group[groups[i]][perm])) {   
                                        hasPerm = true;
                                        console.log(groups[i] + " permission: " + perm + " is: true");
                                    } else {
                                        console.log(groups[i] + " permission: " + perm + " is: false");
                                    }    
                                }
                                return callback(err, hasPerm);
                            } else {
                                return callback("No document");            
                            }
                        }
                    });
                } else {
                    return callback("No access");
                }
            }
        });  
    }
    
 
}

module.exports = UserManager;