Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiIcon2;

function _nuclideUiIcon() {
  return _nuclideUiIcon2 = require('../../nuclide-ui/Icon');
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _Constants2;

function _Constants() {
  return _Constants2 = _interopRequireDefault(require('./Constants'));
}

var _commonsNodePassesGK2;

function _commonsNodePassesGK() {
  return _commonsNodePassesGK2 = _interopRequireDefault(require('../../commons-node/passesGK'));
}

var GK_THREAD_SWITCH_UI = 'nuclide_debugger_thread_switch_ui';
var GK_TIMEOUT = 5000;

var ThreadStore = (function () {
  function ThreadStore(dispatcher) {
    _classCallCheck(this, ThreadStore);

    var dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables = new (_atom2 || _atom()).CompositeDisposable(new (_atom2 || _atom()).Disposable(function () {
      dispatcher.unregister(dispatcherToken);
    }));
    this._datatipService = null;
    this._emitter = new (_atom2 || _atom()).Emitter();
    this._threadMap = new Map();
    this._owningProcessId = 0;
    this._selectedThreadId = 0;
    this._stopThreadId = 0;
  }

  _createClass(ThreadStore, [{
    key: 'setDatatipService',
    value: function setDatatipService(service) {
      this._datatipService = service;
    }
  }, {
    key: '_handlePayload',
    value: function _handlePayload(payload) {
      switch (payload.actionType) {
        case (_Constants2 || _Constants()).default.Actions.CLEAR_INTERFACE:
          this._handleClearInterface();
          this._emitter.emit('change');
          break;
        case (_Constants2 || _Constants()).default.Actions.UPDATE_THREADS:
          this._updateThreads(payload.data.threadData);
          this._emitter.emit('change');
          break;
        case (_Constants2 || _Constants()).default.Actions.UPDATE_THREAD:
          this._updateThread(payload.data.thread);
          this._emitter.emit('change');
          break;
        case (_Constants2 || _Constants()).default.Actions.UPDATE_STOP_THREAD:
          this._updateStopThread(payload.data.id);
          this._emitter.emit('change');
          break;
        case (_Constants2 || _Constants()).default.Actions.NOTIFY_THREAD_SWITCH:
          this._notifyThreadSwitch(payload.data.sourceURL, payload.data.lineNumber, payload.data.message);
          break;
        default:
          return;
      }
    }
  }, {
    key: '_updateThreads',
    value: function _updateThreads(threadData) {
      var _this = this;

      this._threadMap.clear();
      this._owningProcessId = threadData.owningProcessId;
      this._stopThreadId = threadData.stopThreadId;
      this._selectedThreadId = threadData.stopThreadId;
      threadData.threads.forEach(function (thread) {
        return _this._threadMap.set(Number(thread.id), thread);
      });
    }
  }, {
    key: '_updateThread',
    value: function _updateThread(thread) {
      // TODO(jonaldislarry): add deleteThread API so that this stop reason checking is not needed.
      if (thread.stopReason === 'end' || thread.stopReason === 'error' || thread.stopReason === 'stopped') {
        this._threadMap.delete(Number(thread.id));
      } else {
        this._threadMap.set(Number(thread.id), thread);
      }
    }
  }, {
    key: '_updateStopThread',
    value: function _updateStopThread(id) {
      this._stopThreadId = Number(id);
      this._selectedThreadId = Number(id);
    }
  }, {
    key: '_handleClearInterface',
    value: function _handleClearInterface() {
      this._threadMap.clear();
      this._cleanUpDatatip();
    }
  }, {
    key: '_cleanUpDatatip',
    value: function _cleanUpDatatip() {
      if (this._threadChangeDatatip) {
        if (this._datatipService != null) {
          this._threadChangeDatatip.dispose();
        }
        this._threadChangeDatatip = null;
      }
    }

    // TODO(dbonafilia): refactor this code along with the ui code in callstackStore to a ui controller.
  }, {
    key: '_notifyThreadSwitch',
    value: _asyncToGenerator(function* (sourceURL, lineNumber, message) {
      var _this2 = this;

      var notifyThreadSwitches = yield (0, (_commonsNodePassesGK2 || _commonsNodePassesGK()).default)(GK_THREAD_SWITCH_UI, GK_TIMEOUT);
      if (!notifyThreadSwitches) {
        return;
      }
      var path = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.uriToNuclideUri(sourceURL);
      // we want to put the message one line above the current line unless the selected
      // line is the top line, in which case we will put the datatip next to the line.
      var notificationLineNumber = lineNumber === 0 ? 0 : lineNumber - 1;
      // only handle real files for now
      var datatipService = this._datatipService;
      if (datatipService != null && path != null && atom.workspace != null) {
        atom.workspace.open(path, { searchAllPanes: true }).then(function (editor) {
          var buffer = editor.getBuffer();
          var rowRange = buffer.rangeForRow(notificationLineNumber);
          _this2._threadChangeDatatip = datatipService.createPinnedDataTip(_this2._createAlertComponentClass(message), rowRange, true, /* pinnable */
          editor, function (pinnedDatatip) {
            datatipService.deletePinnedDatatip(pinnedDatatip);
          });
        });
      }
    })
  }, {
    key: 'getThreadList',
    value: function getThreadList() {
      return Array.from(this._threadMap.values());
    }
  }, {
    key: 'getSelectedThreadId',
    value: function getSelectedThreadId() {
      return this._selectedThreadId;
    }
  }, {
    key: 'onChange',
    value: function onChange(callback) {
      return this._emitter.on('change', callback);
    }
  }, {
    key: '_createAlertComponentClass',
    value: function _createAlertComponentClass(message) {
      return function () {
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-debugger-thread-switch-alert' },
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiIcon2 || _nuclideUiIcon()).Icon, { icon: 'alert' }),
          message
        );
      };
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._cleanUpDatatip();
      this._disposables.dispose();
    }
  }]);

  return ThreadStore;
})();

exports.default = ThreadStore;
module.exports = exports.default;