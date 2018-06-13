'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NUCLIDE_PYTHON_DEBUGGER_DEX_URI = undefined;
exports.getPythonAutoGenConfig = getPythonAutoGenConfig;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../nuclide-commons/UniversalDisposable'));
}

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

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const NUCLIDE_PYTHON_DEBUGGER_DEX_URI = exports.NUCLIDE_PYTHON_DEBUGGER_DEX_URI = 'https://our.intern.facebook.com/intern/dex/python-and-fbcode/debugging/#nuclide'; /**
                                                                                                                                                                      * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                      * All rights reserved.
                                                                                                                                                                      *
                                                                                                                                                                      * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                      * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                      * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                      *
                                                                                                                                                                      *  strict-local
                                                                                                                                                                      * @format
                                                                                                                                                                      */

class Activation {

  constructor() {
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default((0, (_utils || _load_utils()).listenToRemoteDebugCommands)());
  }

  dispose() {
    this._subscriptions.dispose();
  }

  consumeRpcService(rpcService) {
    return (0, (_utils || _load_utils()).setRpcService)(rpcService);
  }

  createDebuggerProvider() {
    return {
      type: (_constants || _load_constants()).VsAdapterTypes.PYTHON,
      getLaunchAttachProvider: connection => {
        return new (_AutoGenLaunchAttachProvider || _load_AutoGenLaunchAttachProvider()).AutoGenLaunchAttachProvider('Python', connection, getPythonAutoGenConfig());
      }
    };
  }
}

function getPythonAutoGenConfig() {
  const program = {
    name: 'program',
    type: 'string',
    description: 'Absolute path to the program.',
    required: true,
    visible: true
  };
  const pythonPath = {
    name: 'pythonPath',
    type: 'string',
    description: 'Path to python executable.',
    required: true,
    visible: true
  };
  const cwd = {
    name: 'cwd',
    type: 'string',
    description: '(Optional) Absolute path to the working directory of the program being debugged. Default is the root directory of the file.',
    required: true,
    visible: true
  };
  const args = {
    name: 'args',
    type: 'array',
    itemType: 'string',
    description: 'Command line arguments passed to the program',
    defaultValue: [],
    required: false,
    visible: true
  };
  const stopOnEntry = {
    name: 'stopOnEntry',
    type: 'boolean',
    description: 'Automatically stop after launch.',
    defaultValue: false,
    required: false,
    visible: true
  };
  const debugOptions = {
    name: 'debugOptions',
    type: 'array',
    itemType: 'string',
    description: 'Advanced options, view read me for further details.',
    defaultValue: ['WaitOnAbnormalExit', 'WaitOnNormalExit', 'RedirectOutput'],
    required: false,
    visible: false
  };
  const env = {
    name: 'env',
    type: 'object',
    description: '(Optional) Environment variables (e.g. SHELL=/bin/bash PATH=/bin)',
    defaultValue: {},
    required: false,
    visible: true
  };

  return {
    launch: {
      launch: true,
      vsAdapterType: (_constants || _load_constants()).VsAdapterTypes.PYTHON,
      threads: true,
      properties: [program, pythonPath, cwd, args, stopOnEntry, debugOptions, env],
      scriptPropertyName: 'program',
      scriptExtension: '.py',
      cwdPropertyName: 'cwd',
      header: isNuclideEnvironment() ? _react.createElement(
        'p',
        null,
        'This is intended to debug python script files.',
        _react.createElement('br', null),
        'To debug buck targets, you should',
        ' ',
        _react.createElement(
          'a',
          { href: NUCLIDE_PYTHON_DEBUGGER_DEX_URI },
          'use the buck toolbar instead'
        ),
        '.'
      ) : null
    },
    attach: null
  };
}

function isNuclideEnvironment() {
  return atom.packages.isPackageLoaded('nuclide');
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);