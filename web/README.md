# web/ — the WebGL port

Two files, no dependencies:

- `3d-engine-core.js` — 253 lines: math, `Camera`, `Triangle`, and a WebGL renderer
- `cube.js` — 71 lines: the `Cube` geometry, registered on `Engine3D`

`index.html` is a demo page (four 300³ cubes) — not part of the renderer.

```bash
python3 -m http.server 8000    # then open http://localhost:8000
```

Same pipeline as `python/first-person/第一人称视觉10.py`: Y-up, Euler order `Ry · Rx · Rz`,
near plane 0.1, far plane 15000, painter's algorithm sorted by centroid depth.

[English](../README.md) · [中文](../README.zh.md) · [日本語](../README.ja.md)
