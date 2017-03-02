/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import child_process from 'child_process';
import nuclideUri from '../../commons-node/nuclideUri';

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
): string {
  const args = ['-e', script];
  const options = {
    // The newline is important so we can use readline's line event.
    input: JSON.stringify({service, account, password}) + '\n',
    env: {
      ...process.env,
      NODE_PATH: getApmNodeModulesPath(),
    },
  };
  const output = child_process.spawnSync(getApmNodePath(), args, options);
  return output.stdout.toString();
}

export default {
  getPassword(service: string, account: string): ?string {
    const script = `
      var readline = require('readline');
      var keytar = require('keytar');
      var rl = readline.createInterface({input: process.stdin});
      rl.on('line', function(input) {
        var data = JSON.parse(input);
        var password = keytar.getPassword(data.service, data.account);
        console.log(JSON.stringify(password));
        rl.close();
      });
    `;
    return JSON.parse(runScriptInApmNode(script, service, account));
  },

  replacePassword(
    service: string,
    account: string,
    password: string,
  ): ?boolean {
    const script = `
      var readline = require('readline');
      var keytar = require('keytar');
      var rl = readline.createInterface({input: process.stdin});
      rl.on('line', function(input) {
        var data = JSON.parse(input);
        var result = keytar.replacePassword(data.service, data.account, data.password);
        console.log(JSON.stringify(result));
        rl.close();
      });
    `;
    return JSON.parse(runScriptInApmNode(script, service, account, password));
  },
};

export const __TEST__ = {
  getApmNodeModulesPath,
  getApmNodePath,
  runScriptInApmNode,
};
