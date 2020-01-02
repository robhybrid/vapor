import socketIOClient from "socket.io-client";
import config from './config';
import appStore from "./appStore";

let socket;

const messageHandlerQue = [];

function connect() {
  socket = socketIOClient(config.apiRoot);
  socket.on('message', data => {
    messageHandlerQue.forEach(fn => fn(data));
  });
}

function message(message) {
  if ( ! appStore.transmit) return;
  socket && socket.emit('message', message);
}

function onMessage(fn) {
  messageHandlerQue.push(fn);
}

export { connect, message, onMessage};

