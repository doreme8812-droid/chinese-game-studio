# 中文教学工具库 Chinese Teaching Toolkit

面向对外汉语老师的课堂互动游戏、生成器与教学工具库。
一个站点、两个入口版（简体版 / 繁体版），工具数据只维护一份。

**在线地址：** https://chinese-game-studio-62697.app.workbuddy.host/

## 内容

- **游戏生成器（13 款）**：老师输入生词/句子 → 生成可下载的学生版网页游戏
  - 看图说话卡片、宾果 Bingo、转盘抽奖、听音选字、汉字闯关、灵动贪吃蛇、中文找字、生词阅读、阅读认知训练、语块重组造句、造句小火车、汉字笔画、粤语通关
- **课堂工具**：Dora 教学白板（普通话 + 粤语双语注音）

## 技术特点

- 全部工具**零 CDN 依赖**：原生 JS + 内联 CSS，学生在中国网络下可离线打开
- 老师端生成的学生网页同样是单文件自包含 HTML
- 简体版 / 繁体版双入口（`?ed=traditional`），工具数据单份维护
- 筛选维度：用途 · 字形（简/繁）· 语种（普通话/粤语）· 注音（拼音/耶鲁/粤拼），筛选状态写入 URL 可分享

## 目录结构

```
index.html              门户首页（双入口版 + 四组筛选）
assets/games.js         工具目录数据（加新工具只改这一个文件）
assets/previews/        工具卡片预览图（真实截图，自动生成）
assets/styles.css       门户样式
generators/             13 个单文件生成器
scripts/make-previews.mjs  预览图生成脚本（本机 Chrome 无头截屏）
tools/whiteboard/       教学白板（Vite 构建产物，多文件应用）
sync-whiteboard.sh      白板更新同步脚本
```

## 维护：更新预览图

首页卡片顶部显示每个工具的**真实界面截图**（`assets/previews/<id>.webp`）。
工具改版或新增工具后，重跑一次脚本即可全部重新生成（需本机装有 Chrome）：

```bash
node scripts/make-previews.mjs
```

某个工具若暂时没有截图文件，卡片会自动回退显示 emoji 图标。

## 如何加一个新工具

在 `assets/games.js` 的 `GAMES` 数组里加一条（含简繁两套文案），把单文件 HTML 放进 `generators/` 即可，两个版本都会出现。

## 更新白板

白板项目里 `npm run build` 后，运行 `./sync-whiteboard.sh` 同步到本站，再重新发布。
