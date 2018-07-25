"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPythonAutoGenConfig = getPythonAutoGenConfig;
exports.NUCLIDE_PYTHON_DEBUGGER_DEX_URI = void 0;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
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

var React = _interopRequireWildcard(require("react"));

function _createPackage() {
  const data = _interopRequireDefault(require("../nuclide-commons-atom/createPackage"));

  _createPackage = function () {
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

function _utils() {
  const data = require("./utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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
const NUCLIDE_PYTHON_DEBUGGER_DEX_URI = 'https://our.intern.facebook.com/intern/dex/python-and-fbcode/debugging/#nuclide';
exports.NUCLIDE_PYTHON_DEBUGGER_DEX_URI = NUCLIDE_PYTHON_DEBUGGER_DEX_URI;

class Activation {
  constructor() {
    this._subscriptions = new (_UniversalDisposable().default)((0, _utils().listenToRemoteDebugCommands)());
  }

  dispose() {
    this._subscriptions.dispose();
  }

  consumeRpcService(rpcService) {
    return (0, _utils().setRpcService)(rpcService);
  }

  createDebuggerProvider() {
    return {
      type: _nuclideDebuggerCommon().VsAdapterTypes.PYTHON,
      getLaunchAttachProvider: connection => {
        return new (_AutoGenLaunchAttachProvider().AutoGenLaunchAttachProvider)(_nuclideDebuggerCommon().VsAdapterNames.PYTHON, connection, getPythonAutoGenConfig());
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
      vsAdapterType: _nuclideDebuggerCommon().VsAdapterTypes.PYTHON,
      threads: true,
      properties: [program, pythonPath, cwd, args, stopOnEntry, debugOptions, env],
      scriptPropertyName: 'program',
      scriptExtension: '.py',
      cwdPropertyName: 'cwd',
      header: isNuclideEnvironment() ? React.createElement("p", null, "This is intended to debug python script files.", React.createElement("br", null), "To debug buck targets, you should", ' ', React.createElement("a", {
        href: NUCLIDE_PYTHON_DEBUGGER_DEX_URI
      }, "use the buck toolbar instead"), ".") : null,

      getProcessName(values) {
        let processName = values.program;
        const lastSlash = processName.lastIndexOf('/');

        if (lastSlash >= 0) {
          processName = processName.substring(lastSlash + 1, processName.length);
        }

        processName += ' (Python)';
        return processName;
      }

    },
    attach: null
  };
}

function isNuclideEnvironment() {
  return atom.packages.isPackageLoaded('nuclide');
}

(0, _createPackage().default)(module.exports, Activation);