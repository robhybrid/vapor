import { observable, observe } from 'mobx';

let _prefs = {};
try {
  if (localStorage.prefs)
    _prefs = JSON.parse(localStorage.prefs);
} catch(e) {
  console.error('Could not load prefs', e);
}

const prefs = observable(_prefs);

export default prefs;

observe(prefs, (change)=> {
  localStorage.prefs = JSON.stringify(prefs);
});

export function setPref(key, value) {
  prefs[key] = value;
  localStorage.prefs = JSON.stringify(prefs);
}