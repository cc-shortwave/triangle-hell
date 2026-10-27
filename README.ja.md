# triangle-hell

[中文](README.md) · [English](README.en.md) · [日本語](README.ja.md)

*Hand-rolled first-person 3D renderer. ~20k triangles per rebuild, no 3D engine.*
*The math is mine — so are the bugs.*

中学生が Python で書いた 3D レンダラ。3D エンジンなし、OpenGL なし、Three.js なし ——
ビュー変換、透視投影、近遠クリップ、視錐カリング、画家のアルゴリズムによるソートまで、
すべて手書きです。描画は `pygame`、行列演算は `numpy`。

## 1 フレームでやっている 4 つのこと

1. **ビュー変換** —— ワールド座標からカメラ位置を引き、回転行列の**転置**を掛ける
2. **透視投影** —— 画面の高さと視野角から焦点距離を出し、奥行きで割って拡大率にする
3. **カリング** —— 近遠クリップ + 頂点ごとの視錐テスト
4. **ソートして描画** —— 三角形の重心の奥行きで奥から手前へ（画家のアルゴリズム）。
   半透明は `temp_layer` で重ねる

カメラは **Y-up**：`forward = R @ [0,0,1]`、`up = R @ [0,1,0]`、
オイラー角の順序は `Ry · Rx · Rz`。

## 動かす

```bash
pip install numpy pygame
python "python/first-person/第一人称视觉10.py"
```

`WASD` で移動、マウスで視点、`G` でゲームモード / フリーモードを切り替え。

1 ファイル、339 行。ゲームモードでは `forward` を水平面に投影します（歩く動き）。
フリーモードは 6 自由度の飛行です。

## 数学の数行

**透視投影** —— 画面の高さと視野角で焦点距離が決まる：

```python
SCALE = SCREEN_HEIGHT / (2 * np.tan(np.radians(FIELD_OF_VIEW / 2)))
x = point[0] * SCALE / depth + SCREEN_WIDTH / 2
y = SCREEN_HEIGHT / 2 - point[1] * SCALE / depth
```

**ビュー変換** —— カメラ原点へ移動してから、転置行列を掛ける：

```python
rotated = camera.rotation_matrix.T @ (point - camera.position)
```

**画家のアルゴリズム** —— 重心の奥行きで奥から手前へ描く：

```python
sorted(triangles, key=lambda t: t.center_z, reverse=True)
```

## 既知の制限

このバージョンには 2 つの単純化があります：

- **本物の近クリップ面カリングをしていない**：頂点が 1 つでも近平面の外に出ると、
  `project()` は三角形を分割せずに丸ごと捨てます。そのためカメラを近づけると
  三角形が突然消えます
- **ソートは重心の奥行きのみ**で、ピクセル単位ではありません。三角形が交差していると
  描画順が狂います —— 画家のアルゴリズムの昔からの問題です

> *The math is mine — so are the bugs.*

## License

MIT
