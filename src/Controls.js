import React from 'react';
import appStore from './appStore';
import { observer } from "mobx-react";
import _ from 'lodash';
import { message, onMessage } from './socket';
import Toggle from './Toggle';
import './Controls.scss';

export default observer(function Controls() {
  return (
  <div className="controls" onClick={e => e.stopPropagation()}>
    <div className="sliders">
      {
        sliders.map(
        Slider
      )}
    </div>
    <div className="toggles">
          
        <Toggle label="transmit" onChange={e => appStore.transmit = e.target.checked} checked={appStore.transmit}/>
        <Toggle label="receive" onChange={e => appStore.receive = e.target.checked} checked={appStore.receive} />
        <Toggle label="play" onChange={e => appStore.play = e.target.checked} checked={appStore.play} />
        <Toggle label="hide cursor" onChange={e => appStore.hideCursor = e.target.checked} checked={appStore.hideCursor} />
    </div>

    <div class='misc'>
      <button onClick={()=>appStore.filter = _.clone(appStore.originalFilter) }>reset</button>
      <button onClick={() => appStore.display.circle = ! appStore.display.circle }>circle</button>
      <button onClick={drawMask}>
        {appStore.display.drawingMask ? 'Release Mask' : 'Draw Mask'}
      </button>

      <select onChange={groupChange} value={appStore.selectedGroup}>
        <option value=''>All</option>
        {_.get(appStore, 'directories', []).map(dir => <option 
          key={dir}
          value={dir} >
            {decodeURI(dir)}
          </option>)}
      </select>

      <input type="color" onChange={e => appStore.color = e.target.value}/>
      <div className='blend-mode'>{appStore.blendMode}</div>
      <div className='blend-mode'>keyboard: {appStore.patchIndex}</div>

      <button onClick={e => appStore.showHelp = true}>help</button>

    </div>

  </div> );
});

const sliders = [{
  label: "fade in (ms)",
  min: "1",
  max: "3000",
  get value() { return appStore.transition.inMs; },
  setter: v => appStore.transition.inMs = v
},
{
  label: "fade out (ms)",
  min: "1",
  max: "3000",
  get value() { return appStore.transition.outMs; },
  setter: v => appStore.transition.outMs = v
},
{
  label: "Kaleidos Segments",
  min: "2",
  max: "32",
  step: "1",
  get value() { return appStore.kaleidosSegments; },
  setter: 
    v => appStore.kaleidosSegments = v
},
{
  label: "opacity",
  get value() { return appStore.filter.opacity; },
  setter: v => appStore.filter.opacity = v
},
{
  label: "sepia",
  get value() { return appStore.filter.sepia; },
  setter: v => appStore.filter.sepia = v
},
{
  label: "blur",
  max: "100",
  get value() { return appStore.filter.blur; },
  setter: v => appStore.filter.blur = v
},
{
  label: "brightness",
  max: "3",
  get value() { return appStore.filter.brightness; },
  setter: v => appStore.filter.brightness = v
},
{
  label: "contrast",
  max: "3",
  get value() { return appStore.filter.contrast; },
  setter: v => appStore.filter.contrast = v
},
{
  label: "saturate",
  max: "3",
  get value() { return appStore.filter.saturate; },
  setter: v => appStore.filter.saturate = v
},
{
  label: "hue-rotate",
  max: "360",
  get value() { return appStore.filter['hue-rotate']; },
  setter: v => appStore.filter['hue-rotate'] = v
},
];

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
    <div className="slider" key={label}>
      <label>{label} {value}
        <input type="range" min={min} max={max} step={step} onChange={sliderChange} value={value} />
      </label>
    </div>);
}

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

function groupChange(e) {
  appStore.selectedGroup = e.target.value;
}

onMessage( (msg) => {
  if (msg.eventType === 'sliderChange') {
    _.get(sliders.find(s => s.label === msg.label),
      'setter',
      _.noop)(msg.value);
  }
});