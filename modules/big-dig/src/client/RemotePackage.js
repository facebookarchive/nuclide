'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let runPackage = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (command, args, cwd, options, ssh) {
    const cmd = cwd == null ? `${command} ${(0, (_string || _load_string()).shellQuote)(args)}` : `cd ${cwd} && ${command} ${(0, (_string || _load_string()).shellQuote)(args)}`;

    const { stdout, result } = yield ssh.exec(cmd, options);
    // Collect any stdout in case there is an error.
    let output = '';
    stdout.subscribe(function (data) {
      return output += data;
    });
    // Wait for the bootstrapper to finish
    const { code } = yield result;

    return { stdout: output, code };
  });

  return function runPackage(_x, _x2, _x3, _x4, _x5) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * An unmanaged, preexisting package. We know nothing about what the package looks like, except how
 * to invoke it. The user is responsible for installing the package on the remote machine and
 * providing a valid command for invocation.
 */


exports.getPackage = getPackage;

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _SshClient;

function _load_SshClient() {
  return _SshClient = require('./SshClient');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Assume the package is already installed and not managed by Big-dig. */
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

function okay() {
  return { status: 'okay' };
}

/**
 * Creates an abstraction for the remote package, which may be an unmanaged (preexisting)
 * installation, or a managed installation by big-dig (which may need installation).
 * @param pkg
 */
function getPackage(pkg) {
  return new UnmanagedPackage(pkg);
}

class UnmanagedPackage {
  constructor(params) {
    this._package = params;
  }

  run(args, options = {}, ssh) {
    const { cwd, command } = this._package;
    return runPackage(command, args, cwd, Object.assign({}, options), ssh);
  }

  verifyInstallation(ssh) {
    return (0, _asyncToGenerator.default)(function* () {
      return okay();
    })();
  }

  install(ssh, options) {
    return (0, _asyncToGenerator.default)(function* () {
      throw new Error('An unmanaged remote server cannot be installed.');
    })();
  }

  getInstallationPath() {
    throw new Error('Cannot determine the installation path of an unmanaged remote server.');
  }
}