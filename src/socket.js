import socketIOClient from "socket.io-client";
import config from './config';
import appStore from "./appStore";
import prefs from './utils/prefs';

let socket;

const messageHandlerQue = [];

function connect() {
  socket = socketIOClient(config.apiRoot);
  socket.on('message', data => {
    console.log('on message', data);
    if (appStore.receive)
      messageHandlerQue.forEach(fn => fn(data));
  });
}

function message(message) {
  console.log('message', message)
  if ( ! appStore.transmit) return;
  socket && socket.emit('message', message);
}

function onMessage(fn) {
  messageHandlerQue.push(fn);
}

export { connect, message, onMessage};

message({prefs});
// onMessage(message => {
//   if (message.prefs) {
//     Object.assign(prefs, message.prefs);
//   }
// });