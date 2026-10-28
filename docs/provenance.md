# 来源说明 · Provenance · 出典

这个仓库里的代码由**作者**编写。整理、配图、英译这些包装工作由 AI 助手完成。
下面逐项列清，方便任何人核对。

本文件由 AI 助手撰写，每一条都经过实测或文件比对。

## 代码：作者

- `python/first-person/第一人称视觉10.py` —— 339 行，2026-02-13。旋转矩阵、透视投影、
  近远裁剪、视锥剔除、画家算法排序，全部由作者手写。
- `python/surface/花瓣.py` —— 17 行，2025-07-01，原样收录，一个字节未动。

## AI 助手做的

**1. 注释英译**
全部中文注释译为简练英文，共 24 处。只动注释，代码逻辑一行未改 —— 改前改后各渲染
45 帧，输出图片逐字节相同（sha256 `4d184b1cf862e15b…`）。
文件大小 13,356 → 13,166 字节。原中文注释见 `git show c6072c5`。

**2. 相机初始位置**
`(0, 0, 0)` → `(494, 364, -494)`，欧拉角 `(0,0,0)` → `(0.42, -0.78, 0)`。
原版开局站在四个立方体交界处，屏幕上只有一片褐色，什么都看不见。原值见 `git show c6072c5`。

**3. 目录名英文化**
`第一人称/` → `first-person/`。文件名保持中文，与作者本机一致。

**4. README（中 / 英 / 日三份）**
全部由 AI 助手撰写，事实来源是代码和实测。

**5. 两张图**
用作者的代码跑出来，只换了画法：

- `docs/cube.png` —— 原文件直接运行，截第 45 帧
- `docs/petal.png` —— `花瓣.py` 的数学一行未改，只把 `plt.show()` 换成 `savefig`、
  关掉坐标轴、换深色底、调了视角

**6. 提交历史**
作者身份统一为仓库所有人，提交信息改为英文。

## 没有改的

- `花瓣.py` 一个字节未动（0 注释，本来就是全英文）
- 视觉10 的算法、数学、结构全部出自作者

---

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

---

このリポジトリのコードは**作者**が書いたものです。README、画像、コメントの英訳といった
梱包作業は AI アシスタントが行いました。以下に項目ごとに示します。

この文書自体も AI アシスタントが書いたもので、各項目はファイルとの照合または実行で
確認しています。

## コード：作者

- `python/first-person/第一人称视觉10.py` —— 339 行、2026-02-13。回転行列、透視投影、
  近遠クリップ、視錐カリング、画家のアルゴリズムによるソート、すべて作者の手書きです。
- `python/surface/花瓣.py` —— 17 行、2025-07-01。原本のまま、1 バイトも変えていません。

## AI アシスタントが行ったこと

**1. コメントの英訳**
中国語のコメント 24 か所を簡潔な英語に訳しました。変更したのはコメントだけで、
ロジックは一行も触っていません。変更前後でそれぞれ 45 フレームをレンダリングし、
出力画像はバイト単位で同一です（sha256 `4d184b1cf862e15b…`）。
ファイルサイズ 13,356 → 13,166 バイト。元の中国語コメントは `git show c6072c5`。

**2. カメラの初期位置**
`(0, 0, 0)` → `(494, 364, -494)`、オイラー角 `(0,0,0)` → `(0.42, -0.78, 0)`。
元は 4 つのキューブが接する角の内側から始まり、画面が茶色一色でした。
元の値は `git show c6072c5`。

**3. ディレクトリ名の英語化**
`第一人称/` → `first-person/`。ファイル名は作者の環境と揃えるため中国語のままです。

**4. README（中国語 / 英語 / 日本語）**
すべて AI アシスタントが執筆。記述はコードと実測に基づいています。

**5. 2 枚の画像**
作者のコードで描画し、画法だけを変えています：

- `docs/cube.png` —— 原本をそのまま実行し、45 フレーム目を保存
- `docs/petal.png` —— `花瓣.py` の数式はそのまま。`plt.show()` を `savefig` に変え、
  軸を消し、暗い背景にし、視点を変えただけです

**6. コミット履歴**
作者情報をリポジトリ所有者に統一し、コミットメッセージを英語に書き換えました。

## 変更していないもの

- `花瓣.py` は 1 バイトも変更なし（コメントがなく、元から全て英語）
- 视觉10 のアルゴリズム・数学・構造はすべて作者によるもの
