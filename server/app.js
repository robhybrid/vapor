/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');
var http = require('http');

var max = 100;
if(http.globalAgent.maxSockets < max) {
  http.globalAgent.maxSockets = max;
}

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Populate DB with sample data
if(config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();
var server = require('http').createServer(app);
var socketio = require('socket.io')(server, {
  serveClient: (config.env === 'production') ? false : true,
  path: '/socket.io-client'
});
require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);

// use spdy
//var spdy = require('spdy');
//var fs = require('fs');
//var spdyServer = spdy.createServer({
//  port: 443,
//  key: fs.readFileSync(__dirname + '/keys/server.key'),
//  cert: fs.readFileSync(__dirname + '/keys/server.crt'),
//  ca: fs.readFileSync(__dirname + '/keys/server.csr'),
//
//  // **optional** SPDY-specific options
//  windowSize: 1024 * 1024, // Server's window size
//
//  // **optional** if true - server will send 3.1 frames on 3.0 *plain* spdy
//  autoSpdy31: false
//}, app);



// Start server

//spdyServer.listen(config.port, function(){
//  console.log('Express SPDY server listening on %d, in %s mode', config.port, app.get('env'));
//});

// old listen command
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  console.log('max sockets', http.globalAgent.maxSockets);
});

// Expose app
exports = module.exports = app;