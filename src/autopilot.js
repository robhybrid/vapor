import appStore from './appStore';
import _ from 'lodash';
import { fadeOut } from './keyControl';

let lastTapTime, 
  intervalRate,
  intervalId,
  tapIntervals=[];

const autopilot = {
  interval: 5000,
  shuffle: true,
  measure: 1,
  playlist: {}, // object with array for each screen.
  tap: function() {
    var tapTime = performance.now();
    if (lastTapTime) {
      var interval = tapTime - lastTapTime;
      lastTapTime = tapTime;
    } else {
      lastTapTime = tapTime;
      return;
    }

    if (intervalRate && (interval) > intervalRate * 2) {
      autopilot.clearBmp();
      return;
    }
    tapIntervals.push(interval);
    if (tapIntervals.length) {
      var sum = 0;
      tapIntervals.forEach(function(interval) {
        sum += interval;
      });
      intervalRate = sum/tapIntervals.length;

      appStore.bpm = 60000/intervalRate;
      clearInterval(intervalId);
      intervalId = setInterval(autopilot.playNext, intervalRate);
      autopilot.playNext();
    }
  },
  clearBmp: function() {
    lastTapTime = undefined;
    tapIntervals = [];
    intervalRate = null;
    appStore.bpm = '';
    clearInterval(intervalId);
    
    appStore.layers = [];
  },
  playNext: function() {
    // if (lastKey) {
    //   config.socket.emit('keyup', lastKey);
    // }
    
    const newLayer = {
      filePath: appStore.media[_.random(0, appStore.media.length-1)]
    };
    appStore.layers.push(newLayer);

    if (appStore.layers.length > appStore.maxLayers) {
      const layersToRemove = appStore.layers.length - appStore.maxLayers;
      appStore.layers.forEach((layer, i) => {
        if (i <= layersToRemove) {
          fadeOut(layer);
        }
      });
    }    
  }
};

export default autopilot;
