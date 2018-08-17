/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import nuclideUri from './nuclideUri';
import {runCommand, ProcessExitError} from './process';

/**
 * If we're running outside of Atom, attempt to use the prebuilt keytar libs.
 * (May throw if prebuilt libs aren't available for the current platform!)
 */
import * as keytar from 'nuclide-prebuilt-libs/keytar';

function getApmNodePath(): string {
  const apmDir = nuclideUri.dirname(atom.packages.getApmPath());
  return nuclideUri.normalize(nuclideUri.join(apmDir, 'node'));
}

function getApmNodeModulesPath(): string {
  const apmDir = nuclideUri.dirname(atom.packages.getApmPath());
  return nuclideUri.normalize(nuclideUri.join(apmDir, '..', 'node_modules'));
}

function runScriptInApmNode(
  script: string,
  service: string,
  account: string,
  password?: string,
): Promise<string> {
  const args = ['-e', script];
  const options = {
    // The newline is important so we can use readline's line event.
    input: JSON.stringify({service, account, password}) + '\n',
    env: {
      ...process.env,
      NODE_PATH: getApmNodeModulesPath(),
    },
  };
  return runCommand(getApmNodePath(), args, options)
    .toPromise()
    .catch(err => {
      if (err instanceof ProcessExitError) {
        // Unwrap underlying error from stderr (as it already has a stack!)
        throw new Error(err.stderr);
      }
      throw err;
    });
}

export default {
  /**
   * Returns the password (or null if it doesn't exist).
   * Rejects on keychain access failure.
   */
  async getPassword(service: string, account: string): Promise<?string> {
    return keytar.getPassword(service, account);
  },

  /**
   * Returns nothing.
   * Rejects on keychain access failure.
   */
  async replacePassword(
    service: string,
    account: string,
    password: string,
  ): Promise<void> {
    return keytar.setPassword(service, account, password);
  },

  /**
   * Returns true if a password was deleted, or false if it didn't exist.
   * Rejects on keychain access failure.
   */
  async deletePassword(service: string, account: string): Promise<boolean> {
    return keytar.deletePassword(service, account);
  },
};

export const __TEST__ = {
  getApmNodeModulesPath,
  getApmNodePath,
  runScriptInApmNode,
};
