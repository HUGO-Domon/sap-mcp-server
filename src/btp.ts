// SPDX-License-Identifier: Apache-2.0
/**
 * BTP サービス API ツール群
 *
 * バックエンド（relay）の /call-<category> エンドポイントを経由し、
 * IAS Admin / IPS Jobs / CF API v3 / BWZ Content / cTMS / Forms / CIS / CPI
 * の REST API を Destination 経由で呼び出す。
 *
 * destination の有効性検査はバックエンド側で実施する。
 */

import { relay } from './destinations.js';
import type { ConnectionConfig } from './config.js';

export interface BtpCallArgs {
  destination: string;
  method?:     'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';
  path:        string;
  query?:      Record<string, string | number | boolean | string[] | undefined>;
  body?:       any;
  headers?:    Record<string, string>;
  timeoutMs?:  number;
}

async function _call(connection: ConnectionConfig, endpoint: string, args: BtpCallArgs) {
  if (!args.destination) throw new Error('destination が必要です');
  if (!args.path)        throw new Error('path が必要です');
  return relay(connection, endpoint, {
    destination: args.destination,
    method:      (args.method || 'GET').toUpperCase(),
    path:        args.path,
    query:       args.query,
    body:        args.body,
    headers:     args.headers,
    timeoutMs:   args.timeoutMs,
  });
}

// SCIM 系 path は Accept: application/scim+json が必須 (default Accept → 406)
// IAS Identity Directory: /scim/v2/*, 旧 SCIM v1: /scim/*, IPS SCIM proxy: /api/v1/scim/{SystemId}/*
function _ensureScimAcceptHeader(args: BtpCallArgs): BtpCallArgs {
  const isScim = args.path.startsWith('/scim') || args.path.includes('/api/v1/scim/');
  if (!isScim) return args;
  // ユーザー指定 Accept があれば尊重（spread 順で後勝ち）
  const headers = { Accept: 'application/scim+json', ...(args.headers || {}) };
  return { ...args, headers };
}

// IAS Admin API (SCIM Users / Groups / Applications / Schemas / Tenant Setting)
export async function callIasAdmin(connection: ConnectionConfig, args: BtpCallArgs) {
  return _call(connection, '/call-ias-admin', _ensureScimAcceptHeader(args));
}

// IPS Jobs / JobLogs（IAS Destination を流用）
export async function callIpsJob(connection: ConnectionConfig, args: BtpCallArgs) {
  return _call(connection, '/call-ips-job', _ensureScimAcceptHeader(args));
}

// Cloud Foundry API v3 (apps / orgs / spaces / service_instances / service_bindings ...)
export async function callCfApi(connection: ConnectionConfig, args: BtpCallArgs) {
  return _call(connection, '/call-cf-api', args);
}

// Build Work Zone Content API (tiles / groups / roles / pages / content_packages)
export async function callBwzContent(connection: ConnectionConfig, args: BtpCallArgs) {
  return _call(connection, '/call-bwz-content', args);
}

// Cloud Transport Management v2 API (nodes / transportRequests / imports / queues)
export async function callCtmsApi(connection: ConnectionConfig, args: BtpCallArgs) {
  return _call(connection, '/call-ctms-api', args);
}

// Forms Service by Adobe REST API (/v1/forms / ADS 操作)
export async function callFormsApi(connection: ConnectionConfig, args: BtpCallArgs) {
  return _call(connection, '/call-forms-api', args);
}

// SAP Cloud Information Service (CIS Central) / Global Account / Subaccount 等
export async function callCisApi(connection: ConnectionConfig, args: BtpCallArgs) {
  return _call(connection, '/call-cis-api', args);
}

// SAP Integration Suite (CPI) Audit API / iFlow / Channel / Logs
export async function callCpiApi(connection: ConnectionConfig, args: BtpCallArgs) {
  return _call(connection, '/call-cpi-api', args);
}
