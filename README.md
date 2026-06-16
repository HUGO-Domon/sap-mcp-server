# sap-mcp-server

**English** | [日本語](README.ja.md)

> Securely operate SAP ABAP and BTP services from MCP-compatible AI clients.

Connect to SAP **ABAP** and **BTP services** from general MCP-compatible AI clients such as
**Claude Code**, **Codex**, and **Gemini CLI**. Distributed as a single self-contained binary
(Node.js SEA) for Linux and Windows.

> This tool is **not standalone**: it requires a backend service deployed on **SAP BTP, Cloud Foundry**.
> Through strong, multi-layered security it accesses **on-premise / RISE** SAP environments.

---

## 🔒 Security

Security is enforced in **multiple layers (defense in depth)**, so AI-driven access to SAP
stays controlled and auditable.

| Layer | Control |
|---|---|
| **Access scope** | Restrict access to **Full** or **Reference-only (read-only)**. |
| **Landscape** | Per-landscape access control for **DEV / QAS / PRD**. |
| **Authentication** | Connects only to OAuth2 (`client_credentials`)-protected endpoints; SAP credentials are never held by the client. |
| **Secret handling** | Connection secrets are kept **local only** and are **never** committed or embedded in the binary. |

## Capabilities

- **SAP ABAP**
  - **Run any remote-enabled Function Module / BAPI without cumbersome web service configuration.**
  - Function Modules (RFC / BAPI) — `sap_call_fm`
  - Table read (RFC_READ_TABLE-equivalent) — `sap_select_table`
  - ADT SQL / Open SQL / DDIC preview — `sap_adt_freestyle` / `sap_adt_osql` / `sap_adt_ddic`
- **SAP BTP services**
  - Cloud Identity Services (IAS) Admin / SCIM
  - Identity Provisioning (IPS) Jobs / JobLogs
  - Cloud Foundry API v3
  - Build Work Zone (Content API)
  - Cloud Transport Management (cTMS) v2
  - Forms Service by Adobe
  - Cloud Information Service (CIS Central)
  - Integration Suite (CPI) Audit / Monitoring

## Install

Download the platform binary from GitHub Releases.

```bash
curl -fsSL https://github.com/HUGO-Domon/sap-mcp-server/releases/latest/download/install-sap-mcp.sh | bash
```

> Binaries may be unsigned. See [docs/](docs/) for Windows SmartScreen / macOS Gatekeeper notes.
> Each asset ships with a `*.sha256` checksum.

## Configuration

Copy `connections.example.json` to `connections.json` and fill in your environment.

```bash
cp connections.example.json ~/.config/sap-mcp-server/connections.json
```

Lookup order: `$SAP_MCP_CONFIG` → `~/.config/sap-mcp-server/connections.json` → next to the executable.

## Build (developers)

```bash
npm ci
npm run build:bundle    # esbuild → CJS bundle
npm run build:bin:linux # Node SEA blob + postject → single binary
```

## Backend

Actual SAP communication and the security controls above are performed by a **backend** that this
server connects to over OAuth2. A **compatible backend is required** (Bring Your Own Backend).

- The REST contract a backend must satisfy is defined in [docs/BACKEND-CONTRACT.md](docs/BACKEND-CONTRACT.md).
- A reference backend is **not** included in this repository. A production-ready backend
  (setup, connection configuration, and operation) is **provided separately under a consulting engagement**.
  Contact: contact@hugoconsulting.com

## Security Policy

Please report vulnerabilities via [SECURITY.md](SECURITY.md).

## License

[Apache License 2.0](LICENSE).
"SAP" and SAP product names are trademarks of SAP SE. This project is not affiliated with,
endorsed by, or sponsored by SAP SE. See [NOTICE](NOTICE).
