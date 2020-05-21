import React from 'react';
import './Toggle.scss';

export default function Toggle(props) {

  const id = props.id || `switch-${Math.random()}`;

  return (
  <div className={"toggle" + 
    (props.disabled ? ' disabled' : '') + 
    (props.className ? ' ' + props.className : '')}>
    <div className="onoffswitch">
      <input type="checkbox" name="onoffswitch" className="onoffswitch-checkbox" id={id}
        checked={props.checked}
        onChange={props.onChange} disabled={props.disabled ? 'disabled' : null}/>
      <label className="onoffswitch-label" htmlFor={id}>
          <span className="onoffswitch-inner"></span>
          <span className="onoffswitch-switch"></span>
      </label>
    </div>
    <span className="label">{props.label}</span>
  </div>
  );
}
