"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPrepackAutoGenConfig = getPrepackAutoGenConfig;

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _nuclideDebuggerCommon() {
  const data = require("../../../modules/nuclide-debugger-common");

  _nuclideDebuggerCommon = function () {
    return data;
  };

  return data;
}

function _AutoGenLaunchAttachProvider() {
  const data = require("../../../modules/nuclide-debugger-common/AutoGenLaunchAttachProvider");

  _AutoGenLaunchAttachProvider = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
class Activation {
  constructor() {
    this._subscriptions = new (_UniversalDisposable().default)();
  }

  createDebuggerProvider() {
    return {
      type: _nuclideDebuggerCommon().VsAdapterTypes.PREPACK,
      getLaunchAttachProvider: connection => {
        return new (_AutoGenLaunchAttachProvider().AutoGenLaunchAttachProvider)(_nuclideDebuggerCommon().VsAdapterNames.PREPACK, connection, getPrepackAutoGenConfig());
      }
    };
  }

  consumeDeepLinkService(service) {
    const disposable = service.subscribeToPath('prepack-debugger', params => {
      const debugDialogConfig = {}; // Note: single element arrays are passed as strings.
      // Arrays in the config must be treated as whitespace separated strings.
      // The following cleans up both of the above cases.

      debugDialogConfig.sourceFiles = Array.isArray(params.sourceFiles) ? params.sourceFiles.join(' ') : params.sourceFiles; // Prepack Arguments are optional

      if (params.prepackArguments) {
        debugDialogConfig.prepackArguments = Array.isArray(params.prepackArguments) ? params.prepackArguments.join(' ') : params.prepackArguments;
      } else {
        debugDialogConfig.prepackArguments = '';
      }

      debugDialogConfig.prepackRuntime = params.prepackRuntime ? params.prepackRuntime : '';
      debugDialogConfig.ignorePreviousParams = true;
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'debugger:show-launch-dialog', {
        selectedTabName: _nuclideDebuggerCommon().VsAdapterNames.PREPACK,
        config: debugDialogConfig
      });
    });

    this._subscriptions.add(disposable);

    return disposable;
  }

  dispose() {
    this._subscriptions.dispose();
  }

}

function getPrepackAutoGenConfig() {
  const filesToPrepack = {
    name: 'sourceFiles',
    type: 'array',
    itemType: 'string',
    description: 'Input the file(s) you want to Prepack. Use absolute paths.',
    required: true,
    defaultValue: '',
    visible: true
  };
  const prepackRuntimePath = {
    name: 'prepackRuntime',
    type: 'string',
    description: 'Prepack executable path (e.g. lib/prepack-cli.js). Use absolute paths.',
    required: false,
    visible: true
  };
  const argumentsProperty = {
    name: 'prepackArguments',
    type: 'array',
    itemType: 'string',
    description: 'Arguments to start Prepack',
    required: false,
    defaultValue: '',
    visible: true
  };
  const autoGenLaunchConfig = {
    launch: true,
    vsAdapterType: _nuclideDebuggerCommon().VsAdapterTypes.PREPACK,
    threads: false,
    properties: [filesToPrepack, prepackRuntimePath, argumentsProperty],
    scriptPropertyName: 'filesToPrepack',
    scriptExtension: '.js',
    cwdPropertyName: null,
    header: null,

    getProcessName(values) {
      return 'Prepack (Debugging)';
    }

  };
  return {
    launch: autoGenLaunchConfig,
    attach: null
  };
}

(0, _createPackage().default)(module.exports, Activation);