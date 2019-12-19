import autopilot from './autopilot';
import keycode from 'keycode';
import appStore from './appStore';
import _ from 'lodash';

const keysDown = [];

function keyDownListener(e) {
  const keyName = keycode(e);
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
  _.remove(keysDown, keyName);
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
}}, {key: 'right',
  onKeyDown() {
    if (keysDown.includes('option')) {
      appStore.blendModeIndex = (appStore.blendModeIndex + 1) % appStore.blendModes.length;
    } else {
      appStore.patchIndex = (appStore.patchIndex + 1) % Math.ceil( appStore.media.length / videoKeyChars.length); 
    }
  }
}, {key: 'left',
  onKeyDown() {
    if (keysDown.includes('option')) {
      appStore.blendModeIndex = (appStore.blendModeIndex - 1) % appStore.blendModes.length;
    } else {
      appStore.patchIndex = (appStore.patchIndex - 1) % Math.ceil( appStore.media.length / videoKeyChars.length); 
    }
  }
}, {key: 'up',
  onKeyDown() {appStore.maxLayers++}
}, {key: 'down',
  onKeyDown() {appStore.maxLayers = Math.max(appStore.maxLayers-1, 0); }
}, {key: 'space',
  onKeyDown() {
    appStore.layers = [];
  }
},{
  key: RegExp(`^[${videoKeyChars.join('')}]$`),
  onKeyDown: (e, keyName) => {
    const filePath = appStore.media[
      videoKeyChars.indexOf(keyName) + (appStore.patchIndex * videoKeyChars.length)
    ];
    console.log('filePath', filePath, videoKeyChars.indexOf(keyName), appStore.patchIndex );
    if (filePath)
      appStore.layers.push({
        keyName,
        filePath
      })
  },
  onKeyUp(e, keyName) {
    _.remove(appStore.layers, layer => layer.keyName === keyName);
  }
}];

export { videoKeyChars };
export default keyControl;