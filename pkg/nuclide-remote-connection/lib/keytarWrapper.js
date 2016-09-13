Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _child_process2;

function _child_process() {
  return _child_process2 = _interopRequireDefault(require('child_process'));
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

function getApmNodePath() {
  var apmDir = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.dirname(atom.packages.getApmPath());
  return (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.normalize((_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(apmDir, 'node'));
}

function getApmNodeModulesPath() {
  var apmDir = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.dirname(atom.packages.getApmPath());
  return (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.normalize((_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(apmDir, '..', 'node_modules'));
}

function runScriptInApmNode(script) {
  var args = ['-e', script];
  var options = { env: { NODE_PATH: getApmNodeModulesPath() } };
  var output = (_child_process2 || _child_process()).default.spawnSync(getApmNodePath(), args, options);
  return output.stdout.toString();
}

exports.default = {
  getPassword: function getPassword(service, account) {
    var script = '\n      var keytar = require(\'keytar\');\n      var service = ' + JSON.stringify(service) + ';\n      var account = ' + JSON.stringify(account) + ';\n      var password = keytar.getPassword(service, account);\n      console.log(JSON.stringify(password));\n    ';
    return JSON.parse(runScriptInApmNode(script));
  },

  replacePassword: function replacePassword(service, account, password) {
    var script = '\n      var keytar = require(\'keytar\');\n      var service = ' + JSON.stringify(service) + ';\n      var account = ' + JSON.stringify(account) + ';\n      var password = ' + JSON.stringify(password) + ';\n      var result = keytar.replacePassword(service, account, password);\n      console.log(JSON.stringify(result));\n    ';
    return JSON.parse(runScriptInApmNode(script));
  }
};
var __TEST__ = {
  getApmNodeModulesPath: getApmNodeModulesPath,
  getApmNodePath: getApmNodePath,
  runScriptInApmNode: runScriptInApmNode
};
exports.__TEST__ = __TEST__;