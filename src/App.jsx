import { useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { useAppStore, BLEND_MODES } from './store/useAppStore';
import { useKeyControls } from './hooks/useKeyControls';
import { useSocket } from './hooks/useSocket';
import { cssFilter } from './lib/media';
import Controls from './components/Controls';
import Help from './components/Help';
import MediaLayer from './components/MediaLayer';
import './App.css';

function uniqueLayers(layers) {
  const seen = new Set();
  return layers.filter((layer) => {
    if (!layer.filePath || seen.has(layer.filePath)) return false;
    seen.add(layer.filePath);
    return true;
  });
}

export default function App() {
  const hideCursor = useAppStore((s) => s.hideCursor);
  const showHelp = useAppStore((s) => s.showHelp);
  const controls = useAppStore((s) => s.controls);
  const play = useAppStore((s) => s.play);
  const layers = useAppStore((s) => s.layers);
  const filter = useAppStore((s) => s.filter);
  const originalFilter = useAppStore((s) => s.originalFilter);
  const transition = useAppStore((s) => s.transition);
  const blendMode = useAppStore((s) => BLEND_MODES[s.blendModeIndex]);
  const loopVideo = useAppStore((s) => s.loopVideo);
  const color = useAppStore((s) => s.color);
  const display = useAppStore((s) => s.display);
  const maskPoints = useAppStore((s) => s.maskPoints);
  const kaleidosSegments = useAppStore((s) => s.kaleidosSegments);

  useSocket();
  useKeyControls();

  useEffect(() => {
    useAppStore.getState().fetchMedia();
  }, []);

  const visibleLayers = useMemo(() => uniqueLayers(layers), [layers]);

  const displayStyle = {};
  if (maskPoints && !display.drawingMask) {
    displayStyle.clipPath = `polygon(${maskPoints.map((p) => `${p.x}px ${p.y}px`).join(', ')})`;
  }

  const onClick = (e) => {
    const store = useAppStore.getState();
    if (store.maskPoints && store.display.drawingMask) {
      store.setMaskPoints([...store.maskPoints, { x: e.clientX, y: e.clientY }]);
    }
    document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const onDoubleClick = () => {
    const store = useAppStore.getState();
    store.updateDisplay({ drawingMask: false });
    if (store.maskPoints?.length) {
      const next = [...store.maskPoints];
      next.pop();
      store.setMaskPoints(next.length ? next : null);
    }
  };

  const onVideoDuration = (filePath) => {
    useAppStore.getState().setField('lastVideo', filePath);
  };

  return (
    <div
      className="App"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      style={{ cursor: hideCursor ? 'none' : 'auto' }}
    >
      {showHelp && <Help />}

      <style>{`
        .media-object {
          filter: ${cssFilter(filter, originalFilter)};
        }
        .media-object.enter {
          animation-duration: ${transition.inMs}ms;
        }
        .media-object.exit {
          animation-duration: ${transition.outMs}ms;
        }
      `}</style>

      <div
        className={classNames('display', { circle: display.circle })}
        style={displayStyle}
      >
        {play &&
          visibleLayers.map((layer) => (
            <MediaLayer
              key={`${layer.filePath}-${layer.keyName || ''}`}
              layer={layer}
              blendMode={blendMode}
              loopVideo={loopVideo}
              kaleidosSegments={kaleidosSegments}
              onVideoDuration={onVideoDuration}
            />
          ))}

        {color && <div className="color" style={{ background: color }} />}
      </div>

      {controls && <Controls />}

      {maskPoints && (
        <svg id="mask" aria-hidden="true">
          <polygon
            fill="none"
            stroke={display.drawingMask ? 'white' : undefined}
            points={maskPoints.map((point) => `${point.x},${point.y}`).join(' ')}
          />
        </svg>
      )}
    </div>
  );
}
