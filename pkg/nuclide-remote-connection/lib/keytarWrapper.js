'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__TEST__ = undefined;

var _child_process = _interopRequireDefault(require('child_process'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function getApmNodePath() {
  const apmDir = (_nuclideUri || _load_nuclideUri()).default.dirname(atom.packages.getApmPath());
  return (_nuclideUri || _load_nuclideUri()).default.normalize((_nuclideUri || _load_nuclideUri()).default.join(apmDir, 'node'));
}

function getApmNodeModulesPath() {
  const apmDir = (_nuclideUri || _load_nuclideUri()).default.dirname(atom.packages.getApmPath());
  return (_nuclideUri || _load_nuclideUri()).default.normalize((_nuclideUri || _load_nuclideUri()).default.join(apmDir, '..', 'node_modules'));
}

function runScriptInApmNode(script, service, account, password) {
  const args = ['-e', script];
  const options = {
    // The newline is important so we can use readline's line event.
    input: JSON.stringify({ service, account, password }) + '\n',
    env: Object.assign({}, process.env, {
      NODE_PATH: getApmNodeModulesPath()
    })
  };
  const output = _child_process.default.spawnSync(getApmNodePath(), args, options);
  return output.stdout.toString();
}

exports.default = {
  getPassword(service, account) {
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

  replacePassword(service, account, password) {
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
  }
};
const __TEST__ = exports.__TEST__ = {
  getApmNodeModulesPath,
  getApmNodePath,
  runScriptInApmNode
};