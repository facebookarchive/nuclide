'use babel';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export async function passesGK(gatekeeperName: string, timeout: number): Promise<boolean> {
  try {
    const {gatekeeper} = require('../../fb-gatekeeper');
    return Boolean(
      await gatekeeper.asyncIsGkEnabled(gatekeeperName, timeout)
    );
  } catch (e) {
    return false;
  }
}
