# sap-mcp-server

> Securely operate SAP ABAP and BTP services from MCP-compatible AI clients.
> MCP 対応 AI クライアントから SAP ABAP / BTP サービスを **安全に** 操作するための Model Context Protocol サーバ。

Connect to SAP **ABAP** and **BTP services** from general MCP-compatible AI clients such as
**Claude Code**, **Codex**, and **Gemini CLI**. Distributed as a single self-contained binary
(Node.js SEA) for Linux and Windows.

**Claude Code** / **Codex** / **Gemini CLI** などの汎用的な MCP 対応クライアントから、SAP の
**ABAP** および **BTP サービス**へ接続できます。配布は **Node.js SEA による単一バイナリ**（Linux / Windows）です。

> This tool is **not standalone**: it requires a backend service deployed on **SAP BTP, Cloud Foundry**.
> Through strong, multi‑layered security it accesses **on‑premise / RISE** SAP environments.
>
> 本ツールは **単体では動作せず**、**SAP BTP, Cloud Foundry** への Backend サービスの配置を必要とします。
> 強固な多層セキュリティで **On‑Premise / RISE** の SAP 環境へアクセスします。

---

## 🔒 Security / セキュリティ

Security is enforced in **multiple layers (defense in depth)**, so AI-driven access to SAP
stays controlled and auditable.

SAP への AI アクセスを統制・監査可能に保つため、セキュリティは **多段階（多層防御）** で強化されています。

| Layer / 層 | Control / 制御 |
|---|---|
| **Access scope / 権限制御** | Restrict to **Full** or **Reference‑only (read‑only)** — 操作を **フル** か **参照のみ** に権限制御できます。 |
| **Landscape / ランドスケープ** | Per‑landscape access control for **DEV / QAS / PRD** — **DEV / QAS / PRD** のランドスケープごとにアクセスを制御できます。 |
| **Authentication / 認証** | OAuth2 (`client_credentials`) で保護されたエンドポイントにのみ接続。SAP の資格情報をクライアントが保持しません。 |
| **Secret handling / 機密管理** | Connection secrets are kept **local only** and are **never** committed or embedded in the binary — 接続情報はローカルのみで管理し、リポジトリやバイナリに埋め込みません。 |

## Capabilities / できること

- **SAP ABAP**
  - **Run any remote‑enabled Function Module / BAPI without cumbersome web service configuration** —
    煩雑な Web サービス設定なしで、任意の汎用モジュール（RFC 対応 FM）/ BAPI のリモート実行を可能にします。
  - Function Modules (RFC / BAPI) — `sap_call_fm`
  - Table read (RFC_READ_TABLE 相当) — `sap_select_table`
  - ADT SQL / Open SQL / DDIC preview — `sap_adt_freestyle` / `sap_adt_osql` / `sap_adt_ddic`
- **SAP BTP services / BTP サービス**
  - Cloud Identity Services (IAS) Admin / SCIM
  - Identity Provisioning (IPS) Jobs / JobLogs
  - Cloud Foundry API v3
  - Build Work Zone (Content API)
  - Cloud Transport Management (cTMS) v2
  - Forms Service by Adobe
  - Cloud Information Service (CIS Central)
  - Integration Suite (CPI) Audit / Monitoring

## Install / インストール

Download the platform binary from GitHub Releases.
GitHub Release の Assets からプラットフォーム別バイナリを取得します。

```bash
curl -fsSL https://github.com/HUGO-Domon/sap-mcp-server/releases/latest/download/install-sap-mcp.sh | bash
```

> Binaries may be unsigned. See [docs/](docs/) for Windows SmartScreen / macOS Gatekeeper notes.
> Each asset ships with a `*.sha256` checksum.
> 配布バイナリは未署名の場合があります。各 Asset には `*.sha256` を添付します。

## Configuration / 設定

Copy `connections.example.json` to `connections.json` and fill in your environment.
`connections.example.json` をコピーして `connections.json` を作成し、自環境の値を設定します。

```bash
cp connections.example.json ~/.config/sap-mcp-server/connections.json
```

Lookup order / 探索順: `$SAP_MCP_CONFIG` → `~/.config/sap-mcp-server/connections.json` → next to the executable.

## Build (developers) / ビルド（開発者向け）

```bash
npm ci
npm run build:bundle    # esbuild → CJS bundle
npm run build:bin:linux # Node SEA blob + postject → single binary
```

## Backend / バックエンド

Actual SAP communication and the security controls above are performed by a **backend** that this
server connects to over OAuth2. A **compatible backend is required** (Bring Your Own Backend).

実際の SAP 通信と上記のセキュリティ制御は、本サーバが OAuth2 で接続する **バックエンド** が担います。
利用には **互換バックエンドが必要** です（Bring Your Own Backend）。

- The REST contract a backend must satisfy is defined in [docs/BACKEND-CONTRACT.md](docs/BACKEND-CONTRACT.md).
  バックエンドが満たすべき REST 契約は [docs/BACKEND-CONTRACT.md](docs/BACKEND-CONTRACT.md) を参照してください。
- A reference backend is **not** included in this repository. A production‑ready backend
  (setup, connection configuration, and operation) is **provided separately under a consulting engagement**.
  リファレンスバックエンドは本リポジトリには含まれません。導入支援・本番運用向けのバックエンドは
  **別途コンサルティング契約にて提供**します。お問い合わせ: contact@hugoconsulting.com

## Security Policy / セキュリティ報告

Please report vulnerabilities via [SECURITY.md](SECURITY.md).
脆弱性の報告は [SECURITY.md](SECURITY.md) を参照してください。

## License / ライセンス

[Apache License 2.0](LICENSE).
"SAP" and SAP product names are trademarks of SAP SE. This project is not affiliated with,
endorsed by, or sponsored by SAP SE. See [NOTICE](NOTICE).

[Apache License 2.0](LICENSE)。SAP および SAP 製品名は SAP SE の商標です。本プロジェクトは
SAP SE とは無関係であり、承認・後援を受けていません。詳細は [NOTICE](NOTICE) を参照してください。
