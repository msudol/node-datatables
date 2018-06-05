// setup a default users tables
var Tables = [
    {name: 'users', fields: ['userName', 'firstName', 'lastName', 'password', 'email'], unique: ['userName']},
];

module.exports = Tables;