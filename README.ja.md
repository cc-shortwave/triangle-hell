# triangle-hell

[中文](README.md) · [English](README.en.md) · [日本語](README.ja.md)

*Hand-rolled first-person 3D renderer. ~20k triangles per rebuild, no 3D engine.*
*The math is mine — so are the bugs.*

中学生が Python で書いた 3D レンダラ。3D エンジンなし、OpenGL なし、Three.js なし ——
ビュー変換、透視投影、近遠クリップ、視錐カリング、画家のアルゴリズムによるソートまで、
すべて手書きです。描画は `pygame`、行列演算は `numpy`。

## 2 枚の画像

![キューブ](docs/cube.png)

`python/first-person/第一人称视觉10.py` が実際に描いた画面。300³ のキューブ 4 つを
突き合わせたもので、中央の十字の切れ込みは 4 つが接する位置です。
カメラの初期位置は最初の commit では `(0,0,0)` で、開始直後は壁が目の前にありました。
いまはキューブの外側から始まるので、1 フレーム目から全体が見えます。

![花びら](docs/petal.png)

`python/surface/花瓣.py`、numpy + matplotlib で 17 行。パラメトリック曲面 1 枚です：

```python
r = a * (1 - u**2) * (1 + b*u)
x = r * np.cos(v) * (1 - k*u*np.sin(v/2))
z = r * np.sin(v) * (1 + k*u*np.cos(v))
y = u
```

パラメータを少し動かすと、葉っぱが花びらに変わります。

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

（`花瓣.py` は `matplotlib` も必要です：`pip install numpy matplotlib`、
その後 `python "python/surface/花瓣.py"`。）

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

## 誰が書いたか

コードは CC。3 か国語の README、2 枚の画像、コメントの英訳、カメラの初期位置は
AI アシスタントによるものです。コメントは英語に置き換えただけで、ロジックは一行も
変えていません（変更前後でレンダリング結果はバイト単位で同一）。

詳細は [docs/provenance.md](docs/provenance.md)。

## License

MIT
