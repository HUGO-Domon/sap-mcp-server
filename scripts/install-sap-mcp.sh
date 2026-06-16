#!/usr/bin/env bash
# sap-mcp-server バイナリ + Claude Code セットアップ用 1 行 install スクリプト。
#
# 使い方:
#   curl -fsSL https://github.com/HUGO-Domon/sap-mcp-server/releases/latest/download/install-sap-mcp.sh | bash
#
# 動作:
#   1. プラットフォーム判定（linux / wsl のみ対応・windows は手動 .exe DL）
#   2. Claude Code をインストール（npm install -g @anthropic-ai/claude-code）
#   3. sap-mcp-server バイナリを ~/sap-mcp-server/ に DL + chmod +x
#   4. connections.json.example を ~/.config/sap-mcp-server/ に配置（実体は手動）
#   5. ~/.claude.json に mcpServers 設定を upsert
#
# 環境変数:
#   SAP_MCP_REPO        GitHub リポジトリ（既定: HUGO-Domon/sap-mcp-server）
#   SAP_MCP_VERSION     取得するリリースタグ（既定: latest）
#   SAP_MCP_BINARY_URL  バイナリの DL 元 URL を直接指定（指定時は GitHub Releases を使わない）
#   GH_TOKEN            private repo / API rate limit 回避用 token（任意）
#
set -euo pipefail

REPO="${SAP_MCP_REPO:-HUGO-Domon/sap-mcp-server}"
RELEASE_TAG="${SAP_MCP_VERSION:-latest}"
BIN_URL="${SAP_MCP_BINARY_URL:-}"
ASSET="sap-mcp-server-linux"
INSTALL_DIR="$HOME/sap-mcp-server"
CONFIG_DIR="$HOME/.config/sap-mcp-server"
CLAUDE_CONFIG="$HOME/.claude.json"

echo "=== sap-mcp-server インストール ==="

# 1. プラットフォーム判定
OS=$(uname -s)
if [ "$OS" != "Linux" ]; then
  echo "Linux 以外は未対応です（Windows は .exe を手動 DL してください）。OS=$OS" >&2
  exit 1
fi

# 2. Claude Code インストール
if ! command -v claude >/dev/null 2>&1; then
  echo "[1/4] Claude Code をインストールします..."
  if ! command -v npm >/dev/null 2>&1; then
    echo "npm が必要です（Node.js 18+ をインストール後に再実行してください）" >&2
    exit 1
  fi
  npm install -g @anthropic-ai/claude-code
else
  echo "[1/4] Claude Code は既にインストール済"
fi

# 3. バイナリ DL（公開 Release は匿名 DL 可。fallback で gh CLI / GH_TOKEN）
echo "[2/4] バイナリを $INSTALL_DIR にダウンロード..."
mkdir -p "$INSTALL_DIR"
if [ -n "$BIN_URL" ]; then
  curl -fsSL "$BIN_URL" -o "$INSTALL_DIR/$ASSET"
elif command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  if [ "$RELEASE_TAG" = "latest" ]; then
    gh release download --repo "$REPO" --pattern "$ASSET" --dir "$INSTALL_DIR" --clobber
  else
    gh release download "$RELEASE_TAG" --repo "$REPO" --pattern "$ASSET" --dir "$INSTALL_DIR" --clobber
  fi
else
  AUTH_HEADER=()
  [ -n "${GH_TOKEN:-}" ] && AUTH_HEADER=(-H "Authorization: Bearer $GH_TOKEN")
  if [ "$RELEASE_TAG" = "latest" ]; then
    DL_URL="https://github.com/$REPO/releases/latest/download/$ASSET"
  else
    DL_URL="https://github.com/$REPO/releases/download/$RELEASE_TAG/$ASSET"
  fi
  curl -fsSL "${AUTH_HEADER[@]}" "$DL_URL" -o "$INSTALL_DIR/$ASSET"
fi
chmod +x "$INSTALL_DIR/$ASSET"
echo "       $(ls -lh "$INSTALL_DIR/$ASSET" | awk '{print $5}')  ($("$INSTALL_DIR/$ASSET" --version))"

# 4. connections.json テンプレ配置
echo "[3/4] $CONFIG_DIR を準備..."
mkdir -p "$CONFIG_DIR"
chmod 700 "$CONFIG_DIR"
if [ ! -f "$CONFIG_DIR/connections.json" ]; then
  cat > "$CONFIG_DIR/connections.json.example" <<'EOF'
{
  "defaultTenant": "primary",
  "tenants": {
    "primary": {
      "defaultDestination": "<SID>",
      "relayUrl":     "https://your-backend.example.com",
      "relayBasePath": "/api/mcp",
      "clientId":     "REPLACE_WITH_CLIENT_ID",
      "clientSecret": "REPLACE_WITH_CLIENT_SECRET",
      "tokenUrl":     "https://your-idp.example.com/oauth/token"
    }
  }
}
EOF
  echo "       テンプレを $CONFIG_DIR/connections.json.example に配置済"
  echo "       ⚠ connections.json は手動で作成し、自環境のバックエンド URL と資格情報を設定してください"
else
  echo "       既存 connections.json を維持"
fi

# 5. ~/.claude.json に mcpServers.sap-mcp-server を upsert
echo "[4/4] $CLAUDE_CONFIG を更新..."
mkdir -p "$(dirname "$CLAUDE_CONFIG")"
python3 - "$CLAUDE_CONFIG" "$INSTALL_DIR/sap-mcp-server-linux" <<'PY'
import json, os, sys
path, binary = sys.argv[1], sys.argv[2]
data = {}
if os.path.exists(path):
    try:
        with open(path) as f: data = json.load(f)
    except: data = {}
data.setdefault('mcpServers', {})
data['mcpServers']['sap-mcp-server'] = { 'command': binary, 'args': [] }
with open(path, 'w') as f: json.dump(data, f, indent=2, ensure_ascii=False)
print(f"       {path} に mcpServers.sap-mcp-server を登録")
PY

echo ""
echo "=== セットアップ完了 ==="
echo ""
echo "次のステップ（手動）:"
echo "  1. nano $CONFIG_DIR/connections.json で接続情報を設定"
echo "  2. chmod 600 $CONFIG_DIR/connections.json"
echo "  3. claude を起動 → /mcp で sap-mcp-server が認識されているか確認"
