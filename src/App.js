import React, { useEffect, useState } from 'react';
import './App.scss';
import keycode from 'keycode';
import { observer } from "mobx-react";
import appStore from './appStore';
import autopilot from './autopilot';

const blendModes = ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"];

function _App() {

  const [blendModeIndex, setBlendModeIndex] = useState(2);
  useEffect(() => {
    fetch('http://localhost:3001/api/media')
      .then((res) => res.json())
      .then(media => {
        appStore.media = media;
      })
      .catch(err => console.error('filed to fetch media', err));
    }, []);
  
  return (
    <div className="App">
      {appStore.layers
        .map(layer => <div className="media-object" style={{mixBlendMode: appStore.blendMode}}>{
          layer.filePath.match(/\.gif$/i) ?
            <img className="gif" src={layer.filePath} alt="" key={layer.filePath}/> :
            null
        }</div>)}
    </div>
  );
}
const App = observer(_App);

document.addEventListener('keydown', keyDownListener);
document.addEventListener('keyup', keyUpListener);


function keyDownListener(e) {
  e.preventDefault();
  const keyName = keycode(e);
  if (keyName === 'tab') {
    autopilot.tap();
  }
}
function keyUpListener() {

}


export default App;
