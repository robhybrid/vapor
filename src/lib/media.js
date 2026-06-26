export const VIDEO_KEY_CHARS = Object.freeze(
  'qwertyuiopasdfghjkl;zxcvbnm,./'.split('')
);

export function getMediaType(filePath) {
  if (/\.gif$/i.test(filePath)) return 'gif';
  if (/\.(m4v|mov|webm|mp4)$/i.test(filePath)) return 'video';
  if (/\.jpg$/i.test(filePath)) return 'jpg';
  if (/\.png$/i.test(filePath)) return 'png';
  return null;
}

export function cssFilter(filter, originalFilter) {
  const units = {
    'hue-rotate': 'deg',
    blur: 'px',
  };

  return Object.keys(filter)
    .filter((key) => filter[key] !== originalFilter[key])
    .map((key) => `${key}(${filter[key]}${units[key] || ''})`)
    .join(' ');
}
