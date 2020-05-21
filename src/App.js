import React, { useEffect } from 'react';
import './App.scss';
import { observer } from "mobx-react";
import appStore from './appStore';
import keyControl from './keyControl';
import classNames from 'classnames';
import { connect } from './socket';
import _ from 'lodash';
import prefs, { setPref } from './utils/prefs';
import config from './config';
import Controls from './Controls';

function _App() {

  useEffect(() => {
    appStore.fetchMedia();
    connect();
  }, []);

  

  return (
    <div className="App" onClick={appClick}    onDoubleClick={closeMask}>
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

      <div className={classNames('display', appStore.display)} 
     
        style={displayStyle()}
      >
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
          key={layer.filePath}>
          {
            layer.filePath.match(/\.gif$/i) ?
              <img className="gif" src={layer.filePath} alt=""/> :
              layer.filePath.match(/\.(m4v|mov|webm|mp4)$/i) ?
                <video src={layer.filePath} 
                  autoPlay={true} 
                  loop={appStore.loopVideo} 
                  muted 
                  onDurationChange={e => appStore.lastVideo = layer.filePath}
                  ref={el => layer.ref = el}/> :
                layer.filePath.match(/\.jpg$/i) ?
                  <iframe src={`/kaleidos/index.html?${new URLSearchParams({
                    n: appStore.kaleidosSegments,
                    src: layer.filePath,
                    s: layer.speed,
                    timeout: 0
                  })}`} title={layer.keyName} /> : 
                  null
        }</div>)}
          
        
        {appStore.color ? <div className="color" style={{background: appStore.color}}></div> : null}

        </div>
        {appStore.controls ?
          <Controls/>:
          null
        }

      {appStore.maskPoints ? 
        <svg id="mask">
          <polygon fill="none" 
          stroke={appStore.display.drawingMask ? 
            'white' : 
            null}
           points={appStore.maskPoints
            .map(point => `${point.x},${point.y}`)
            .join(' ')}/>
        </svg> 
        : null}
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

function appClick(e) {
  if (appStore.maskPoints && display.drawingMask) {
    appStore.maskPoints.push({
      x: e.clientX,
      y: e.clientY
    });
  }

  if (config.fullScreen)
  document.documentElement.requestFullscreen()
      .catch(e => console.error(e));
}


const display = appStore.display;

function closeMask() {
  display.drawingMask = false;
  if (appStore.maskPoints) {
    appStore.maskPoints.pop();
  }
  setPref('maskPoints', appStore.maskPoints);
}

function displayStyle() {
  const style = {};
  if (appStore.maskPoints && ! display.drawingMask) {
    style.clipPath = `polygon(${
      appStore.maskPoints
        .map(p => `${p.x}px ${p.y}px`)
        .join(', ')
    })`;
  }
  return style;
}
