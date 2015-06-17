'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var path = require('path');
var {spawnSync} = require('child_process');

function getApmNodePath() {
  var apmDir = path.dirname(atom.packages.getApmPath());
  return path.normalize(path.join(apmDir, 'node'));
}

function getApmNodeModulesPath() {
  var apmDir = path.dirname(atom.packages.getApmPath());
  return path.normalize(path.join(apmDir, '..', 'node_modules'));
}

function runScriptInApmNode(script: string) {
  var args = ['-e', script];
  var options = {env: {NODE_PATH: getApmNodeModulesPath()}};
  var output = spawnSync(getApmNodePath(), args, options);
  return output.stdout.toString();
}

function getPassword(service: string, account: string): ?string {
  var script = `
    var keytar = require('keytar');
    var service = ${JSON.stringify(service)};
    var account = ${JSON.stringify(account)};
    var password = keytar.getPassword(service, account);
    console.log(JSON.stringify(password));
  `;
  return JSON.parse(runScriptInApmNode(script));
}

function replacePassword(
    service: string,
    account: string,
    password: string): ?boolean {
  var script = `
    var keytar = require('keytar');
    var service = ${JSON.stringify(service)};
    var account = ${JSON.stringify(account)};
    var password = ${JSON.stringify(password)};
    var result = keytar.replacePassword(service, account, password);
    console.log(JSON.stringify(result));
  `;
  return JSON.parse(runScriptInApmNode(script));
}

module.exports = {
  getPassword,
  replacePassword,
  __test__: {
    runScriptInApmNode,
    getApmNodePath,
    getApmNodeModulesPath,
  }
};
