// SPDX-License-Identifier: Apache-2.0
let current: { tenant: string; destination: string } | null = null;

export function setDestination(tenant: string, destination: string): void {
  current = { tenant, destination };
}

export function getCurrentDestination(): { tenant: string; destination: string } | null {
  return current;
}
