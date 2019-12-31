
function sockets(io) {  
  io.on('connection', function(client) {
    console.log('Client connected...');
    
    client.on('message', function(data) {
      client.broadcast.emit('message',data);
    });
  });
}

module.exports = sockets;