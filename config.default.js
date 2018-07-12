// edit the config.default.js and save as config.js
"use strict";
var Config = {
    
    // MASTERKEY: the key used for encryption/decryption for this user database
    // NOTICE! - It has to be cryptographic safe - this means randomBytes or derived by pbkdf2 (for example)    
    masterKey: "NCQEq6fcAW8LTNPET6kksxiYhpCho0bv3vMc1mWH19zgMO1SxSyV9qYheaFy",
    
    // Webserver configuration
    webServer: {
        port: 3000,
        session: {
            sharedSecretKey: 'simplesecret'
        }
    }
    
    
    
};

module.exports = Config;