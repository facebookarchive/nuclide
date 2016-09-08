Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _electron2;

function _electron() {
  return _electron2 = _interopRequireDefault(require('electron'));
}

var _DebuggerStore2;

function _DebuggerStore() {
  return _DebuggerStore2 = require('./DebuggerStore');
}

var _nuclideDebuggerBase2;

function _nuclideDebuggerBase() {
  return _nuclideDebuggerBase2 = require('../../nuclide-debugger-base');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var remote = (_electron2 || _electron()).default.remote;

(0, (_assert2 || _assert()).default)(remote != null);

var DebuggerPauseController = (function () {
  function DebuggerPauseController(store) {
    var _this = this;

    _classCallCheck(this, DebuggerPauseController);

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    this._store = store;
    store.onDebuggerModeChange(function () {
      return _this._handleChange();
    });
  }

  _createClass(DebuggerPauseController, [{
    key: '_handleChange',
    value: function _handleChange() {
      var mode = this._store.getDebuggerMode();
      if (mode === (_DebuggerStore2 || _DebuggerStore()).DebuggerMode.PAUSED) {
        // Moving from non-pause to pause state.
        this._scheduleNativeNotification();
      }
    }
  }, {
    key: '_scheduleNativeNotification',
    value: function _scheduleNativeNotification() {
      var currentWindow = remote.getCurrentWindow();
      if (currentWindow.isFocused()) {
        return;
      }

      var timeoutId = setTimeout(function () {
        var raiseNativeNotification = (0, (_nuclideDebuggerBase2 || _nuclideDebuggerBase()).getNotificationService)();
        if (raiseNativeNotification != null) {
          raiseNativeNotification('Nuclide Debugger', 'Paused at a breakpoint');
        }
      }, 3000);

      // If the user focuses the window at any time, then they are assumed to have seen the debugger
      // pause, and we will not display a notification.
      currentWindow.once('focus', function () {
        clearTimeout(timeoutId);
      });

      this._disposables.add(new (_atom2 || _atom()).Disposable(function () {
        return clearTimeout(timeoutId);
      }));
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return DebuggerPauseController;
})();

exports.DebuggerPauseController = DebuggerPauseController;