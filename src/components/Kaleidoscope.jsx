import { useEffect, useRef } from 'react';

export default function Kaleidoscope({ src, segments = 6, speed = 1 }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const angleRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const draw = () => {
      if (!img.complete) {
        frameRef.current = requestAnimationFrame(draw);
        return;
      }

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(angleRef.current);

      const slice = (Math.PI * 2) / segments;
      const radius = Math.max(width, height);

      for (let i = 0; i < segments; i++) {
        ctx.save();
        ctx.rotate(i * slice);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, -slice / 2, slice / 2);
        ctx.closePath();
        ctx.clip();

        const scale = Math.max(width / img.width, height / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, -w / 2, -h / 2, w, h);

        if (i % 2 === 1) {
          ctx.scale(1, -1);
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
        }

        ctx.restore();
      }

      ctx.restore();
      angleRef.current += 0.002 * speed;
      frameRef.current = requestAnimationFrame(draw);
    };

    img.onload = () => {
      resize();
      draw();
    };
    img.src = src;

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, [src, segments, speed]);

  return <canvas ref={canvasRef} className="kaleidoscope" />;
}
