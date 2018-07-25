"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function DebugProtocol() {
  const data = _interopRequireWildcard(require("vscode-debugprotocol"));

  DebugProtocol = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("./constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
    this._disposables = new (_UniversalDisposable().default)();
  }

  dispose() {
    this._disposables.dispose();
  }

  onDidStartDebugSession(callback) {
    return this._service.onDidStartDebugSession(callback);
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
    const {
      viewModel
    } = this._service;
    const {
      focusedProcess
    } = viewModel;

    if (!(focusedProcess != null)) {
      throw new Error("Invariant violation: \"focusedProcess != null\"");
    }

    const isFocusedProcess = () => {
      return this._service.getDebuggerMode() !== _constants().DebuggerMode.STOPPED && viewModel.focusedProcess === focusedProcess;
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

    const disposables = new (_UniversalDisposable().default)();

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