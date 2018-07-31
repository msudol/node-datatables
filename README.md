# node-datatables

This project is a node.js server and client system that will can manage, create, edit, and delete datatables backed by an NEDB JSON Store.

## Introduction

There are 4 key components to this application. Data storage, web server, API, and client.

### Data storage

The data storage component is designed to work with NEDB, which should eventually be interchangeable with MongoDB.

### Web server 

Web server running on ExpressJS. For persistence consider using PM2 or another node daemon or process monitor.

### API

The API will be able to call on required Table Manager functions in order to manipulate tables. It passes through validation and permission checks such that user permissions are enforced on attempted actions.

### Client

The client will is a web based graphical front-end, that leverages the API in order to manage and use tables, using JQuery Datatables library.

## Installation

```
npm install
node app <runtests>
```

## Configuration

Copy the config.default.js file to config.js and edit as necessary.


