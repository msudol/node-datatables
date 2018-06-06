# node-datatables

A node.js web baser server and client system that will be able to manage, create, edit, and delete datatables and manage the data within them.

## Data storage

In development, working with NEDB at first and then eventually MongoDB.

## Web server 

Web server running on Express. For persistence consider using PM2 or another node daemon or process monitor.

## Concepts & Design

The basic concept is the server will have 3 parts. A table manager, an API, and a front-end client.

### Table Manager

The table manager is a class that is invoked to manage the root tables, subtables, and table data, extending the function calls of NEDB / Mongo.

### API

The API will be able to call on required Table Manager functions in order to manipulate tables.

### Client

The client will be a graphical front, that will leverage the API in order to manage and use tables.

## Installing & Running

```
npm install
node app <runtests>
```

