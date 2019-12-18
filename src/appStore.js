import { observable } from "mobx";

const appStore = observable({
  layers: [],
  keysDown: [],
  maxLayers: 2,
  get blendModes() {
    return ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"];
  },
  blendModeIndex: 2,
  get blendMode() {
    return this.blendModes[this.blendModeIndex];
  }
});

export default appStore;