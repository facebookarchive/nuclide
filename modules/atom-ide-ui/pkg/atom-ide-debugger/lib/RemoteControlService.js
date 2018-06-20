'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vscodeDebugprotocol;

function _load_vscodeDebugprotocol() {
  return _vscodeDebugprotocol = _interopRequireWildcard(require('vscode-debugprotocol'));
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../../nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class RemoteControlService {

  constructor(service) {
    this._service = service;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  dispose() {
    this._disposables.dispose();
  }

  _onSessionEnd(focusedProcess, disposables) {
    disposables.add(this._service.viewModel.onDidFocusProcess(() => {
      if (!this._service.getModel().getProcesses().includes(focusedProcess)) {
        disposables.dispose();
      }
    }));
  }

  async startVspDebugging(config) {
    await this._service.startDebugging(config);

    const { viewModel } = this._service;
    const { focusedProcess } = viewModel;

    if (!(focusedProcess != null)) {
      throw new Error('Invariant violation: "focusedProcess != null"');
    }

    const isFocusedProcess = () => {
      return this._service.getDebuggerMode() !== (_constants || _load_constants()).DebuggerMode.STOPPED && viewModel.focusedProcess === focusedProcess;
    };

    const customRequest = async (request, args) => {
      if (!isFocusedProcess()) {
        throw new Error('Cannot send custom requests to a no longer active debug session!');
      }
      return focusedProcess.session.custom(request, args);
    };

    const observeCustomEvents = () => {
      if (!isFocusedProcess()) {
        throw new Error('Cannot send custom requests to a no longer active debug session!');
      }
      return focusedProcess.session.observeCustomEvents();
    };

    const disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    const addCustomDisposable = disposable => {
      disposables.add(disposable);
    };

    this._onSessionEnd(focusedProcess, disposables);

    return Object.freeze({
      customRequest,
      observeCustomEvents,
      addCustomDisposable
    });
  }
}
exports.default = RemoteControlService;