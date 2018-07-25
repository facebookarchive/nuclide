"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__TEST__ = exports.default = void 0;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _passesGK() {
  const data = _interopRequireDefault(require("./passesGK"));

  _passesGK = function () {
    return data;
  };

  return data;
}

function keytar() {
  const data = _interopRequireWildcard(require("nuclide-prebuilt-libs/keytar"));

  keytar = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

/**
 * If we're running outside of Atom, attempt to use the prebuilt keytar libs.
 * (May throw if prebuilt libs aren't available for the current platform!)
 */
async function shouldUseApmNode() {
  return !(await (0, _passesGK().default)('nuclide_prebuilt_keytar'));
} // KeyTar>=4.x APM>=1.18


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
`; // KeyTar>=4.x APM>=1.18

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
`; // KeyTar>=4.x APM>=1.18

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
  const apmDir = _nuclideUri().default.dirname(atom.packages.getApmPath());

  return _nuclideUri().default.normalize(_nuclideUri().default.join(apmDir, 'node'));
}

function getApmNodeModulesPath() {
  const apmDir = _nuclideUri().default.dirname(atom.packages.getApmPath());

  return _nuclideUri().default.normalize(_nuclideUri().default.join(apmDir, '..', 'node_modules'));
}

function runScriptInApmNode(script, service, account, password) {
  const args = ['-e', script];
  const options = {
    // The newline is important so we can use readline's line event.
    input: JSON.stringify({
      service,
      account,
      password
    }) + '\n',
    env: Object.assign({}, process.env, {
      NODE_PATH: getApmNodeModulesPath()
    })
  };
  return (0, _process().runCommand)(getApmNodePath(), args, options).toPromise().catch(err => {
    if (err instanceof _process().ProcessExitError) {
      // Unwrap underlying error from stderr (as it already has a stack!)
      throw new Error(err.stderr);
    }

    throw err;
  });
}

var _default = {
  /**
   * Returns the password (or null if it doesn't exist).
   * Rejects on keychain access failure.
   */
  async getPassword(service, account) {
    if (typeof atom === 'object' && (await shouldUseApmNode())) {
      return JSON.parse((await runScriptInApmNode(getPasswordScriptAsync, service, account)));
    }

    return keytar().getPassword(service, account);
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

    return keytar().setPassword(service, account, password);
  },

  /**
   * Returns true if a password was deleted, or false if it didn't exist.
   * Rejects on keychain access failure.
   */
  async deletePassword(service, account) {
    if (typeof atom === 'object' && (await shouldUseApmNode())) {
      return JSON.parse((await runScriptInApmNode(deletePasswordScriptAsync, service, account)));
    }

    return keytar().deletePassword(service, account);
  }

};
exports.default = _default;
const __TEST__ = {
  getApmNodeModulesPath,
  getApmNodePath,
  runScriptInApmNode
};
exports.__TEST__ = __TEST__;