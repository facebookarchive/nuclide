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
class HHVMDebugAdapter {
  constructor() {
    this.key = _constants().VsAdapterTypes.HHVM;
    this.type = 'hhvm';
    this.excludedOptions = new Set(['targetUri', 'scriptArgs', 'noDebug', 'launchScriptPath', 'startupDocumentPath']);
    this.extensions = new Set(['.php']);
    this.customArguments = new Map();
    this._includedOptions = new Set();
  }

  parseArguments(args) {
    const action = args.attach ? 'attach' : 'launch';
    const root = (0, _debuggerRegistry().getAdapterPackageRoot)(this.key);
    const parser = new (_VSPOptionsParser().default)(root);
    const commandLineArgs = parser.parseCommandLine(this.type, action, this.excludedOptions, this._includedOptions, this.customArguments);

    if (action === 'launch') {
      const launchArgs = args._;

      const program = _nuclideUri().default.resolve(launchArgs[0]);

      commandLineArgs.set('scriptArgs', launchArgs.splice(1));
      commandLineArgs.set('launchScriptPath', program);
      commandLineArgs.set('targetUri', program);
      commandLineArgs.set('noDebug', false);
      commandLineArgs.set('cwd', _nuclideUri().default.resolve('.'));
    } else {
      if (!commandLineArgs.has('targetUri')) {
        commandLineArgs.set('targetUri', _nuclideUri().default.resolve('.'));
      }
    }

    commandLineArgs.set('action', action);
    commandLineArgs.set('hhvmRuntimeArgs', commandLineArgs.get('hhvmRuntimeArgs') || []);
    return commandLineArgs;
  }

  transformLaunchArguments(args) {
    return Object.assign({}, args || {}, {
      showDummyOnAsyncPause: true
    });
  }

  transformAttachArguments(args) {
    return Object.assign({}, args || {}, {
      showDummyOnAsyncPause: true
    });
  }

}

exports.default = HHVMDebugAdapter;