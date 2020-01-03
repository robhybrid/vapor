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
    <div className="App" onClick={requestFullscreen}>
      <style>{`
        .media-object {
          filter: ${cssFilter(appStore.filter)};
        }
        .media-object.enter {
          animation-duration: ${appStore.transition.inMs}ms;
        }
        .media-object.exit {
          animation-duration: ${appStore.transition.outMs}ms;
        }
      `}</style>
      {_.uniqBy(appStore.layers, 'filePath')
        .filter(layer => layer.filePath)
        .map(layer => {
          if (layer.filePath.match(/\.jpg$/i) && ! layer.speed) {
            layer.speed = parseInt(Math.random() * 10) + 1
          }
          return layer;
        })
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
              layer.filePath.match(/\.mov$/i) ?
                <video src={layer.filePath} autoPlay={true}/> :
                layer.filePath.match(/\.jpg$/i) ?
                  <iframe src={`/kaleidos/index.html?n=${appStore.kaleidosSegments}&src=${layer.filePath}&timeout=0&s=${layer.speed}`} title={layer.keyName} /> : 
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
            <div className="slider">
              <label>Kaleidos Segments { appStore.kaleidosSegments}</label>
              <input type="range" min="2" max="32" onChange={e => appStore.kaleidosSegments = +e.target.value} value={appStore.kaleidosSegments} />
            </div>

            <div className="slider">
              <label>opacity {appStore.filter.opacity}</label>
              <input type="range" min="0" max="1" step="0.01" onChange={e => appStore.filter.opacity = +e.target.value} value={appStore.filter.opacity} />
            </div>
            <div className="slider">
              <label>Sepia { appStore.filter.sepia}</label>
              <input type="range" min="0" max="1" step="0.01" onChange={e => appStore.filter.sepia = +e.target.value} value={appStore.filter.sepia} />
            </div>
            <div className="slider">
              <label>Blur { appStore.filter.blur}</label>
              <input type="range" min="0" max="100" onChange={e => appStore.filter.blur = +e.target.value} value={appStore.filter.blur} />
            </div>
            <div className="slider">
              <label>brightness { appStore.filter.brightness}</label>
              <input type="range" min="0" max="3" step="0.01" onChange={e => appStore.filter.brightness = +e.target.value} value={appStore.filter.brightness} />
            </div>
            <div className="slider">
              <label>contrast { appStore.filter.contrast}</label>
              <input type="range" min="0" max="3" step="0.01" onChange={e => appStore.filter.contrast = +e.target.value} value={appStore.filter.contrast} />
            </div>
            <div className="slider">
              <label>saturate { appStore.filter.saturate}</label>
              <input type="range" min="0" max="3" step="0.01" onChange={e => appStore.filter.saturate = +e.target.value} value={appStore.filter.saturate} />
            </div>
            <div className="slider">
              <label>saturate { appStore.filter['hue-rotate']}</label>
              <input type="range" min="0" max="360" onChange={e => appStore.filter['hue-rotate'] = +e.target.value} value={appStore.filter['hue-rotate']} />
            </div>
            <button onClick={()=>appStore.filter = _.clone(appStore.originalFilter) }>reset</button>
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

function cssFilter(filter) {

  const units = {
    'hue-rotate': 'deg',
    'blur': 'px'
  }
  return Object.keys(filter)
    .map((key) => {
      return {key, value: filter[key]}
    })
    .filter(pair => pair.value !== appStore.originalFilter[pair.key] )
    .map(pair => `${pair.key}(${pair.value}${units[pair.key] || ''})`)
    .join(' ');
}

function requestFullscreen() {
  const docElm = document.documentElement;
  if (docElm.requestFullscreen) {
      docElm.requestFullscreen();
  }
  else if (docElm.mozRequestFullScreen) {
      docElm.mozRequestFullScreen();
  }
  else if (docElm.webkitRequestFullScreen) {
      docElm.webkitRequestFullScreen();
  }
  else if (docElm.msRequestFullscreen) {
      docElm.msRequestFullscreen();
  }
}