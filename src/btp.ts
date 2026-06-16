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
import type { TenantConfig } from './config.js';

export interface BtpCallArgs {
  destination: string;
  method?:     'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';
  path:        string;
  query?:      Record<string, string | number | boolean | string[] | undefined>;
  body?:       any;
  headers?:    Record<string, string>;
  timeoutMs?:  number;
}

async function _call(tenant: TenantConfig, endpoint: string, args: BtpCallArgs) {
  if (!args.destination) throw new Error('destination が必要です');
  if (!args.path)        throw new Error('path が必要です');
  return relay(tenant, endpoint, {
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
export async function callIasAdmin(tenant: TenantConfig, args: BtpCallArgs) {
  return _call(tenant, '/call-ias-admin', _ensureScimAcceptHeader(args));
}

// IPS Jobs / JobLogs（IAS Destination を流用）
export async function callIpsJob(tenant: TenantConfig, args: BtpCallArgs) {
  return _call(tenant, '/call-ips-job', _ensureScimAcceptHeader(args));
}

// Cloud Foundry API v3 (apps / orgs / spaces / service_instances / service_bindings ...)
export async function callCfApi(tenant: TenantConfig, args: BtpCallArgs) {
  return _call(tenant, '/call-cf-api', args);
}

// Build Work Zone Content API (tiles / groups / roles / pages / content_packages)
export async function callBwzContent(tenant: TenantConfig, args: BtpCallArgs) {
  return _call(tenant, '/call-bwz-content', args);
}

// Cloud Transport Management v2 API (nodes / transportRequests / imports / queues)
export async function callCtmsApi(tenant: TenantConfig, args: BtpCallArgs) {
  return _call(tenant, '/call-ctms-api', args);
}

// Forms Service by Adobe REST API (/v1/forms / ADS 操作)
export async function callFormsApi(tenant: TenantConfig, args: BtpCallArgs) {
  return _call(tenant, '/call-forms-api', args);
}

// SAP Cloud Information Service (CIS Central) / Global Account / Subaccount 等
export async function callCisApi(tenant: TenantConfig, args: BtpCallArgs) {
  return _call(tenant, '/call-cis-api', args);
}

// SAP Integration Suite (CPI) Audit API / iFlow / Channel / Logs
export async function callCpiApi(tenant: TenantConfig, args: BtpCallArgs) {
  return _call(tenant, '/call-cpi-api', args);
}
