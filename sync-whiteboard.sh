#!/bin/bash
# ============================================================
# 把「Dora 教学白板」的最新构建产物同步到「中文游戏工坊」网站
#
# 用法（白板改版后跑一次即可）：
#   1. 在白板项目里重新构建：cd /Users/Dora_1/WorkBuddy/Claw/workbench/whiteboard-plus && npm run build
#   2. 双击本脚本，或在终端运行：bash sync-whiteboard.sh
#   3. 同步完还要「重新发布网站」才会在线上生效
#
# 说明：白板构建配置 base: './'，产物用相对路径，放在任意子目录都能跑。
# ============================================================

SRC="/Users/Dora_1/WorkBuddy/Claw/workbench/whiteboard-plus/dist"
DST="/Users/Dora_1/WorkBuddy/Claw/chinese-game-studio/tools/whiteboard"

if [ ! -f "$SRC/index.html" ]; then
  echo "❌ 找不到白板构建产物：$SRC/index.html"
  echo "请先在白板项目里执行：npm run build"
  exit 1
fi

# 清空旧资产（构建文件名带 hash，不清会越积越多），只清 assets 目录内的文件
rm -f "$DST/assets"/*
mkdir -p "$DST/assets"

cp "$SRC/index.html" "$SRC/manifest.json" "$SRC/canto.json" "$SRC/kb-index.json" \
   "$SRC/icon-192.png" "$SRC/icon-512.png" "$SRC/icon.svg" "$DST/"
cp "$SRC/assets"/*.js "$SRC/assets"/*.css "$DST/assets/"

echo "✅ 白板已同步到：$DST"
ls -1 "$DST" "$DST/assets"
echo ""
echo "下一步：重新发布网站，线上才会更新。"
