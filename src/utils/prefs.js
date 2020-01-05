import { observable, observe } from 'mobx';

let _prefs = {};
try {
  _prefs = JSON.parse(localStorage.prefs);
} catch(e) {
  console.error('Could not load prefs', e);
}

const prefs = observable(_prefs);

export default prefs;

observe(prefs, (prefs)=> {
  localStorage.prefs = JSON.stringify(prefs);
});