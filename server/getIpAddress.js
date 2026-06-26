import os from 'os';

export default function getIpAddress() {
  const ifaces = os.networkInterfaces();
  let ip;

  Object.keys(ifaces).forEach((dev) => {
    if (!dev.match(/^en/)) return;
    ifaces[dev].forEach((details) => {
      if (details.family === 'IPv4' && details.internal === false) {
        ip = details.address;
      }
    });
  });

  return ip;
}
