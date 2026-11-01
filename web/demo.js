// Demo bootstrap: four 300³ cubes plus the frame loop.
// Safe to load before the DOM exists — sandboxes (CodePen, JSFiddle) inject external
// scripts into <head>, so boot() waits for DOMContentLoaded when that is the case.
(function () {
  'use strict';

  function boot() {
    const E3 = window.Engine3D;
    const canvas = document.getElementById('cv');
    const hTris = document.getElementById('hTris');
    const hFps = document.getElementById('hFps');
    const hCam = document.getElementById('hCam');

    let view = null;
    let W = 0;
    let H = 0;
    let gameMode = false;

    // Same layout as the Python version: four 300³ cubes, 640 units apart
    const objects = [
      new E3.Cube( 320, 0,  320, 300, 300, 300, 0, 0, 0, [2, 2]),
      new E3.Cube(-320, 0,  320, 300, 300, 300, 0, 0, 0, [2, 2]),
      new E3.Cube( 320, 0, -320, 300, 300, 300, 0, 0, 0, [2, 2]),
      new E3.Cube(-320, 0, -320, 300, 300, 300, 0, 0, 0, [2, 2])
    ];
    const totalTris = objects.reduce((a, o) => a + o.triangles.length, 0);

    // Camera: same class as the Python one (Y-up, Euler order Ry · Rx · Rz)
    const camera = new E3.Camera();
    const FOV = 80;
    const FAR = 15000;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.round(canvas.clientWidth * dpr);
      H = Math.round(canvas.clientHeight * dpr);
      canvas.width = W;
      canvas.height = H;
      view = E3.initWebGL(canvas, W, H);   // the u_half uniform depends on size
    }

    // Point the camera at a target: forward = Ry(yaw) · Rx(pitch) · [0,0,1]
    function lookAt(target) {
      const d = [target[0] - camera.position[0],
                 target[1] - camera.position[1],
                 target[2] - camera.position[2]];
      const n = Math.hypot(d[0], d[1], d[2]) || 1;
      const f = [d[0] / n, d[1] / n, d[2] / n];
      camera.euler_angles = [-Math.asin(f[1]), Math.atan2(f[0], f[2]), 0];
      camera.update(0, 0, 0, 0, 0, false);   // refresh rotation matrix / basis vectors
    }

    camera.position = [0, 430, -1180];
    lookAt([0, 0, 0]);

    const keys = Object.create(null);
    addEventListener('keydown', e => {
      keys[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'g') gameMode = !gameMode;
      if (e.key.startsWith('Arrow') || e.key === ' ') e.preventDefault();
    });
    addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

    let last = performance.now();
    let fpsAcc = 0;
    let fpsN = 0;
    let fpsShown = 0;

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      // Arrows turn, WASD/QE translate. Per second, so the speed is frame-rate independent.
      const turn = 1.2 * dt;
      const step = 900 * dt;
      const phi   = (keys.arrowleft  ? -turn : 0) + (keys.arrowright ? turn : 0);
      const theta = (keys.arrowup    ? -turn : 0) + (keys.arrowdown  ? turn : 0);
      const xm = (keys.d ? step : 0) + (keys.a ? -step : 0);
      const ym = (keys.e ? step : 0) + (keys.q ? -step : 0);
      const zm = (keys.w ? step : 0) + (keys.s ? -step : 0);
      if (phi || theta || xm || ym || zm) camera.update(phi, theta, xm, ym, zm, gameMode);

      const stats = E3.renderFrame(view.gl, view.vertexBuffer, camera, objects, W, H, FOV, FAR);

      if (hTris) hTris.textContent = stats.triangles + ' / ' + totalTris;
      if (hFps) {
        fpsAcc += dt;
        fpsN++;
        if (fpsAcc >= 0.5) { fpsShown = Math.round(fpsN / fpsAcc); fpsAcc = 0; fpsN = 0; }
        hFps.textContent = fpsShown;
      }
      if (hCam) {
        hCam.textContent = camera.position.map(v => v.toFixed(0)).join(', ') +
                           (gameMode ? '  [game]' : '  [free]');
      }

      requestAnimationFrame(frame);
    }

    resize();
    addEventListener('resize', resize);
    requestAnimationFrame(frame);

    // Handy from the console
    window.__triangleHell = { camera, objects, get view() { return view; } };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
