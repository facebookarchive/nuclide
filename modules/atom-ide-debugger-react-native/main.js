"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveConfiguration = resolveConfiguration;

function _createPackage() {
  const data = _interopRequireDefault(require("../nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _AutoGenLaunchAttachProvider() {
  const data = require("../nuclide-debugger-common/AutoGenLaunchAttachProvider");

  _AutoGenLaunchAttachProvider = function () {
    return data;
  };

  return data;
}

function _nuclideDebuggerCommon() {
  const data = require("../nuclide-debugger-common");

  _nuclideDebuggerCommon = function () {
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
class Activation {
  constructor() {
    this._gkService = null;
  }

  dispose() {}

  createDebuggerProvider() {
    return {
      type: _nuclideDebuggerCommon().VsAdapterTypes.REACT_NATIVE,
      getLaunchAttachProvider: connection => {
        return new (_AutoGenLaunchAttachProvider().AutoGenLaunchAttachProvider)(_nuclideDebuggerCommon().VsAdapterNames.REACT_NATIVE, connection, getReactNativeConfig(), async () => {
          // This debugger is enabled for non-Facebook users, and Facebook
          // users inside the Gatekeeper nuclide_debugger_reactnative
          return this._gkService == null ? Promise.resolve(true) : this._gkService.passesGK('nuclide_debugger_reactnative');
        });
      }
    };
  }

  consumeGatekeeperService(service) {
    this._gkService = service;
    return new (_UniversalDisposable().default)(() => this._gkService = null);
  }

  createDebuggerConfigurator() {
    return [{
      resolveConfiguration,
      adapterType: _nuclideDebuggerCommon().VsAdapterTypes.REACT_NATIVE
    }];
  }

}

function _deriveProgramFromWorkspace(workspacePath) {
  return _nuclideUri().default.getPath(_nuclideUri().default.join(workspacePath, '.vscode', 'launchReactNative.js'));
}

function _deriveOutDirFromWorkspace(workspacePath) {
  return _nuclideUri().default.getPath(_nuclideUri().default.join(workspacePath, '.vscode', '.react'));
}

function getReactNativeConfig() {
  const workspace = {
    name: 'workspace',
    type: 'string',
    description: 'Absolute path containing package.json',
    required: true,
    visible: true
  };
  const sourceMaps = {
    name: 'sourceMaps',
    type: 'boolean',
    description: 'Whether to use JavaScript source maps to map the generated bundled code back to its original sources',
    defaultValue: false,
    required: false,
    visible: true
  };
  const outDir = {
    name: 'outDir',
    type: 'string',
    description: 'The location of the generated JavaScript code (the bundle file). Normally this should be "${workspaceRoot}/.vscode/.react"',
    required: false,
    visible: true
  };
  const sourceMapPathOverrides = {
    name: 'sourceMapPathOverrides',
    type: 'json',
    description: 'A set of mappings for rewriting the locations of source files from what the sourcemap says, to their locations on disk. See README for details.',
    defaultValue: {},
    required: false,
    visible: true
  };
  const port = {
    name: 'port',
    type: 'number',
    description: 'Debug port to attach to. Default is 8081.',
    defaultValue: 8081,
    required: false,
    visible: true
  };
  const attachProperties = [workspace, sourceMaps, outDir, sourceMapPathOverrides, port];
  const platform = {
    name: 'platform',
    type: 'enum',
    enums: ['ios', 'android'],
    description: '',
    defaultValue: 'ios',
    required: true,
    visible: true
  };
  const target = {
    name: 'target',
    type: 'enum',
    enums: ['simulator', 'device'],
    description: '',
    defaultValue: 'simulator',
    required: true,
    visible: true
  };
  const launchProperties = [platform, target].concat(attachProperties);
  return {
    launch: {
      launch: true,
      vsAdapterType: _nuclideDebuggerCommon().VsAdapterTypes.REACT_NATIVE,
      threads: false,
      properties: launchProperties,
      scriptPropertyName: null,
      cwdPropertyName: 'workspace',
      scriptExtension: '.js',
      header: null,

      getProcessName(values) {
        return 'Port: ' + values.port + ' (React Native)';
      }

    },
    attach: {
      launch: false,
      vsAdapterType: _nuclideDebuggerCommon().VsAdapterTypes.REACT_NATIVE,
      threads: false,
      properties: attachProperties,
      cwdPropertyName: 'workspace',
      scriptExtension: '.js',
      header: null,

      getProcessName(values) {
        return 'Port: ' + values.port + ' (React Native)';
      }

    }
  };
}

async function resolveConfiguration(configuration) {
  const {
    config
  } = configuration;

  if (config.outDir == null) {
    config.outDir = _deriveOutDirFromWorkspace(config.workspace);
  }

  config.program = _deriveProgramFromWorkspace(config.workspace);
  delete config.workspace;
  return configuration;
}

(0, _createPackage().default)(module.exports, Activation);