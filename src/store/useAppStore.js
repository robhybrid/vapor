import { create } from 'zustand';
import { loadPrefs, savePrefs } from '../lib/prefs';

const ORIGINAL_FILTER = {
  sepia: 0,
  blur: 0,
  brightness: 1,
  contrast: 1,
  saturate: 1,
  'hue-rotate': 0,
  opacity: 1,
};

const savedPrefs = loadPrefs();

export const BLEND_MODES = [
  'screen',
  'difference',
  'exclusion',
  'hard-light',
  'lighten',
];

export const useAppStore = create((set, get) => ({
  controls: false,
  lastVideo: null,
  loopVideo: true,
  transmit: savedPrefs.transmit ?? true,
  receive: savedPrefs.receive ?? true,
  play: true,
  hideCursor: false,
  layers: [],
  allMedia: [],
  _media: null,
  maxLayers: savedPrefs.maxLayers ?? 2,
  patchIndex: 0,
  transition: savedPrefs.transition ?? { inMs: 100, outMs: 500 },
  filter: { ...ORIGINAL_FILTER },
  originalFilter: { ...ORIGINAL_FILTER },
  kaleidosSegments: savedPrefs.kaleidosSegments ?? 6,
  blendModeIndex: savedPrefs.blendModeIndex ?? 0,
  display: {},
  maskPoints: savedPrefs.maskPoints ?? null,
  selectedGroup: savedPrefs.selectedGroup ?? '',
  showHelp: true,
  color: null,
  helpHtml: '',
  bpm: '',
  directories: [],
  savedGroups: savedPrefs.savedGroups ?? {},

  getMedia() {
    const state = get();
    if (state._media) return state._media;
    return state.allMedia.filter((path) => path.includes(state.selectedGroup));
  },

  setMedia(media) {
    set({ _media: media });
  },

  clearMediaOverride() {
    set({ _media: null });
  },

  getBlendMode() {
    return BLEND_MODES[get().blendModeIndex];
  },

  setField(key, value) {
    set({ [key]: value });
    if (['blendModeIndex', 'transmit', 'maxLayers', 'maskPoints', 'selectedGroup', 'kaleidosSegments', 'transition'].includes(key)) {
      savePrefs({ [key]: value });
    }
  },

  updateFilter(key, value) {
    set((state) => ({
      filter: { ...state.filter, [key]: value },
    }));
  },

  resetFilter() {
    set({ filter: { ...ORIGINAL_FILTER } });
  },

  setTransition(partial) {
    set((state) => {
      const transition = { ...state.transition, ...partial };
      savePrefs({ transition });
      return { transition };
    });
  },

  setBlendModeIndex(index) {
    set({ blendModeIndex: index });
    savePrefs({ blendModeIndex: index });
  },

  setSelectedGroup(group) {
    set({ selectedGroup: group });
    savePrefs({ selectedGroup: group });
  },

  setMaskPoints(points) {
    set({ maskPoints: points });
    savePrefs({ maskPoints: points });
  },

  setKaleidosSegments(n) {
    set({ kaleidosSegments: n });
    savePrefs({ kaleidosSegments: n });
  },

  toggleControls() {
    set((state) => ({ controls: !state.controls }));
  },

  updateDisplay(partial) {
    set((state) => ({ display: { ...state.display, ...partial } }));
  },

  async fetchMedia() {
    try {
      const res = await fetch('/api/media');
      const media = await res.json();
      const directories = [
        ...new Set(
          media
            .map((path) => {
              const matches = path.match(/media\/(.*)\/[^/]+/);
              return matches && matches[1];
            })
            .filter(Boolean)
        ),
      ];
      set({ allMedia: media, directories });
    } catch (err) {
      console.error('failed to fetch media', err);
    }
  },

  addLayer(layer) {
    set((state) => ({ layers: [...state.layers, layer] }));
  },

  removeLayer(layer) {
    set((state) => ({ layers: state.layers.filter((l) => l !== layer) }));
  },

  updateLayer(layer, updates) {
    Object.assign(layer, updates);
    set((state) => ({ layers: [...state.layers] }));
  },

  setLayers(layers) {
    set({ layers });
  },

  saveGroup(key, paths) {
    const savedGroups = {
      ...get().savedGroups,
      [key]: [...new Set(paths)],
    };
    set({ savedGroups });
    savePrefs({ savedGroups });
  },

  deleteGroup(key) {
    const savedGroups = { ...get().savedGroups };
    delete savedGroups[key];
    set({ savedGroups });
    savePrefs({ savedGroups });
  },
}));
