import { observable, observe } from "mobx";
import config from './config';
import _ from 'lodash';
import prefs from './utils/prefs';

const appStore = observable({
  loopVideo: true,
  prefs,
  transmit: true,
  layers: [],
  keysDown: [],
  get media() {
    return appStore.allMedia
      .filter(path => path.indexOf(appStore.selectedGroup) !== -1 );
  },
  maxLayers: 2,
  patchIndex: 0,
  transition: {
    inMs: 100,
    outMs: 500
  },
  filter: {
    sepia: 0,
    blur: 0,
    brightness: 1,
    contrast: 1,
    saturate: 1,
    'hue-rotate': 0,
    opacity: 1,
  },
  kaleidosSegments: 6,
  get blendModes() {
    return ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"];
  },
  blendModeIndex: 2,
  get blendMode() {
    return this.blendModes[this.blendModeIndex];
  },
  fetchMedia() {
    fetch(`${config.apiRoot}api/media`)
    .then((res) => res.json())
    .then(media => {
      appStore.allMedia = media;
      appStore.media = media;
      appStore.directories = _.uniq(
        media.map(path => {
          const matches = path.match(/media\/(.*)\/[^/]+/);
          return matches && matches[1];
        })
        .filter(p => p)
      );
    })
    .catch(err => console.error('filed to fetch media', err));
  },
  display: {},
  selectedGroup: prefs.selectedGroup
});

appStore.originalFilter = _.clone(appStore.filter);

observe(appStore, 'selectedGroup', () => {
  prefs.selectedGroup = appStore.selectedGroup;
});

export default appStore;