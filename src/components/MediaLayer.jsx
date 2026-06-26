import { useRef } from 'react';
import classNames from 'classnames';
import { getMediaType } from '../lib/media';
import Kaleidoscope from './Kaleidoscope';

export default function MediaLayer({
  layer,
  blendMode,
  loopVideo,
  kaleidosSegments,
  onVideoDuration,
}) {
  const speedRef = useRef(layer.speed ?? Math.floor(Math.random() * 10) + 1);
  const type = getMediaType(layer.filePath);

  return (
    <div
      className={classNames('media-object', {
        exit: layer.exit,
        enter: !layer.exit,
      })}
      style={{ mixBlendMode: blendMode }}
    >
      {type === 'gif' && (
        <img className="gif" src={layer.filePath} alt="" />
      )}
      {type === 'video' && (
        <video
          src={layer.filePath}
          autoPlay
          loop={loopVideo}
          muted
          playsInline
          onLoadedMetadata={() => onVideoDuration(layer.filePath)}
          ref={(el) => { layer.ref = el; }}
        />
      )}
      {type === 'jpg' && (
        <Kaleidoscope
          src={layer.filePath}
          segments={kaleidosSegments}
          speed={speedRef.current}
        />
      )}
      {type === 'png' && (
        <img src={layer.filePath} alt="" />
      )}
    </div>
  );
}
