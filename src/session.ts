// SPDX-License-Identifier: Apache-2.0
let current: { connection: string; destination: string } | null = null;

export function setDestination(connection: string, destination: string): void {
  current = { connection, destination };
}

export function getCurrentDestination(): { connection: string; destination: string } | null {
  return current;
}
