'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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

function getApmNodePath() {
  const apmDir = (_nuclideUri || _load_nuclideUri()).default.dirname(atom.packages.getApmPath());
  return (_nuclideUri || _load_nuclideUri()).default.normalize((_nuclideUri || _load_nuclideUri()).default.join(apmDir, 'node'));
}

function getApmNodeModulesPath() {
  const apmDir = (_nuclideUri || _load_nuclideUri()).default.dirname(atom.packages.getApmPath());
  return (_nuclideUri || _load_nuclideUri()).default.normalize((_nuclideUri || _load_nuclideUri()).default.join(apmDir, '..', 'node_modules'));
}

function runScriptInApmNode(script) {
  const args = ['-e', script];
  const options = { env: { NODE_PATH: getApmNodeModulesPath() } };
  const output = _child_process.default.spawnSync(getApmNodePath(), args, options);
  return output.stdout.toString();
}

exports.default = {
  getPassword: function (service, account) {
    const script = `
      var keytar = require('keytar');
      var service = ${ JSON.stringify(service) };
      var account = ${ JSON.stringify(account) };
      var password = keytar.getPassword(service, account);
      console.log(JSON.stringify(password));
    `;
    return JSON.parse(runScriptInApmNode(script));
  },
  replacePassword: function (service, account, password) {
    const script = `
      var keytar = require('keytar');
      var service = ${ JSON.stringify(service) };
      var account = ${ JSON.stringify(account) };
      var password = ${ JSON.stringify(password) };
      var result = keytar.replacePassword(service, account, password);
      console.log(JSON.stringify(result));
    `;
    return JSON.parse(runScriptInApmNode(script));
  }
};
const __TEST__ = exports.__TEST__ = {
  getApmNodeModulesPath: getApmNodeModulesPath,
  getApmNodePath: getApmNodePath,
  runScriptInApmNode: runScriptInApmNode
};