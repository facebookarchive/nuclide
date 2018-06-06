'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__TEST__ = undefined;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../modules/nuclide-commons/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('../../modules/nuclide-commons/process');
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('./passesGK'));
}

var _keytar;

function _load_keytar() {
  return _keytar = _interopRequireWildcard(require('nuclide-prebuilt-libs/keytar'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

async function shouldUseApmNode() {
  return !(await (0, (_passesGK || _load_passesGK()).default)('nuclide_prebuilt_keytar'));
}

// KeyTar>=4.x APM>=1.18


/**
 * If we're running outside of Atom, attempt to use the prebuilt keytar libs.
 * (May throw if prebuilt libs aren't available for the current platform!)
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
  return (0, (_process || _load_process()).runCommand)(getApmNodePath(), args, options).toPromise().catch(err => {
    if (err instanceof (_process || _load_process()).ProcessExitError) {
      // Unwrap underlying error from stderr (as it already has a stack!)
      throw new Error(err.stderr);
    }
    throw err;
  });
}

exports.default = {
  /**
   * Returns the password (or null if it doesn't exist).
   * Rejects on keychain access failure.
   */
  async getPassword(service, account) {
    if (typeof atom === 'object' && (await shouldUseApmNode())) {
      return JSON.parse((await runScriptInApmNode(getPasswordScriptAsync, service, account)));
    }
    return (_keytar || _load_keytar()).getPassword(service, account);
  },

  /**
   * Returns nothing.
   * Rejects on keychain access failure.
   */
  async replacePassword(service, account, password) {
    if (typeof atom === 'object' && (await shouldUseApmNode())) {
      await runScriptInApmNode(replacePasswordScriptAsync, service, account, password);
      return;
    }
    return (_keytar || _load_keytar()).setPassword(service, account, password);
  },

  /**
   * Returns true if a password was deleted, or false if it didn't exist.
   * Rejects on keychain access failure.
   */
  async deletePassword(service, account) {
    if (typeof atom === 'object' && (await shouldUseApmNode())) {
      return JSON.parse((await runScriptInApmNode(deletePasswordScriptAsync, service, account)));
    }
    return (_keytar || _load_keytar()).deletePassword(service, account);
  }
};
const __TEST__ = exports.__TEST__ = {
  getApmNodeModulesPath,
  getApmNodePath,
  runScriptInApmNode
};