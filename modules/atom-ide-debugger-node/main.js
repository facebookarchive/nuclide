'use strict';

var _react = _interopRequireWildcard(require('react'));

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../nuclide-commons-atom/createPackage'));
}

var _constants;

function _load_constants() {
  return _constants = require('../nuclide-debugger-common/constants');
}

var _AutoGenLaunchAttachProvider;

function _load_AutoGenLaunchAttachProvider() {
  return _AutoGenLaunchAttachProvider = require('../nuclide-debugger-common/AutoGenLaunchAttachProvider');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class Activation {
  constructor() {}
  dispose() {}

  createDebuggerProvider() {
    return {
      type: (_constants || _load_constants()).VsAdapterTypes.NODE,
      getLaunchAttachProvider: connection => {
        return new (_AutoGenLaunchAttachProvider || _load_AutoGenLaunchAttachProvider()).AutoGenLaunchAttachProvider('Node', connection, getNodeConfig());
      }
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

function getNodeConfig() {
  const program = {
    name: 'program',
    type: 'string',
    description: 'Absolute path to the program.',
    required: true,
    visible: true
  };
  const cwd = {
    name: 'cwd',
    type: 'string',
    description: 'Absolute path to the working directory of the program being debugged.',
    required: true,
    visible: true
  };
  const stopOnEntry = {
    name: 'stopOnEntry',
    type: 'boolean',
    description: 'Automatically stop program after launch.',
    defaultValue: false,
    required: false,
    visible: true
  };

  const args = {
    name: 'args',
    type: 'array',
    itemType: 'string',
    description: 'Command line arguments passed to the program.',
    defaultValue: [],
    required: false,
    visible: true
  };
  const runtimeExecutable = {
    name: 'runtimeExecutable',
    type: 'string',
    description: '(Optional) Runtime to use, an absolute path or the name of a runtime available on PATH',
    required: false,
    visible: true
  };
  const env = {
    name: 'env',
    type: 'object',
    description: '(Optional) Environment variables (e.g. SHELL=/bin/bash PATH=/bin)',
    defaultValue: {},
    required: false,
    visible: true
  };
  const outFiles = {
    name: 'outFiles',
    type: 'array',
    itemType: 'string',
    description: '(Optional) When source maps are enabled, these glob patterns specify the generated JavaScript files',
    defaultValue: [],
    required: false,
    visible: true
  };
  const protocol = {
    name: 'protocol',
    type: 'string',
    description: '',
    defaultValue: 'inspector',
    required: false,
    visible: false
  };

  const port = {
    name: 'port',
    type: 'number',
    description: 'Port',
    required: true,
    visible: true
  };

  return {
    launch: {
      launch: true,
      vsAdapterType: (_constants || _load_constants()).VsAdapterTypes.NODE,
      threads: false,
      properties: [program, cwd, stopOnEntry, args, runtimeExecutable, env, outFiles, protocol],
      scriptPropertyName: 'program',
      cwdPropertyName: 'cwd',
      scriptExtension: '.js',
      header: _react.createElement(
        'p',
        null,
        'This is intended to debug node.js files (for node version 6.3+).'
      )
    },
    attach: {
      launch: false,
      vsAdapterType: (_constants || _load_constants()).VsAdapterTypes.NODE,
      threads: false,
      properties: [port],
      scriptExtension: '.js',
      header: _react.createElement(
        'p',
        null,
        'Attach to a running node.js process'
      )
    }
  };
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);