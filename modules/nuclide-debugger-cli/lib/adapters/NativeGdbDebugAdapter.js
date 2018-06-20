'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _debuggerRegistry;

function _load_debuggerRegistry() {
  return _debuggerRegistry = require('../../../nuclide-debugger-common/debugger-registry');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../nuclide-commons/nuclideUri'));
}

var _constants;

function _load_constants() {
  return _constants = require('../../../nuclide-debugger-common/constants');
}

var _VSPOptionsParser;

function _load_VSPOptionsParser() {
  return _VSPOptionsParser = _interopRequireDefault(require('../VSPOptionsParser'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class NativeGdbDebugAdapter {
  constructor() {
    this.key = (_constants || _load_constants()).VsAdapterTypes.NATIVE_GDB;
    this.type = 'mi';
    this.excludedOptions = new Set(['arguments', 'debuggerRoot', 'diagnosticLogging', 'stopOnAttach', 'program']);
    this.extensions = new Set();
    this.customArguments = new Map();
    this._includedOptions = new Set();
  }

  parseArguments(args) {
    const action = args.attach ? 'attach' : 'launch';
    const root = (0, (_debuggerRegistry || _load_debuggerRegistry()).getAdapterPackageRoot)(this.key);
    const parser = new (_VSPOptionsParser || _load_VSPOptionsParser()).default(root);
    const commandLineArgs = parser.parseCommandLine(this.type, action, this.excludedOptions, this._includedOptions, this.customArguments);

    if (action === 'launch') {
      const launchArgs = args._;
      const program = launchArgs[0];

      commandLineArgs.set('arguments', launchArgs.splice(1));
      commandLineArgs.set('program', (_nuclideUri || _load_nuclideUri()).default.resolve(program));
      commandLineArgs.set('cwd', (_nuclideUri || _load_nuclideUri()).default.resolve('.'));
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
}
exports.default = NativeGdbDebugAdapter; /**
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