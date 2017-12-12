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
import {runCommand} from 'nuclide-commons/process';

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
    }, function() {
      console.log(null);
      rl.close();
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
      console.log(JSON.stringify(true));
    }, function() {
      console.log(JSON.stringify(false));
    })
    .then(rl.close.bind(rl), rl.close.bind(rl))
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
    }, function() {
      console.log(JSON.stringify(false));
    })
    .then(rl.close.bind(rl), rl.close.bind(rl))
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
  return runCommand(getApmNodePath(), args, options).toPromise();
}

export default {
  async getPassword(service: string, account: string): Promise<?string> {
    return JSON.parse(
      await runScriptInApmNode(getPasswordScriptAsync, service, account),
    );
  },

  async replacePassword(
    service: string,
    account: string,
    password: string,
  ): Promise<?boolean> {
    return JSON.parse(
      await runScriptInApmNode(
        replacePasswordScriptAsync,
        service,
        account,
        password,
      ),
    );
  },

  async deletePassword(service: string, account: string): Promise<?boolean> {
    return JSON.parse(
      await runScriptInApmNode(deletePasswordScriptAsync, service, account),
    );
  },
};

export const __TEST__ = {
  getApmNodeModulesPath,
  getApmNodePath,
  runScriptInApmNode,
};
