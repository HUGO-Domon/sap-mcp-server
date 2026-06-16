# バックエンド REST 契約（Backend Contract）

`sap-mcp-server` は薄いリレークライアントであり、SAP / BTP との実通信は
ユーザ環境のバックエンド（relay）が担います。本書はそのバックエンドが満たすべき
HTTP 契約を定義します。これに沿って自前実装すれば、本 OSS サーバから利用できます
（Bring Your Own Backend）。

> リファレンス実装のバックエンドは本リポジトリには含まれません。導入支援・本番運用向けの
> バックエンドは別途コンサルティング契約にて提供します。

---

## 接続

- ベース URL: `connections.json` の `relayUrl`（例 `https://your-backend.example.com`）
- ベースパス: `relayBasePath`（既定 `/api/mcp`）
- 各エンドポイントは **`POST {relayUrl}{relayBasePath}{endpoint}`**、ボディは JSON。

## 認証

クライアントは OAuth2 `client_credentials` で取得した Bearer トークンを付与します。

1. トークン取得: `POST {tokenUrl}`（Basic 認証 = `clientId:clientSecret`、body `grant_type=client_credentials`）
   - レスポンス: `{ "access_token": "...", "expires_in": <秒> }`
2. リレー呼び出し時のヘッダ:
   - `Authorization: Bearer <access_token>`
   - `Content-Type: application/json`
   - `X-MCP-User: mcp:<接続キー>`
3. バックエンドは受け取った Bearer を検証し、`401` を返した場合クライアントはトークンを破棄して再取得します。

## エンドポイント一覧

すべて `POST`。`destination` は BTP Destination 名、`client` は SAP マンダント。

### ABAP / 一覧

| エンドポイント | 主な body | 期待レスポンス |
|---|---|---|
| `/list-destinations` | `{}` | `{ "items": [ ... ] }` |
| `/call-fm` | `{ destination, client, fm, importing[], exporting[], tabparams[], commit }` | `{ "result": ... }` |
| `/select` | `{ destination, client, table, fields[], where[], maxrows }` | `{ "rows": [ ... ] }` |
| `/adt-freestyle` | `{ destination, client, sql, rowCount }` | 任意 JSON |
| `/adt-osql` | `{ destination, client, sql, rowCount }` | 任意 JSON |
| `/adt-ddic` | `{ destination, client, ddicName, rowCount }` | 任意 JSON |

### BTP サービス（汎用 REST プロキシ）

以下は共通 body `{ destination, method, path, query, body, headers, timeoutMs }` を受け取り、
対象サービスへ中継した結果 JSON を返します。

| エンドポイント | 対象 |
|---|---|
| `/call-ias-admin` | SAP Cloud Identity Services (IAS) Admin / SCIM |
| `/call-ips-job` | Identity Provisioning (IPS) Jobs / JobLogs |
| `/call-cf-api` | Cloud Foundry API v3 |
| `/call-bwz-content` | Build Work Zone Content API |
| `/call-ctms-api` | Cloud Transport Management v2 |
| `/call-forms-api` | Forms Service by Adobe REST API |
| `/call-cis-api` | Cloud Information Service (CIS Central) |
| `/call-cpi-api` | Integration Suite (CPI) Audit / Monitoring |

## エラー

- 非 2xx は HTTP ステータスとボディ（先頭 200 文字）がクライアントのエラーメッセージに反映されます。
- `401` はトークン失効として扱われ、クライアントは次回呼び出しで再認証します。

## タイムアウト

- クライアント既定: 110 秒（BTP 系は body の `timeoutMs` で上書き可能）。
- バックエンドはこれ以内に応答するか、適切なエラーを返してください。
