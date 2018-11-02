"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _debuggerRegistry() {
  const data = require("../../../nuclide-debugger-common/debugger-registry");

  _debuggerRegistry = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("../../../nuclide-debugger-common/constants");

  _constants = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _VSPOptionsParser() {
  const data = _interopRequireDefault(require("../VSPOptionsParser"));

  _VSPOptionsParser = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
class NativeGdbDebugAdapter {
  constructor() {
    this.key = _constants().VsAdapterTypes.NATIVE_GDB;
    this.type = 'mi';
    this.excludedOptions = new Set(['arguments', 'debuggerRoot', 'diagnosticLogging', 'stopOnAttach', 'program']);
    this.extensions = new Set('.exe');
    this.customArguments = new Map();
    this.muteOutputCategories = new Set('log');
    this.asyncStopThread = null;
    this.supportsCodeBlocks = false;
    this._includedOptions = new Set();
  }

  parseArguments(args) {
    const action = args.attach ? 'attach' : 'launch';
    const root = (0, _debuggerRegistry().getAdapterPackageRoot)(this.key);
    const parser = new (_VSPOptionsParser().default)(root);
    const commandLineArgs = parser.parseCommandLine(this.type, action, this.excludedOptions, this._includedOptions, this.customArguments);

    if (action === 'launch') {
      const launchArgs = args._;
      const program = launchArgs[0];
      commandLineArgs.set('arguments', launchArgs.splice(1));
      commandLineArgs.set('program', _nuclideUri().default.resolve(program));
      commandLineArgs.set('cwd', _nuclideUri().default.resolve('.'));
      commandLineArgs.set('stopOnAttach', false);
    }

    return commandLineArgs;
  }

  transformLaunchArguments(args) {
    return args || {};
  }

  transformAttachArguments(args) {
    return args || {};
  }

  transformExpression(exp, isCodeBlock) {
    return exp;
  }

  async canDebugFile(file) {
    return new Promise((resolve, reject) => {
      try {
        // eslint-disable-next-line nuclide-internal/unused-subscription
        (0, _process().runCommand)('file', ['-b', '--mime-type', file], {
          dontLogInNuclide: true
        }).catch(_ => _rxjsCompatUmdMin.Observable.of('')).map(stdout => stdout.split(/\n/).filter(line => line.startsWith('application/')).length > 0).subscribe(value => resolve(value));
      } catch (ex) {
        reject(ex);
      }
    });
  }

}

exports.default = NativeGdbDebugAdapter;