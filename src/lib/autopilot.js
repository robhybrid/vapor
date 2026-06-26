import { useAppStore } from '../store/useAppStore';
import { fadeOut } from './fadeOut';

let lastTapTime;
let intervalRate;
let intervalId;
let tapIntervals = [];

const autopilot = {
  tap() {
    const tapTime = performance.now();
    if (lastTapTime) {
      const interval = tapTime - lastTapTime;
      lastTapTime = tapTime;

      if (intervalRate && interval > intervalRate * 2) {
        autopilot.clearBmp();
        return;
      }

      tapIntervals.push(interval);
      const sum = tapIntervals.reduce((a, b) => a + b, 0);
      intervalRate = sum / tapIntervals.length;

      const store = useAppStore.getState();
      store.setField('bpm', String(Math.round(60000 / intervalRate)));
      clearInterval(intervalId);
      intervalId = setInterval(autopilot.playNext, intervalRate);
      autopilot.playNext();
    } else {
      lastTapTime = tapTime;
    }
  },

  clearBmp() {
    lastTapTime = undefined;
    tapIntervals = [];
    intervalRate = null;
    useAppStore.getState().setField('bpm', '');
    clearInterval(intervalId);
  },

  playNext() {
    const store = useAppStore.getState();
    const media = store.getMedia();
    if (!media.length) return;

    const filePath = media[Math.floor(Math.random() * media.length)];
    store.addLayer({ filePath });

    const layers = useAppStore.getState().layers;
    const { maxLayers } = useAppStore.getState();
    if (layers.length > maxLayers) {
      const layersToRemove = layers.length - maxLayers;
      layers.forEach((layer, i) => {
        if (i < layersToRemove) fadeOut(layer);
      });
    }
  },
};

export default autopilot;
