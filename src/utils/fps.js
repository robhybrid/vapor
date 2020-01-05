
let fps, nextFps = 0;
(function countFPS() {
  nextFps++
  requestAnimationFrame(() => countFPS());
})();

setInterval(() => {
  fps = nextFps;
  nextFps = 0;
  console.log(fps); 
}, 1000);