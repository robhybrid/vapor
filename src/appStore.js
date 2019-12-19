import { observable } from "mobx";

const appStore = observable({
  layers: [],
  keysDown: [],
  media: [],
  maxLayers: 2,
  patchIndex: 0,
  get blendModes() {
    return ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"];
  },
  blendModeIndex: 2,
  get blendMode() {
    return this.blendModes[this.blendModeIndex];
  },
  fetchMedia() {
    fetch('http://localhost:3001/api/media')
    .then((res) => res.json())
    .then(media => {
      appStore.media = media;
    })
    .catch(err => console.error('filed to fetch media', err));
  }
});

export default appStore;