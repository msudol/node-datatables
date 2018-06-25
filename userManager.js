/* userManager.js 
* 
* User handler - will be able to create, edit, delete, and query users and user information
* particularly important for the webserver auth system to compare auth data against.
* 
* encyrption provided partly from this example https://gist.github.com/AndiDittrich/4629e7db04819244e843
*/
"use strict";

var _crypto = require('crypto');
//var defaultKey = '3zTvzr3p67VC61jmV54rIYu1545x4TlY';

class UserManager {
    
    constructor(userDb, tableName) {
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
     * @param String text to encrypt
     * @param Buffer masterkey
     * @returns String encrypted text, base64 encoded
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
     * @param   {Buffer} masterkey  master key
     * @returns String   decrypted (original) text
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
     * @param   {string} userName  A unique username
     * @param   {string} firstName First Name
     * @param   {string} lastName  Last Name
     * @param   {string} password  Password
     * @param   {string} email     Email Address
     * @param   {Array} group     Array of groups user belongs to
     * @param   {function} callback  Callback function
     * @returns {function} callback
     */
    createUser(userName, firstName, lastName, password, email, group, callback) {
        var self = this;
        // make sure group is an array
        group = group instanceof Array ? group : [group];
        var enc = this.encrypt(password, self.masterKey);
        self.userDb.insert(self.tableName, {userName: userName, firstName: firstName, lastName: lastName, password: enc, email: email, group: group}, function (err, newDoc) {
            return callback(err, newDoc);
        });          
    }   
    
    // TODO
    // edit a user given username and the and opts object with what is being edited
    updateUser(userName, opts, callback) {
        var self = this;
        //opts can be {firstName, lastName, password, email, group}
        
        // if pwd is set, encrypt and resave
        if ((opts.password !== undefined) && (opts.password !== null)) {
            var enc = this.encrypt(password, self.masterKey);
            opts.password = enc;
        }
        
        // tablename, the user, the data to update, empty object passed to db.update for options default, then callback func
        self.userDb.update(self.tableName, {userName: userName}, {$set: opts}, {}, function(err, numReplaced) {
            return callback(err, numReplaced);
        })
    }
    
    // view a user, will return the users details except password
    viewUser(userName, callback) {
        var self = this;

        self.userDb.find(self.tableName, {userName: userName}, function(err, docs) {
            if (err) {
                console.log("- Error finding docs");
                return callback(err, false);
            }
            else {
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
            }
            else {
                if (password == self.decrypt(docs[0].password, self.masterKey)) {
                    console.log("Password verified");
                    return callback(err, true);
                }
                else {
                    console.log("Password failed");
                    return callback(err, false);
                }
            }
        }) 
    }
    
}

module.exports = UserManager;