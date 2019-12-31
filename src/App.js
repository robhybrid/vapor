import React, { useEffect } from 'react';
import './App.scss';
import { observer } from "mobx-react";
import appStore from './appStore';
import keyControl from './keyControl';
import classNames from 'classnames';
import { connect } from './socket';
import _ from 'lodash';

function _App() {

  useEffect(() => {
    appStore.fetchMedia();
    connect();
  }, []);
  
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
      {_.uniqBy(appStore.layers, 'keyName')
        .map(layer => 
        <div 
          {..._class("media-object",
            {exit: layer.exit,
            enter: ! layer.exit
            }) } 
          style={{mixBlendMode: appStore.blendMode}} 
          key={layer.keyName}>{
            layer.filePath.match(/\.gif$/i) ?
              <img className="gif" src={layer.filePath} alt=""/> :
              layer.filePath.match(/\.mov$/i) ?
                <video src={layer.filePath} autoPlay={true}/> :
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
