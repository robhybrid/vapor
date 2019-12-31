function getIpAddress() {
  // get IP address
  var os=require('os');
  var ifaces=os.networkInterfaces();
  var ip;
  Object.keys(ifaces).forEach(function(dev) {
    if ( ! dev.match(/^en/)) return;
    ifaces[dev].forEach(function(details) {
      if (details.family === 'IPv4' && details.internal === false) {
        ip = details.address;
      }
    });
  });
  return ip;
}

module.exports = getIpAddress;

