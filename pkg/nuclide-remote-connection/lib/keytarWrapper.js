'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
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

function runScriptInApmNode(script: string): string {
  const args = ['-e', script];
  const options = {env: {NODE_PATH: getApmNodeModulesPath()}};
  const output = child_process.spawnSync(getApmNodePath(), args, options);
  return output.stdout.toString();
}

export default {
  getPassword(service: string, account: string): ?string {
    const script = `
      var keytar = require('keytar');
      var service = ${JSON.stringify(service)};
      var account = ${JSON.stringify(account)};
      var password = keytar.getPassword(service, account);
      console.log(JSON.stringify(password));
    `;
    return JSON.parse(runScriptInApmNode(script));
  },

  replacePassword(
    service: string,
    account: string,
    password: string,
  ): ?boolean {
    const script = `
      var keytar = require('keytar');
      var service = ${JSON.stringify(service)};
      var account = ${JSON.stringify(account)};
      var password = ${JSON.stringify(password)};
      var result = keytar.replacePassword(service, account, password);
      console.log(JSON.stringify(result));
    `;
    return JSON.parse(runScriptInApmNode(script));
  },
};

export const __TEST__ = {
  getApmNodeModulesPath,
  getApmNodePath,
  runScriptInApmNode,
};
