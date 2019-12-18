import autopilot from './autopilot';
import keycode from 'keycode';
import appStore from './appStore';

function keyDownListener(e) {
  const keyName = keycode(e);
  const control = keyControls
    .find(control => {
      if (typeof control.key === 'string') {
        return control.key === keyName;
      } else {
        return control.key.match(keyName);
      }
    });
  if (control) {
    control.effect(e);
  }
}
function keyUpListener() {

}

const keyControl = {
  listen: () => {
    document.addEventListener('keydown', keyDownListener);
    document.addEventListener('keyup', keyUpListener);
  }
};

export default keyControl;


const keyControls = [{
  key: 'tab',
  effect: (e) => {
    e.preventDefault();
    autopilot.tap();
  }}, {key: 'right',
  effect() {
    appStore.blendModeIndex = (appStore.blendModeIndex + 1) % appStore.blendModes.length;
  }
}, {key: 'left',
  effect() {
    appStore.blendModeIndex = (appStore.blendModeIndex - 1) % appStore.blendModes.length;
  }
}, {key: 'up',
  effect() {appStore.maxLayers++}
}, {key: 'down',
  effect() {appStore.maxLayers = Math.max(appStore.maxLayers-1, 0); }
}];