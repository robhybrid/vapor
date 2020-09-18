import React, {useEffect} from 'react';
import appStore from '../appStore';
import { observer } from 'mobx-react';
import _ from 'lodash';
import './Help.scss';
import controlsMd from './controls.md';
import { markdown } from 'markdown';

export default observer(function Help() {

  
  useEffect(() => {
    fetch(controlsMd)
      .then(res => res.text())
      .then(res => markdown.toHTML(res))
      .then(x => {console.log(x); return x;})
      .then(res => appStore.help = res)
    window.addEventListener('keypress', close);
    window.addEventListener('click', close);
    return function cleanup() {
      window.removeEventListener('keypress', close);
      window.removeEventListener('click', close)
    };
  }, []);
  return <div className="help" dangerouslySetInnerHTML={{__html: appStore.help}} /> 
});

function close() {
  appStore.showHelp = false;
};