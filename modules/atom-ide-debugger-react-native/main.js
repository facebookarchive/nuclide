'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveConfiguration = resolveConfiguration;

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../nuclide-commons-atom/createPackage'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../nuclide-commons/UniversalDisposable'));
}

var _AutoGenLaunchAttachProvider;

function _load_AutoGenLaunchAttachProvider() {
  return _AutoGenLaunchAttachProvider = require('../nuclide-debugger-common/AutoGenLaunchAttachProvider');
}

var _constants;

function _load_constants() {
  return _constants = require('../nuclide-debugger-common/constants');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {

  constructor() {
    this._gkService = null;
  }

  dispose() {}

  createDebuggerProvider() {
    return {
      type: (_constants || _load_constants()).VsAdapterTypes.REACT_NATIVE,
      getLaunchAttachProvider: connection => {
        return new (_AutoGenLaunchAttachProvider || _load_AutoGenLaunchAttachProvider()).AutoGenLaunchAttachProvider('React Native', connection, getReactNativeConfig(), async () => {
          // This debugger is enabled for non-Facebook users, and Facebook
          // users inside the Gatekeeper nuclide_debugger_reactnative
          return this._gkService == null ? Promise.resolve(true) : this._gkService.passesGK('nuclide_debugger_reactnative');
        });
      }
    };
  }

  consumeGatekeeperService(service) {
    this._gkService = service;
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => this._gkService = null);
  }

  createDebuggerConfigurator() {
    return {
      resolveConfiguration,
      adapterType: (_constants || _load_constants()).VsAdapterTypes.REACT_NATIVE
    };
  }
} /**
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

function _deriveProgramFromWorkspace(workspacePath) {
  return (_nuclideUri || _load_nuclideUri()).default.getPath((_nuclideUri || _load_nuclideUri()).default.join(workspacePath, '.vscode', 'launchReactNative.js'));
}

function _deriveOutDirFromWorkspace(workspacePath) {
  return (_nuclideUri || _load_nuclideUri()).default.getPath((_nuclideUri || _load_nuclideUri()).default.join(workspacePath, '.vscode', '.react'));
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
      vsAdapterType: (_constants || _load_constants()).VsAdapterTypes.REACT_NATIVE,
      threads: false,
      properties: launchProperties,
      scriptPropertyName: null,
      cwdPropertyName: 'workspace',
      scriptExtension: '.js',
      header: null
    },
    attach: {
      launch: false,
      vsAdapterType: (_constants || _load_constants()).VsAdapterTypes.REACT_NATIVE,
      threads: false,
      properties: attachProperties,
      cwdPropertyName: 'workspace',
      scriptExtension: '.js',
      header: null
    }
  };
}

async function resolveConfiguration(configuration) {
  const { config } = configuration;
  if (config.outDir == null) {
    config.outDir = _deriveOutDirFromWorkspace(config.workspace);
  }
  config.program = _deriveProgramFromWorkspace(config.workspace);
  delete config.workspace;
  return configuration;
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);