'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__TEST__ = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// KeyTar>=4.x APM>=1.18
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

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
  return (0, (_process || _load_process()).runCommand)(getApmNodePath(), args, options).toPromise();
}

exports.default = {
  getPassword(service, account) {
    return (0, _asyncToGenerator.default)(function* () {
      return JSON.parse((yield runScriptInApmNode(getPasswordScriptAsync, service, account)));
    })();
  },

  replacePassword(service, account, password) {
    return (0, _asyncToGenerator.default)(function* () {
      return JSON.parse((yield runScriptInApmNode(replacePasswordScriptAsync, service, account, password)));
    })();
  },

  deletePassword(service, account) {
    return (0, _asyncToGenerator.default)(function* () {
      return JSON.parse((yield runScriptInApmNode(deletePasswordScriptAsync, service, account)));
    })();
  }
};
const __TEST__ = exports.__TEST__ = {
  getApmNodeModulesPath,
  getApmNodePath,
  runScriptInApmNode
};