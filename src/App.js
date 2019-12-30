import React, { useEffect } from 'react';
import './App.scss';
import { observer } from "mobx-react";
import appStore from './appStore';
import keyControl from './keyControl';
import classNames from 'classnames';

function _App() {

  useEffect(appStore.fetchMedia, []);
  
  return (
    <div className="App">
      <style>{`
        .media-object.enter {
          animation-duration: ${appStore.transition.inMs}ms;
        }
        .media-object.exit {
          animation-duration: ${appStore.transition.outMs}ms;
        }
      `}</style>
      {appStore.layers
        .map(layer => 
        <div 
          {..._class("media-object",
            {exit: layer.exit,
            enter: ! layer.exit
            }) } 
          style={{mixBlendMode: appStore.blendMode}} 
          key={layer.filePath}>{
            layer.filePath.match(/\.gif$/i) ?
              <img className="gif" src={layer.filePath} alt=""/> :
              null
        }</div>)}
        {appStore.sliders ?
          <div className="sliders">
            <div className="slider">
              <label>transition in (ms) {appStore.transition.inMs}</label>
              <input type="range" min="1" max="1000" onChange={e => appStore.transition.inMs = +e.target.value} value={appStore.transition.inMs} />
            </div>
            <div className="slider">
              <label>transition out (ms) { appStore.transition.outMs}</label>
              <input type="range" min="1" max="1000" onChange={e => appStore.transition.outMs = +e.target.value} value={appStore.transition.outMs} />
            </div>
          </div> :
          null
        }
          
    </div>
  );
}
const App = observer(_App);

keyControl.listen();

export default App;

function _class() {
  return {className: classNames(...arguments)};
}
