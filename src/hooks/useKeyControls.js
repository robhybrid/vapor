import { useEffect, useRef } from 'react';
import keycode from 'keycode';
import { useAppStore, BLEND_MODES } from '../store/useAppStore';
import { VIDEO_KEY_CHARS } from '../lib/media';
import { fadeOut } from '../lib/fadeOut';
import autopilot from '../lib/autopilot';
import { config } from '../lib/config';
import { emitMessage, onSocketMessage } from './useSocket';

const numberTimers = {};

export function useKeyControls() {
  const keysDown = useRef([]);

  useEffect(() => {
    const cleanupSocket = onSocketMessage((data) => {
      if (data.eventType === 'keyDown') {
        pushKey(null, data.keyName, keysDown);
      } else if (data.eventType === 'keyUp') {
        liftKey(null, data.keyName, keysDown);
      }
    });

    const onKeyDown = (e) => {
      const keyName = keycode(e);
      if (keysDown.current.includes(keyName)) return;

      if (keyName !== 'alt') {
        emitMessage({ keyName, eventType: 'keyDown' });
      }
      pushKey(e, keyName, keysDown);
    };

    const onKeyUp = (e) => {
      const keyName = keycode(e);
      emitMessage({ keyName, eventType: 'keyUp' });
      liftKey(e, keyName, keysDown);
    };

    const onTouchStart = () => {
      autopilot.tap();
      emitMessage({ keyName: 'tab', eventType: 'keyDown' });
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('touchstart', onTouchStart, false);

    return () => {
      cleanupSocket();
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('touchstart', onTouchStart);
    };
  }, []);
}

function findControl(keyName) {
  return keyControls.find((control) => {
    if (typeof control.key === 'string') return control.key === keyName;
    if (keyName.match) return keyName.match(control.key);
    return false;
  });
}

function pushKey(e, keyName, keysDown) {
  keysDown.current.push(keyName);
  const control = findControl(keyName);
  if (control?.onKeyDown) control.onKeyDown(e, keyName, keysDown.current);
}

function liftKey(e, keyName, keysDown) {
  keysDown.current = keysDown.current.filter((k) => k !== keyName);
  const control = findControl(keyName);
  if (control?.onKeyUp) control.onKeyUp(e, keyName, keysDown.current);
}

const keyControls = [
  {
    key: '`',
    onKeyDown() {
      const store = useAppStore.getState();
      store.setField('transmit', !store.transmit);
    },
  },
  {
    key: 'tab',
    onKeyDown(e) {
      e?.preventDefault();
      autopilot.tap();
    },
  },
  {
    key: '=',
    onKeyDown() {
      const store = useAppStore.getState();
      if (store.kaleidosSegments < 32) store.setKaleidosSegments(store.kaleidosSegments + 1);
    },
  },
  {
    key: '-',
    onKeyDown() {
      const store = useAppStore.getState();
      if (store.kaleidosSegments > 2) store.setKaleidosSegments(store.kaleidosSegments - 1);
    },
  },
  {
    key: '[',
    onKeyDown() {
      const store = useAppStore.getState();
      let patchIndex = store.patchIndex - 1;
      if (patchIndex < 0) {
        const media = store.getMedia();
        patchIndex = VIDEO_KEY_CHARS.length
          ? Math.floor(media.length / VIDEO_KEY_CHARS.length)
          : 0;
      }
      store.setField('patchIndex', patchIndex);
    },
  },
  {
    key: ']',
    onKeyDown() {
      const store = useAppStore.getState();
      const media = store.getMedia();
      const max = Math.ceil(media.length / VIDEO_KEY_CHARS.length) || 1;
      store.setField('patchIndex', (store.patchIndex + 1) % max);
    },
  },
  {
    key: '\\',
    onKeyDown() {
      useAppStore.getState().setField('patchIndex', 0);
    },
  },
  {
    key: 'right',
    onKeyDown() {
      const store = useAppStore.getState();
      store.setBlendModeIndex((store.blendModeIndex + 1) % BLEND_MODES.length);
    },
  },
  {
    key: 'left',
    onKeyDown() {
      const store = useAppStore.getState();
      const next = store.blendModeIndex < 1
        ? BLEND_MODES.length - 1
        : (store.blendModeIndex - 1) % BLEND_MODES.length;
      store.setBlendModeIndex(next);
    },
  },
  {
    key: 'up',
    onKeyDown() {
      const store = useAppStore.getState();
      store.setField('maxLayers', store.maxLayers + 1);
    },
  },
  {
    key: 'down',
    onKeyDown() {
      const store = useAppStore.getState();
      store.setField('maxLayers', Math.max(store.maxLayers - 1, 0));
    },
  },
  {
    key: 'space',
    onKeyDown() {
      const store = useAppStore.getState();
      const prevTransition = { ...store.transition };
      store.setTransition({ outMs: 3000 });
      store.fadeOutTimeout = setTimeout(() => store.setTransition(prevTransition), 3000);
      store.layers.forEach(fadeOut);
      autopilot.clearBmp();
    },
    onKeyUp() {
      const store = useAppStore.getState();
      clearTimeout(store.fadeOutTimeout);
    },
  },
  {
    key: 'alt',
    onKeyDown() {
      useAppStore.getState().toggleControls();
    },
  },
  {
    key: new RegExp(`^[${VIDEO_KEY_CHARS.join('')}]$`),
    onKeyDown(_e, keyName, keysDown) {
      const store = useAppStore.getState();
      const activeLayer = store.layers.find((layer) => layer.keyName === keyName);

      if (activeLayer) {
        if (activeLayer.exit) {
          store.updateLayer(activeLayer, { exit: false });
          clearTimeout(activeLayer.timeout);
        }
        if (keysDown.includes('caps lock') || keysDown.includes('shift')) {
          store.layers.filter((layer) => layer.keyName === keyName).forEach(fadeOut);
        }
        return;
      }

      const media = store.getMedia();
      const filePath = media[
        VIDEO_KEY_CHARS.indexOf(keyName) + store.patchIndex * VIDEO_KEY_CHARS.length
      ];
      if (filePath) store.addLayer({ keyName, filePath });
    },
    onKeyUp(_e, keyName, keysDown) {
      const store = useAppStore.getState();
      const layer = store.layers.find((l) => l.keyName === keyName);
      if (keysDown.includes('caps lock') || keysDown.includes('shift')) return;
      if (!layer) return;
      fadeOut(layer);
    },
  },
  {
    key: /[\d]/,
    onKeyDown(e, keyName) {
      if (!e) return;
      const store = useAppStore.getState();

      if (e.ctrlKey) {
        numberTimers[keyName] = setTimeout(() => {
          const paths = store.layers.map((layer) => layer.filePath);
          const existing = store.savedGroups[keyName] || [];
          store.saveGroup(keyName, [...existing, ...paths]);
          numberTimers[keyName] = null;
        }, 1000);
        return;
      }

      if (config.countdown) {
        store.addLayer({
          keyName,
          filePath: `/countdown/${keyName === '0' ? '10' : keyName}.mov`,
        });
        return;
      }

      if (store.lastVideo) {
        const lastVideoLayer = store.layers.find((l) => l.filePath === store.lastVideo);
        if (lastVideoLayer?.ref) {
          if (keyName === '0') {
            store.removeLayer(lastVideoLayer);
          } else {
            const newTime = lastVideoLayer.ref.duration / Number(keyName);
            if (newTime) lastVideoLayer.ref.currentTime = newTime;
          }
        } else {
          store.addLayer({ keyName, filePath: store.lastVideo });
        }
      }
    },
    onKeyUp(e, keyName) {
      const store = useAppStore.getState();
      if (config.countdown) {
        store.setLayers(store.layers.filter((layer) => layer.keyName !== keyName));
        return;
      }
      if (numberTimers[keyName]) {
        clearTimeout(numberTimers[keyName]);
        const group = store.savedGroups[keyName] || [];
        if (group.length) {
          store.setMedia(group);
          store.setField('patchIndex', 0);
        }
      }
    },
  },
  {
    key: 'backspace',
    onKeyDown(e) {
      if (!e?.ctrlKey) return;
      const store = useAppStore.getState();
      store.clearMediaOverride();
    },
  },
];
