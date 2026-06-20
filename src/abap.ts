// SPDX-License-Identifier: Apache-2.0
import { relay } from './destinations.js';
import type { ConnectionConfig } from './config.js';

export interface CallFmArgs {
  fm:         string;
  importing?: any[];
  exporting?: any[];
  tabparams?: any[];
  commit?:    boolean;
  client?:    string;
}

export async function callFm(connection: ConnectionConfig, destination: string, args: CallFmArgs) {
  if (!args.client) throw new Error('client（マンダント）が必要です');
  const data: any = await relay(connection, '/call-fm', {
    destination,
    client:    args.client,
    fm:        args.fm,
    importing: args.importing || [],
    exporting: args.exporting || [],
    tabparams: args.tabparams || [],
    commit:    !!args.commit,
  });
  return data.result;
}

export interface SelectTableArgs {
  table:    string;
  fields?:  string[];
  where?:   string[];
  maxrows?: number;
  client?:  string;
}

export async function callSelectTable(connection: ConnectionConfig, destination: string, args: SelectTableArgs) {
  if (!args.client) throw new Error('client（マンダント）が必要です');
  const data: any = await relay(connection, '/select', {
    destination,
    client:  args.client,
    table:   args.table,
    fields:  args.fields  || [],
    where:   args.where   || [],
    maxrows: args.maxrows || 1000,
  });
  return data.rows || [];
}

export interface AdtSqlArgs {
  sql:       string;
  client?:   string;
  rowCount?: number;
}

export interface AdtDdicArgs {
  ddicName:  string;
  client?:   string;
  rowCount?: number;
}

// ADT freestyle / OSQL（パラメータ付き CDS view を含む自由 SQL）
export async function callAdtFreestyle(connection: ConnectionConfig, destination: string, args: AdtSqlArgs) {
  if (!args.client) throw new Error('client（マンダント）が必要です');
  if (!args.sql)    throw new Error('sql が必要です');
  return relay(connection, '/adt-freestyle', {
    destination,
    client:   args.client,
    sql:      args.sql,
    rowCount: args.rowCount || 100,
  });
}

export async function callAdtOsql(connection: ConnectionConfig, destination: string, args: AdtSqlArgs) {
  if (!args.client) throw new Error('client（マンダント）が必要です');
  if (!args.sql)    throw new Error('sql が必要です');
  return relay(connection, '/adt-osql', {
    destination,
    client:   args.client,
    sql:      args.sql,
    rowCount: args.rowCount || 100,
  });
}

// ADT DDIC（テーブル/CDS 名指定で SELECT *）
export async function callAdtDdic(connection: ConnectionConfig, destination: string, args: AdtDdicArgs) {
  if (!args.client)   throw new Error('client（マンダント）が必要です');
  if (!args.ddicName) throw new Error('ddicName が必要です');
  return relay(connection, '/adt-ddic', {
    destination,
    client:   args.client,
    ddicName: args.ddicName,
    rowCount: args.rowCount || 100,
  });
}

// ===== アドオン開発（ADT source CRUD・#9） =====

export interface AdtReadSourceArgs {
  name:        string;
  objectType?: 'program' | 'fm';
  group?:      string;
  client?:     string;
}

// ABAP ソース読取（program / function module）
export async function callAdtReadSource(connection: ConnectionConfig, destination: string, args: AdtReadSourceArgs) {
  if (!args.client) throw new Error('client（マンダント）が必要です');
  if (!args.name)   throw new Error('name が必要です');
  return relay(connection, '/adt-read-source', {
    destination,
    client:     args.client,
    objectType: args.objectType || 'program',
    name:       args.name,
    group:      args.group,
  });
}

export interface AdtWriteSourceArgs {
  name:         string;
  source:       string;
  description?: string;
  package?:     string;
  transport?:   string;
  activate?:    boolean;
  client?:      string;
}

// ABAP レポート/プログラムの作成・更新＋（既定で）活性化。書込のためフル mcp scope が必要。
export async function callAdtWriteSource(connection: ConnectionConfig, destination: string, args: AdtWriteSourceArgs) {
  if (!args.client)            throw new Error('client（マンダント）が必要です');
  if (!args.name)              throw new Error('name が必要です');
  if (typeof args.source !== 'string') throw new Error('source が必要です');
  return relay(connection, '/adt-write-source', {
    destination,
    client:      args.client,
    name:        args.name,
    source:      args.source,
    description: args.description,
    package:     args.package,
    transport:   args.transport,
    activate:    args.activate,
  });
}

export interface AdtDeleteSourceArgs {
  name:       string;
  transport?: string;
  client?:    string;
}

// ABAP レポート/プログラムの削除。書込のためフル mcp scope が必要。
export async function callAdtDeleteSource(connection: ConnectionConfig, destination: string, args: AdtDeleteSourceArgs) {
  if (!args.client) throw new Error('client（マンダント）が必要です');
  if (!args.name)   throw new Error('name が必要です');
  return relay(connection, '/adt-delete-source', {
    destination,
    client:    args.client,
    name:      args.name,
    transport: args.transport,
  });
}

export interface AdtWriteFmArgs {
  group:        string;
  name:         string;
  source:       string;
  description?: string;
  package?:     string;
  transport?:   string;
  activate?:    boolean;
  client?:      string;
}

// FM（SE37）の作成・更新＋活性化。source は FUNCTION...ENDFUNCTION と `*"` インターフェイスを含む完全ソース。
export async function callAdtWriteFm(connection: ConnectionConfig, destination: string, args: AdtWriteFmArgs) {
  if (!args.client)            throw new Error('client（マンダント）が必要です');
  if (!args.group || !args.name) throw new Error('group と name が必要です');
  if (typeof args.source !== 'string') throw new Error('source が必要です');
  return relay(connection, '/adt-write-fm', {
    destination,
    client:      args.client,
    group:       args.group,
    name:        args.name,
    source:      args.source,
    description: args.description,
    package:     args.package,
    transport:   args.transport,
    activate:    args.activate,
  });
}

export interface CreateTransportArgs {
  description: string;
  type?:       string;
  target?:     string;
  devclass?:   string;
  owner?:      string;
  client?:     string;
}

export async function callCreateTransport(connection: ConnectionConfig, destination: string, args: CreateTransportArgs) {
  if (!args.client)      throw new Error('client（マンダント）が必要です');
  if (!args.description) throw new Error('description が必要です');
  return relay(connection, '/adt-create-transport', {
    destination,
    client:      args.client,
    description: args.description,
    type:        args.type,
    target:      args.target,
    devclass:    args.devclass,
    owner:       args.owner,
  });
}

export interface ReleaseTransportArgs {
  trkorr:      string;
  simulation?: boolean;
  client?:     string;
}

export async function callReleaseTransport(connection: ConnectionConfig, destination: string, args: ReleaseTransportArgs) {
  if (!args.client) throw new Error('client（マンダント）が必要です');
  if (!args.trkorr) throw new Error('trkorr が必要です');
  return relay(connection, '/adt-release-transport', {
    destination,
    client:     args.client,
    trkorr:     args.trkorr,
    simulation: args.simulation,
  });
}

export interface AdtActivateArgs {
  name:    string;
  type?:   string;
  client?: string;
}

// ABAP オブジェクトの活性化（単体）
export async function callAdtActivate(connection: ConnectionConfig, destination: string, args: AdtActivateArgs) {
  if (!args.client) throw new Error('client（マンダント）が必要です');
  if (!args.name)   throw new Error('name が必要です');
  return relay(connection, '/adt-activate', {
    destination,
    client: args.client,
    name:   args.name,
    type:   args.type || 'PROG',
  });
}
