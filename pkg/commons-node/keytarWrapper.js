/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import nuclideUri from 'nuclide-commons/nuclideUri';
import {runCommand, ProcessExitError} from 'nuclide-commons/process';

/**
 * If we're running outside of Atom, attempt to use the prebuilt keytar libs.
 * (May throw if prebuilt libs aren't available for the current platform!)
 */
import * as keytar from 'nuclide-prebuilt-libs/keytar';

// KeyTar>=4.x APM>=1.18
const getPasswordScriptAsync = `
  var readline = require('readline');
  var keytar = require('keytar');
  var rl = readline.createInterface({input: process.stdin});
  rl.on('line', function(input) {
    var data = JSON.parse(input);
    keytar.getPassword(data.service, data.account).then(function(password) {
      console.log(JSON.stringify(password));
      rl.close();
    }, function(err) {
      console.error(err);
      process.exit(1);
    });
  });
`;

// KeyTar>=4.x APM>=1.18
const replacePasswordScriptAsync = `
  var readline = require('readline');
  var keytar = require('keytar');
  var rl = readline.createInterface({input: process.stdin});
  rl.on('line', function(input) {
    var data = JSON.parse(input);
    keytar.setPassword(data.service, data.account, data.password).then(function() {
      rl.close();
    }, function(err) {
      console.error(err);
      process.exit(1);
    });
  });
`;

// KeyTar>=4.x APM>=1.18
const deletePasswordScriptAsync = `
  var readline = require('readline');
  var keytar = require('keytar');
  var rl = readline.createInterface({input: process.stdin});
  rl.on('line', function(input) {
    var data = JSON.parse(input);
    keytar.deletePassword(data.service, data.account).then(function(result) {
      console.log(JSON.stringify(result));
      rl.close();
    }, function(err) {
      console.error(err);
      process.exit(1);
    });
  });
`;

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
        throw Error(err.stderr);
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
    if (typeof atom === 'object') {
      return JSON.parse(
        await runScriptInApmNode(getPasswordScriptAsync, service, account),
      );
    }
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
    if (typeof atom === 'object') {
      await runScriptInApmNode(
        replacePasswordScriptAsync,
        service,
        account,
        password,
      );
    }
    return keytar.setPassword(service, account, password);
  },

  /**
   * Returns true if a password was deleted, or false if it didn't exist.
   * Rejects on keychain access failure.
   */
  async deletePassword(service: string, account: string): Promise<boolean> {
    if (typeof atom === 'object') {
      return JSON.parse(
        await runScriptInApmNode(deletePasswordScriptAsync, service, account),
      );
    }
    return keytar.deletePassword(service, account);
  },
};

export const __TEST__ = {
  getApmNodeModulesPath,
  getApmNodePath,
  runScriptInApmNode,
};
