'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _DebuggerDispatcher;

function _load_DebuggerDispatcher() {
  return _DebuggerDispatcher = require('./DebuggerDispatcher');
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

class DebuggerActionsStore {

  constructor(dispatcher, bridge) {
    this._bridge = bridge;
    const dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      dispatcher.unregister(dispatcherToken);
    });
  }

  _handlePayload(payload) {
    switch (payload.actionType) {
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.SET_PROCESS_SOCKET:
        const { data } = payload;
        if (data == null) {
          this._bridge.leaveDebugMode();
        } else {
          this._bridge.enterDebugMode();
          this._bridge.setupChromeChannel();
          this._bridge.enableEventsListening();
        }
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.TRIGGER_DEBUGGER_ACTION:
        this._triggerAction(payload.data.actionId);
        break;
      default:
        return;
    }
  }

  _triggerAction(actionId) {
    this._bridge.triggerAction(actionId);
  }

  dispose() {
    this._disposables.dispose();
  }
}
exports.default = DebuggerActionsStore;