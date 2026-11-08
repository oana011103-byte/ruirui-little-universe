# Asset provenance
- Nine game photographs and two game recordings: user-supplied 新建文件夹.zip. Optimized for web delivery; original files retained locally in source-materials/.
- delta.webp and poker.webp: frames extracted from the corresponding user video at 10 seconds.
- Earth texture: https://cdn.jsdelivr.net/npm/three-globe@2.31.1/example/img/earth-blue-marble.jpg
- Earth topography: https://cdn.jsdelivr.net/npm/three-globe@2.31.1/example/img/earth-topology.png
- Three.js r170 module: https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js (MIT).
- Stars, orbit geometry, candle controls and icons are authored with Canvas, CSS and SVG. The cake is a generated transparent raster illustration.

## User-requested grain-globe revision
The exact grain shader, UV grain treatment, 22,000 surface dust points, land-mask generation and initial Asia-facing rotation are reused from the user's existing `suancai-planet/dist/globes.js` (the middle globe on the supplied /globes reference). Source files `world.json`, d3/topojson and `display.woff` were copied locally from that project; the font license is shipped at `dist/assets/FONT-LICENSE.txt`. The main globe no longer uses a photographic texture; the previous Earth file remains only for the no-WebGL fallback.

## Hand-drawn memory markers
The unmodified transparent PNG files `star-five.png`, `star-four.png`, and `sparkle-eight.png` are user-provided artwork copied from `/Users/oana/cola/outputs/Planet-Susu-恋爱游戏网站/assets/doodles/`. Used as CSS masks for the Earth memory markers.

## Birthday cake revision (2026-11-02)
`dist/assets/birthday-cake-handpainted.png` is an original transparent 1254×1254 PNG produced with built-in image_gen. The user-supplied birthday reference informed the warm custard, chocolate, blue and cherry palette and handmade character. The round cake, side motifs, composition and lack of typography differ from the reference. Exact generation prompt, mode and original output path are in `dist/assets/birthday-cake-handpainted.txt`. The cake remains stationary; separate DOM candles provide lighting/blowing feedback, and Canvas draws large colored star fireworks.

## Misty blue stars background (2026-11-02)
`dist/assets/misty-blue-stars-background.png` is generated with built-in image_gen, inspired by the user-supplied soft-focus star wallpaper. Light folds and star placement are rearranged; all background stars use pale blue hues. Exact prompt and source provenance are in the adjacent `.txt` file. The self-hosted image uses responsive CSS cover. The previous Canvas background stars were removed.

## Macaron cake replacement (2026-11-02)
`dist/assets/birthday-cake-macaron.png` replaces the previous painterly chocolate cake for the user's latest simple flat macaron-color request. Original clean flat pastel illustration generated with built-in image_gen; exact prompt and source path in adjacent `.txt`. The previous cake asset is retained for provenance but is no longer rendered.

## Selected geometric cake A (2026-11-02)
`dist/assets/birthday-cake-a-sand-unlit.png` is a built-in image_gen edit of the user's selected A preview. It preserves the flat milk-white geometric strawberry cake and mint striped candles, with stronger diffused color and sandy grain. The raster has no flames or glow; three positioned DOM flames appear only after lighting, disappear after blowing, and reset on opening. Exact prompt, mode and reference are recorded in the adjacent `.txt`. Earlier cake assets are retained but no longer rendered.

## Rounded coastlines (2026-11-02)
The user-confirmed round-continent preview is now used in the globe. `rounded-land.js` simplifies and rounds the merged TopoJSON coastline; `grain-earth.js` softens the seamless mask. Original sea/land colors, dust and grain remain unchanged.

## Birthday page confetti (2026-11-02)
`birthday-confetti.js` reuses the pastel palette and tumbling rectangular-paper behavior shared by the user’s `/Users/oana/cola/outputs/Planet-Susu-恋爱游戏网站/index.html` and `/Users/oana/cola/outputs/oana个人主页/index.html`. Movement is time-based, viewport-aware, and stops on navigation/background; reduced motion uses a static paper scatter and fade. It replaces the previous star-firework animation. The selected unlit A cake raster is unchanged.

## Warm birthday arrangement (2026-11-02)
`dist/assets/birthday-warm-piano.mp3` is a complete 23.59-second, stereo soft-keyboard arrangement rendered without external samples or recordings. Reproducible score, synthesis and mastering are in `scripts/render-birthday-music.py`; adjacent `.txt` records provenance. Continuous overlapping releases, quiet broken chords and a small diffuse room replace the previous individually scheduled short sine notes. Browser-native media playback preserves the full tail and supports pause/resume; blowing, leaving or hiding the page stops playback.

