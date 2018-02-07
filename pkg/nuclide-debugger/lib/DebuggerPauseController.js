'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerPauseController = undefined;

var _DebuggerStore;

function _load_DebuggerStore() {
  return _DebuggerStore = require('./DebuggerStore');
}

var _AtomServiceContainer;

function _load_AtomServiceContainer() {
  return _AtomServiceContainer = require('./AtomServiceContainer');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DebuggerPauseController {

  constructor(store) {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._store = store;
    store.onDebuggerModeChange(() => this._handleChange());
  }

  _handleChange() {
    const mode = this._store.getDebuggerMode();
    if (mode === (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.PAUSED) {
      // Moving from non-pause to pause state.
      this._scheduleNativeNotification();
    }
  }

  _scheduleNativeNotification() {
    const raiseNativeNotification = (0, (_AtomServiceContainer || _load_AtomServiceContainer()).getNotificationService)();
    if (raiseNativeNotification != null) {
      const pendingNotification = raiseNativeNotification('Nuclide Debugger', 'Paused at a breakpoint', 3000, false);
      if (pendingNotification != null) {
        this._disposables.add(pendingNotification);
      }
    }
  }

  dispose() {
    this._disposables.dispose();
  }
}
exports.DebuggerPauseController = DebuggerPauseController; /**
                                                            * Copyright (c) 2015-present, Facebook, Inc.
                                                            * All rights reserved.
                                                            *
                                                            * This source code is licensed under the license found in the LICENSE file in
                                                            * the root directory of this source tree.
                                                            *
                                                            * 
                                                            * @format
                                                            */