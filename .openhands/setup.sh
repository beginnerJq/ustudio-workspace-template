#!/bin/bash
echo "[ustudio] Running setup.sh..."

# 如果 node_modules 不存在，执行 npm install
if [ ! -d "node_modules" ]; then
  echo "[ustudio] Installing dependencies..."
  npm install
  echo "[ustudio] Dependencies installed."
else
  echo "[ustudio] node_modules already exists, skipping install."
fi

# 确认关键文件存在
if [ -f "src/core/facade.ts" ]; then
  echo "[ustudio] Template verified: facade.ts exists"
else
  echo "[ustudio] WARNING: facade.ts not found!"
fi

if [ -f ".openhands/microagents/ustudio.md" ]; then
  echo "[ustudio] Microagent verified: ustudio.md exists"
else
  echo "[ustudio] WARNING: ustudio.md not found!"
fi

echo "[ustudio] Setup complete."