## Saucer arrival (2026-11-03)
`dist/assets/arrival-ufo.webp` and `dist/assets/arrival-couple.webp` are original transparent illustrations generated with built-in ImageGen. Ice blue, mint white and fine sand grain match the existing universe. CSS adds the light beam and lift; no characters or spacecraft are copied from the references. Exact prompts, final paths, original paths and conversion details are in [arrival artwork](docs/arrival-artwork.md). Combined transfer size is about 662 KB.

## Owner handwriting (2026-11-03)
`dist/assets/oana-soul-hand.woff` is an unmodified copy of the user’s `/Users/oana/cola/outputs/Planet-Susu-恋爱游戏网站/OanaSoulHand-Regular.woff`. Font metadata identifies Oana Soul Hand Regular; it includes A–Z, a–z and 0–9, and no CJK ideographs. `latin-hand.css` limits its use to Latin letters and digits. Existing Chinese fonts remain in place.

## Pointed-hat pixies (2026-11-03)
`dist/assets/arrival-pixies.webp` replaces the opening's human couple with two original pastel pixies generated using built-in ImageGen. Exact prompt and original path: [pixie artwork](docs/arrival-pixies.md). The previous pair is retained as an unused historical asset.

`dist/assets/arrival-pixies-chibi.webp` is the latest, rounder chibi replacement, displayed at half the previous dimensions. Generated with built-in ImageGen; prompt and source: [chibi pixies](docs/arrival-pixies-chibi.md).

- `assets/oana-soul-hand-cn.woff`：用户 Planet Susu 项目中的 OanaSoulHand-CN-Titles-933.woff，原样复制，用于指定中文标题；字体包含所需四处文字的全部字形。

- `assets/arrival-pencil-ufo.webp`：基于用户 2026-11-06 彩铅参考图，通过内置 imagegen 分离整理的外星人飞船，透明 WebP 800×533。
- `assets/arrival-fluffy-pair.webp`：同一参考图中的白色耳机角色与橙色毛绒角色，透明 WebP 512×341。提示词与来源记录于 `docs/arrival-pencil-artwork.md`。

## 2026-11-07 高清录像

两段高清版本来自用户原始 1920×1080、30fps 文件，编码为 H.264/AAC MP4：CRF 22，最高视频码率约 3.2 Mbps、缓冲 6.4 Mbps，2 秒关键帧，faststart。新文件为 `delta-hd.mp4` 与 `poker-hd.mp4`，保留原 540p 流畅版本；省流/慢网优先流畅版，高清连续缓冲时自动切换到流畅版。未修改时长、画面内容、帧率或配音。

## 2026-11-07 完整混合 BGM

`dist/assets/audio/world-full-mix.m4a` 从用户提供的 `ScreenRecording_11-07-2026 12-36-39_1.MP4` 直接抽取首条 AAC 立体声音轨，保留视频中完整约 3 分 52 秒的音乐与人声；音频流原样复制，未做人声分离、消伴奏或二次压缩。主页面与信件页使用此版本，蛋糕页仍使用原 `birthday-warm-piano.mp3`。

## 2026-11-08 三角洲原画与播放缓冲

`dist/assets/delta-original.mp4` 从用户原始《视频 三角洲.mp4》原样复制 H.264 与 AAC 码流，只重新封装并把 MP4 索引移至文件头（faststart）；保留 1920×1080、30fps、约 9.7 Mbps 的源画面，无二次压缩。已校验视频码流 SHA-256 与原始文件一致。三角洲默认原画，备用为已有 1080p 轻量版，不再自动切换至 540p；播放器固定信息行可手动切换，并保留播放位置与暂停状态。

主 BGM 文件未改动（仍是录屏提取的完整音乐与人声），改为提前加载并在首次可闻播放前缓冲至少 8 秒；移动端需要时在实际点击中静音解锁。对话框或生日页打开、页面隐藏时停止地球持续渲染；正常闲置旋转限制为 30fps，拖动保持即时响应。

原画文件通过本仓库 `media-original-v1` Release 保存，避开 Git 数据 API 的大请求限制；CI 下载并核对完整文件 SHA-256 `466f5d0585af648889d73260a438258b580d77697ce9b1078f9f164ed2479c98`，再打包到 Pages。播放器仍使用同站点的相对路径，访客播放无需访问 Release 链接。
