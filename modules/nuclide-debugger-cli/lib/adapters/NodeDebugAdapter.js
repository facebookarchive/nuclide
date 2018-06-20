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

class NodeDebugAdapter {
  constructor() {
    this.key = (_constants || _load_constants()).VsAdapterTypes.NODE;
    this.type = 'node2';
    this.excludedOptions = new Set(['args', 'console', 'diagnosticLogging', 'externalConsole', 'noDebug', 'outputCapture', 'program', 'restart', 'trace', 'verboseDiagnosticLogging']);
    this.extensions = new Set(['.js']);
    this.customArguments = new Map([['sourceMapPathOverrides', {
      typeDescription: 'source-pattern replace-pattern ...',
      parseType: 'array',
      parser: _parseSourceMapPathOverrides
    }]]);
    this._includedOptions = new Set(['address', 'port']);
  }

  parseArguments(args) {
    const action = args.attach ? 'attach' : 'launch';
    const root = (0, (_debuggerRegistry || _load_debuggerRegistry()).getAdapterPackageRoot)(this.key);
    const parser = new (_VSPOptionsParser || _load_VSPOptionsParser()).default(root);
    const commandLineArgs = parser.parseCommandLine(this.type, action, this.excludedOptions, this._includedOptions, this.customArguments);

    if (action === 'launch') {
      const launchArgs = args._;
      const program = launchArgs[0];

      commandLineArgs.set('args', launchArgs.splice(1));
      commandLineArgs.set('program', (_nuclideUri || _load_nuclideUri()).default.resolve(program));
      commandLineArgs.set('noDebug', false);
      commandLineArgs.set('cwd', (_nuclideUri || _load_nuclideUri()).default.resolve('.'));
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

exports.default = NodeDebugAdapter; /**
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

function _parseSourceMapPathOverrides(entries) {
  if (entries.length % 2 !== 0) {
    throw new Error('Source map path overrides must be a list of pattern pairs.');
  }

  const result = {};

  while (entries.length !== 0) {
    result[entries[0]] = entries[1];
    entries.splice(0, 2);
  }

  return result;
}