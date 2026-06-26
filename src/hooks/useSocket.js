import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAppStore } from '../store/useAppStore';
import { loadPrefs } from '../lib/prefs';

const messageHandlers = [];
let socket;

export function onSocketMessage(fn) {
  messageHandlers.push(fn);
  return () => {
    const i = messageHandlers.indexOf(fn);
    if (i >= 0) messageHandlers.splice(i, 1);
  };
}

export function emitMessage(message) {
  if (!useAppStore.getState().transmit) return;
  socket?.emit('message', message);
}

export function useSocket() {
  const receive = useAppStore((s) => s.receive);

  useEffect(() => {
    socket = io({ path: '/socket.io' });

    socket.on('message', (data) => {
      if (useAppStore.getState().receive) {
        messageHandlers.forEach((fn) => fn(data));
      }
    });

    emitMessage({ prefs: loadPrefs() });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (data) => {
      if (useAppStore.getState().receive) {
        messageHandlers.forEach((fn) => fn(data));
      }
    };
    socket.off('message');
    socket.on('message', handler);
  }, [receive]);
}
