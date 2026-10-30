← back to [English](../../README.md) · [中文](../../README.zh.md) · [日本語](../../README.ja.md)

# 花瓣.py — one surface, four lines of math

![Petal](../../docs/petal.png)

17 lines of `numpy` + `matplotlib`, no 3D engine: a parametric surface over
`u ∈ [0, 1]` × `v ∈ [0, 2π]`, drawn with a single `plot_surface` call.

$$
\begin{aligned}
r &= a(1-u^2)(1+bu) \\
x &= r\cos(v)\left(1 - k\cdot u\sin(v/2)\right) \\
z &= r\sin(v)\left(1 + k\cdot u\cos(v)\right) \\
y &= u
\end{aligned}
$$

with a = 1, b = 0.5, k = 0.3, u ∈ [0, 1], v ∈ [0, 2π].

`r(u)` alone is a body of revolution: it narrows to a point at `u = 1` and swells
towards the base. The `k` term is what breaks the symmetry — it pushes `x` and `z`
sideways by an amount that depends on both `u` and `v`, so the cross-section stops
being a circle. Nudge the parameters and the leaf turns into a petal.

Mesh: 20 × 32 samples, 640 quads. Coloured with matplotlib's `viridis`.

## Run it

```bash
pip install numpy matplotlib
python "python/surface/花瓣.py"
```

The script opens matplotlib's own 3D window; the picture above was rendered
separately with a fixed view and a dark background — see
[docs/provenance.md](../../docs/provenance.md) for exactly what was changed.
