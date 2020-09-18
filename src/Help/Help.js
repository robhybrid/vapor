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
      .then(res => appStore.help = res)
    window.addEventListener('keypress', close);
    window.addEventListener('click', close);
    return function cleanup() {
      window.removeEventListener('keypress', close);
      window.removeEventListener('click', close)
    };
  }, []);
  return <div className="help">
    <a href="https://github.com/robhybrid/vapor" className="fork">
      <img loading="lazy" width="149" height="149" src="https://github.blog/wp-content/uploads/2008/12/forkme_right_white_ffffff.png?resize=149%2C149" className="attachment-full size-full" alt="Fork me on GitHub" data-recalc-dims="1"/>
    </a>
    <div dangerouslySetInnerHTML={{__html: appStore.help}} /> 
  </div> 
});

function close() {
  appStore.showHelp = false;
};