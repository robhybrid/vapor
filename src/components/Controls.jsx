import { useEffect } from 'react';
import { useAppStore, BLEND_MODES } from '../store/useAppStore';
import Toggle from './Toggle';
import { emitMessage, onSocketMessage } from '../hooks/useSocket';
import './Controls.css';

const sliders = [
  {
    label: 'fade in (ms)',
    min: 1,
    max: 3000,
    step: 1,
    getValue: (s) => s.transition.inMs,
    setter: (v) => useAppStore.getState().setTransition({ inMs: v }),
  },
  {
    label: 'fade out (ms)',
    min: 1,
    max: 3000,
    step: 1,
    getValue: (s) => s.transition.outMs,
    setter: (v) => useAppStore.getState().setTransition({ outMs: v }),
  },
  {
    label: 'Kaleidos Segments',
    min: 2,
    max: 32,
    step: 1,
    getValue: (s) => s.kaleidosSegments,
    setter: (v) => useAppStore.getState().setKaleidosSegments(v),
  },
  {
    label: 'opacity',
    getValue: (s) => s.filter.opacity,
    setter: (v) => useAppStore.getState().updateFilter('opacity', v),
  },
  {
    label: 'sepia',
    getValue: (s) => s.filter.sepia,
    setter: (v) => useAppStore.getState().updateFilter('sepia', v),
  },
  {
    label: 'blur',
    max: 100,
    getValue: (s) => s.filter.blur,
    setter: (v) => useAppStore.getState().updateFilter('blur', v),
  },
  {
    label: 'brightness',
    max: 3,
    getValue: (s) => s.filter.brightness,
    setter: (v) => useAppStore.getState().updateFilter('brightness', v),
  },
  {
    label: 'contrast',
    max: 3,
    getValue: (s) => s.filter.contrast,
    setter: (v) => useAppStore.getState().updateFilter('contrast', v),
  },
  {
    label: 'saturate',
    max: 3,
    getValue: (s) => s.filter.saturate,
    setter: (v) => useAppStore.getState().updateFilter('saturate', v),
  },
  {
    label: 'hue-rotate',
    max: 360,
    step: 1,
    getValue: (s) => s.filter['hue-rotate'],
    setter: (v) => useAppStore.getState().updateFilter('hue-rotate', v),
  },
];

function Slider({ config }) {
  const value = useAppStore((s) => config.getValue(s));

  const onChange = (e) => {
    const next = +e.target.value;
    emitMessage({ eventType: 'sliderChange', label: config.label, value: next });
    config.setter(next);
  };

  return (
    <div className="slider">
      <label>
        {config.label} {value}
        <input
          type="range"
          min={config.min ?? 0}
          max={config.max ?? 1}
          step={config.step ?? 0.01}
          onChange={onChange}
          value={value}
        />
      </label>
    </div>
  );
}

export default function Controls() {
  const transmit = useAppStore((s) => s.transmit);
  const receive = useAppStore((s) => s.receive);
  const play = useAppStore((s) => s.play);
  const hideCursor = useAppStore((s) => s.hideCursor);
  const blendMode = useAppStore((s) => BLEND_MODES[s.blendModeIndex]);
  const patchIndex = useAppStore((s) => s.patchIndex);
  const directories = useAppStore((s) => s.directories);
  const selectedGroup = useAppStore((s) => s.selectedGroup);
  const drawingMask = useAppStore((s) => s.display.drawingMask);
  const circle = useAppStore((s) => s.display.circle);

  useEffect(() => {
    return onSocketMessage((msg) => {
      if (msg.eventType === 'sliderChange') {
        const slider = sliders.find((s) => s.label === msg.label);
        slider?.setter(msg.value);
      }
    });
  }, []);

  const drawMask = (e) => {
    e.stopPropagation();
    const store = useAppStore.getState();
    if (store.maskPoints) {
      store.updateDisplay({ drawingMask: false });
      store.setMaskPoints(null);
    } else {
      store.updateDisplay({ circle: false, drawingMask: true });
      store.setMaskPoints([]);
      store.setField('controls', false);
    }
  };

  return (
    <div className="controls" onClick={(e) => e.stopPropagation()}>
      <div className="sliders">
        {sliders.map((config) => (
          <Slider key={config.label} config={config} />
        ))}
      </div>

      <div className="toggles">
        <Toggle
          label="transmit"
          checked={transmit}
          onChange={(e) => useAppStore.getState().setField('transmit', e.target.checked)}
        />
        <Toggle
          label="receive"
          checked={receive}
          onChange={(e) => useAppStore.getState().setField('receive', e.target.checked)}
        />
        <Toggle
          label="play"
          checked={play}
          onChange={(e) => useAppStore.getState().setField('play', e.target.checked)}
        />
        <Toggle
          label="hide cursor"
          checked={hideCursor}
          onChange={(e) => useAppStore.getState().setField('hideCursor', e.target.checked)}
        />
      </div>

      <div className="misc">
        <button type="button" onClick={() => useAppStore.getState().resetFilter()}>
          reset
        </button>
        <button
          type="button"
          onClick={() => useAppStore.getState().updateDisplay({ circle: !circle })}
        >
          circle
        </button>
        <button type="button" onClick={drawMask}>
          {drawingMask ? 'Release Mask' : 'Draw Mask'}
        </button>

        <select
          onChange={(e) => useAppStore.getState().setSelectedGroup(e.target.value)}
          value={selectedGroup}
        >
          <option value="">All</option>
          {directories.map((dir) => (
            <option key={dir} value={dir}>
              {decodeURI(dir)}
            </option>
          ))}
        </select>

        <input
          type="color"
          onChange={(e) => useAppStore.getState().setField('color', e.target.value)}
        />
        <div className="blend-mode">{blendMode}</div>
        <div className="blend-mode">keyboard: {patchIndex}</div>
        <button type="button" onClick={() => useAppStore.getState().setField('showHelp', true)}>
          help
        </button>
      </div>
    </div>
  );
}
