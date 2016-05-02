'use babel';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// undefined means unknown. null means known to not be present.
let gatekeeper = undefined;

export async function passesGK(gatekeeperName: string, timeout?: number): Promise<boolean> {
  // Only do the expensive require once.
  if (gatekeeper === undefined) {
    try {
      gatekeeper = require('../../fb-gatekeeper').gatekeeper;
    } catch (e) {
      gatekeeper = null;
    }
  }

  return gatekeeper == null
    ? false
    : (await gatekeeper.asyncIsGkEnabled(gatekeeperName, timeout)) === true;
}

/**
 * Check a GK but silently return false on error.
 * Use this for features that should work despite gatekeepers not being available.
 */
export function passesGKSafe(gatekeeperName: string, timeout?: number): Promise<boolean> {
  return passesGK(gatekeeperName, timeout)
    .catch(() => false);
}
