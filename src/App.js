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
import { message, onMessage } from './socket';

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
          <div className="sliders" onClick={e => e.stopPropagation()}>

            <Slider label="fade in (ms)" min="1" max="3000" value={appStore.transition.inMs} setter={v => appStore.transition.inMs = v}/>
            <Slider label="fade out (ms)" min="1" max="3000" value={appStore.transition.outMs} setter={v => appStore.transition.outMs = v}/>
            <Slider label="Kaleidos Segments" min="2" max="32" step="1" value={appStore.kaleidosSegments} setter={v => appStore.kaleidosSegments = v}/>
            <Slider label="opacity" value={appStore.filter.opacity} setter={v => appStore.filter.opacity = v}/>
            <Slider label="sepia" value={appStore.filter.sepia} setter={v => appStore.filter.sepia = v}/>
            <Slider label="blur" max="100" value={appStore.filter.blur} setter={v => appStore.filter.blur = v}/>
            <Slider label="brightness" max="3" value={appStore.filter.brightness} setter={v => appStore.filter.brightness = v}/>
            <Slider label="contrast" max="3" value={appStore.filter.contrast} setter={v => appStore.filter.contrast = v}/>
            <Slider label="saturate" max="3" value={appStore.filter.saturate} setter={v => appStore.filter.saturate = v}/>
            <Slider label="hue-rotate" max="360" value={appStore.filter['hue-rotate']} setter={v => appStore.filter['hue-rotate'] = v}/>
            <button onClick={()=>appStore.filter = _.clone(appStore.originalFilter) }>reset</button>
            <button onClick={() => appStore.display.circle = ! appStore.display.circle }>circle</button>
            <button onClick={drawMask}>
              {appStore.display.drawingMask ? 'Release Mask' : 'Draw Mask'}
            </button>

            <select onChange={groupChange} value={appStore.selectedGroup}>
              <option value=''>All</option>
              {_.get(appStore, 'directories', []).map(dir => <option 
                value={dir} >
                  {decodeURI(dir)}
                </option>)}
            </select>

            <input type="color" onChange={e => appStore.color = e.target.value}/>
            <div className='blend-mode'>{appStore.blendMode}</div>
            <div className='blend-mode'>keyboard: {appStore.patchIndex}</div>
          </div> :
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

function Slider({value, setter, min=0, max=1, step=0.01, label=''}) {
  const sliderChange = (e) => {
    message({
      eventType: 'sliderChange',
      label,
      value
    });
    setter(+e.target.value);
  };
  return (
    <div className="slider">
      <label>{label} {value}
        <input type="range" min={min} max={max} step={step} onChange={sliderChange} value={value} />
      </label>
    </div>);
}

const display = appStore.display;

function drawMask(e) {
  e.stopPropagation();
  const display = appStore.display;
  if (appStore.maskPoints) {
    display.drawingMask = false;
    appStore.maskPoints = null;
  } else {
    display.circle = false;
    display.drawingMask = true;
    appStore.maskPoints = [];
    appStore.controls = false;
  }
}

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

function groupChange(e) {
  appStore.selectedGroup = e.target.value;
}
