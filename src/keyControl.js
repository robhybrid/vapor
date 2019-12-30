import autopilot from './autopilot';
import keycode from 'keycode';
import appStore from './appStore';
import _ from 'lodash';

const keysDown = [];

function keyDownListener(e) {
  const keyName = keycode(e);
  if (keysDown.includes(keyName)) return;
  console.log('keyName', keyName);
  const control = keyControls
    .find(control => {
      if (typeof control.key === 'string') {
        return control.key === keyName;
      } else if (keyName.match) {
        return keyName.match(control.key);
      } 
      return false;
    });
  if (control && control.onKeyDown) {
    control.onKeyDown(e, keyName);
  }
  keysDown.push(keyName);
}
function keyUpListener(e) {
  const keyName = keycode(e);
  const control = keyControls
    .find(control => {
      if (typeof control.key === 'string') {
        return control.key === keyName;
      } else if (keyName.match) {
        return keyName.match(control.key);
      } 
      return false;
    });
  if (control && control.onKeyUp) {
    control.onKeyUp(e, keyName);
  }
  _.remove(keysDown, k => k === keyName );
}

const keyControl = {
  listen: () => {
    document.addEventListener('keydown', keyDownListener);
    document.addEventListener('keyup', keyUpListener);
  }
};

const videoKeyChars = Object.freeze(
  ('qwertyuiopasdfghjkl;zxcvbnm,./'.split(''))
);

const keyControls = [{
  key: 'tab',
  onKeyDown: (e) => {
    console.log('tab onkeydown')
    e.preventDefault();
    autopilot.tap();
}}, {key: '[',
  onKeyDown() {
    appStore.patchIndex = (appStore.patchIndex - 1);
    if (appStore.patchIndex < 0) {
      appStore.patchIndex = Math.floor(appStore.media.length / videoKeyChars.length);
    }
    console.log('appStore.patchIndex', appStore.patchIndex);
  }
}, {key: ']',
  onKeyDown() {
    appStore.patchIndex = (appStore.patchIndex + 1) % Math.ceil( appStore.media.length / videoKeyChars.length); 
    console.log('appStore.patchIndex', appStore.patchIndex);

  }
}, {key: 'right',
  onKeyDown() {
    appStore.blendModeIndex = (appStore.blendModeIndex + 1) % appStore.blendModes.length;
  }
}, {key: 'left',
  onKeyDown() {
    appStore.blendModeIndex = (appStore.blendModeIndex - 1) % appStore.blendModes.length;
  }
}, {key: 'up',
  onKeyDown() {appStore.maxLayers++}
}, {key: 'down',
  onKeyDown() {appStore.maxLayers = Math.max(appStore.maxLayers-1, 0); }
}, {key: 'space',
  onKeyDown() {
    // blackout
    while (appStore.layers.length) {
      appStore.layers.pop();
    }
    appStore.layers.length = 0;
    appStore.layers = [];
    autopilot.clearBmp();
  }
}, {key: 'alt',
  onKeyDown() {
    appStore.sliders = ! appStore.sliders;
  }
}, {
  key: RegExp(`^[${videoKeyChars.join('')}]$`),
  onKeyDown: (e, keyName) => {
    const activeLayer = appStore.layers.find(layer => layer.keyName === keyName);
    if (activeLayer) {
      if (activeLayer.exit) {
        activeLayer.exit = false;
        clearTimeout(activeLayer.timeout);
      }

      if (keysDown.includes('caps lock')) {
        _.remove(appStore.layers, layer => layer.keyName === keyName);
      }
      return;
    }
    const filePath = appStore.media[
      videoKeyChars.indexOf(keyName) + (appStore.patchIndex * videoKeyChars.length)
    ];
    if (filePath)
      appStore.layers.push({
        keyName,
        filePath
      });
  },
  onKeyUp(e, keyName) {
    const layer = appStore.layers.find(layer => layer.keyName === keyName);
    if ( ! layer) return;
    layer.exit = true;
    layer.timeout = setTimeout(() => {
      _.remove(appStore.layers, layer);
    }, appStore.transition.outMs) 
  }
}];

export { videoKeyChars };
export default keyControl;