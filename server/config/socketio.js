/**
 * Socket.io configuration
 */

'use strict';

var config = require('./environment');
var _ = require('lodash');

var clients = {};
// When the user disconnects.. perform this
function onDisconnect(socket) {
  console.log('socket disconnect', socket.id);
  delete clients[socket.id];
}

// When the user connects.. perform this
function onConnect(socket, io) {
  clients[socket.id] = true;
  console.log('socket', socket.id);
  io.sockets.emit('clients', JSON.stringify(clients));
  // When the client emits 'info', this listens and executes
  socket.on('info', function (data) {
    console.info('[%s] %s',  socket.address, JSON.stringify(data, null, 2));
  });

  //

  socket.on('keydown', function(data){
    socket.broadcast.emit('keydown', data);
  });
  socket.on('keyup', function(data){
    socket.broadcast.emit('keyup', data);
  });
  socket.on('transform', function(str){
    var data = JSON.parse(str);
    io.sockets.connected[data.clientID].emit('transform', data);
  });

}

module.exports = function (socketio) {
  // socket.io (v1.x.x) is powered by debug.
  // In order to see all the debug output, set DEBUG (in server/config/local.env.js) to including the desired scope.
  //
  // ex: DEBUG: "http*,socket.io:socket"

  // We can authenticate socket.io users and access their token through socket.handshake.decoded_token
  //
  // 1. You will need to send the token in `client/components/socket/socket.service.js`
  //
  // 2. Require authentication here:
  // socketio.use(require('socketio-jwt').authorize({
  //   secret: config.secrets.session,
  //   handshake: true
  // }));

  socketio.on('connection', function (socket) {
    socket.address = socket.handshake.address !== null ?
            socket.handshake.address.address + ':' + socket.handshake.address.port :
            process.env.DOMAIN;

    socket.connectedAt = new Date();

    // Call onDisconnect.
    socket.on('disconnect', function () {
      onDisconnect(socket);
      console.info('[%s] DISCONNECTED', socket.address);
    });

    // Call onConnect.
    onConnect(socket, socketio);
    console.info('[%s] CONNECTED', socket.address);
  });
};