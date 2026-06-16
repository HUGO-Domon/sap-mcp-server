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
