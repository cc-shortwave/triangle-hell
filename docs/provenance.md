# Provenance

[English](provenance.md) · [中文](provenance.zh.md) · [日本語](provenance.ja.md)

The code in this repository was written by **the author**. Packaging — README, screenshots,
comment translation — was done by an AI assistant. Every item below can be checked.

This document itself was written by an AI assistant; each claim was verified against the
files or by running them.

## Code: the author

- `python/first-person/第一人称视觉10.py` — 339 lines, 2026-02-13. Rotation matrices,
  perspective projection, near/far clipping, frustum culling, painter's-algorithm sorting:
  all hand-written by the author.
- `python/surface/花瓣.py` — 17 lines, 2025-07-01, included verbatim, byte for byte.

## What the AI assistant did

**1. Translated comments**
All Chinese comments were translated into concise English — 24 spots. Comments only; no
logic was touched. Before and after, the program renders 45 frames to byte-identical output
(sha256 `4d184b1cf862e15b…`). File size 13,356 → 13,166 bytes.
Original Chinese comments: `git show c6072c5`.

**2. Moved the initial camera position**
`(0, 0, 0)` → `(494, 364, -494)`, Euler angles `(0,0,0)` → `(0.42, -0.78, 0)`.
Originally the camera started inside the corner where four cubes meet: the screen was one
wall of brown. Original values: `git show c6072c5`.

**3. Renamed the directories to English**
`第一人称/` → `first-person/`. File names stay Chinese, matching the author's machine.

**4. README (Chinese / English / Japanese)**
Written by the AI assistant; every claim comes from the code or from running it.

**5. Two screenshots**
Rendered with the author's code; only the presentation changed:

- `docs/cube.png` — the file run as-is, frame 45 captured
- `docs/petal.png` — the math in `花瓣.py` untouched; only `plt.show()` → `savefig`,
  axes off, dark background, different viewing angle

**6. Commit history**
Author identity unified to the repository owner; commit messages rewritten in English.

## Not changed

- `花瓣.py` is byte-identical (it has no comments and is already all English)
- v10's algorithms, math and structure are entirely the author's
