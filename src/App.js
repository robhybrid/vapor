import React, { useEffect } from 'react';
import './App.scss';
import { observer } from "mobx-react";
import appStore from './appStore';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import keyControl from './keyControl';

function _App() {

  useEffect(appStore.fetchMedia, []);
  
  return (
    <div className="App">
      <style>{`
        .layer-enter.layer-enter-active {
          transition-duration: ${appStore.transition.inMs}ms;
        }
        .layer-leave.layer-leave-active {
          transition-duration: ${appStore.transition.outMs}ms;
        }
      `}</style>
      <ReactCSSTransitionGroup
        transitionName="layer"
        transitionEnterTimeout={appStore.transition.inMs}
        transitionLeaveTimeout={appStore.transition.outMs}
      >
        {appStore.layers
          .map(layer => 
          <div 
            className="media-object" 
            style={{mixBlendMode: appStore.blendMode}} 
            key={layer.filePath}>{
              layer.filePath.match(/\.gif$/i) ?
                <img className="gif" src={layer.filePath} alt=""/> :
                null
          }</div>)}
      </ReactCSSTransitionGroup>
        {appStore.sliders ?
          <div className="sliders">
            <div className="slider">
              <label>transition in (ms) {appStore.transition.inMs}</label>
              <input type="range" min="1" max="1000" onChange={e => appStore.transition.inMs = +e.target.value} />
            </div>
            <div className="slider">
              <label>transition out (ms) { appStore.transition.outMs}</label>
              <input type="range" min="1" max="1000" onChange={e => appStore.transition.outMs = +e.target.value} />
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
