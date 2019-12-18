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

      `}
      </style>
      <ReactCSSTransitionGroup
        transitionName="layer"
        transitionEnterTimeout={500}
        transitionLeaveTimeout={300}
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

    </div>
  );
}
const App = observer(_App);

keyControl.listen();

export default App;
