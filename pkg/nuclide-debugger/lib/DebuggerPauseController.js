'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerPauseController = undefined;

var _electron = _interopRequireDefault(require('electron'));

var _DebuggerStore;

function _load_DebuggerStore() {
  return _DebuggerStore = require('./DebuggerStore');
}

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _atom = require('atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { remote } = _electron.default; /**
                                       * Copyright (c) 2015-present, Facebook, Inc.
                                       * All rights reserved.
                                       *
                                       * This source code is licensed under the license found in the LICENSE file in
                                       * the root directory of this source tree.
                                       *
                                       * 
                                       * @format
                                       */

if (!(remote != null)) {
  throw new Error('Invariant violation: "remote != null"');
}

class DebuggerPauseController {

  constructor(store) {
    this._disposables = new _atom.CompositeDisposable();
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
    const raiseNativeNotification = (0, (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).getNotificationService)();
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
exports.DebuggerPauseController = DebuggerPauseController;