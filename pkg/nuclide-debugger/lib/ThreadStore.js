'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _atom = require('atom');

var _react = _interopRequireWildcard(require('react'));

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _DebuggerDispatcher;

function _load_DebuggerDispatcher() {
  return _DebuggerDispatcher = require('./DebuggerDispatcher');
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

var _DebuggerStore;

function _load_DebuggerStore() {
  return _DebuggerStore = require('./DebuggerStore');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const GK_THREAD_SWITCH_UI = 'nuclide_debugger_thread_switch_ui';
const GK_TIMEOUT = 5000;

class ThreadStore {

  constructor(dispatcher) {
    const dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables = new _atom.CompositeDisposable(new _atom.Disposable(() => {
      dispatcher.unregister(dispatcherToken);
    }));
    this._datatipService = null;
    this._emitter = new _atom.Emitter();
    this._threadMap = new Map();
    this._owningProcessId = 0;
    this._selectedThreadId = 0;
    this._stopThreadId = 0;
    this._threadsReloading = false;
    this._debuggerMode = (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STOPPED;
  }

  setDatatipService(service) {
    this._datatipService = service;
  }

  _handlePayload(payload) {
    switch (payload.actionType) {
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.CLEAR_INTERFACE:
        this._handleClearInterface();
        this._emitter.emit('change');
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_THREADS:
        this._threadsReloading = false;
        this._updateThreads(payload.data.threadData);
        this._emitter.emit('change');
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_THREAD:
        this._threadsReloading = false;
        this._updateThread(payload.data.thread);
        this._emitter.emit('change');
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_STOP_THREAD:
        this._updateStopThread(payload.data.id);
        this._emitter.emit('change');
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_SELECTED_THREAD:
        this._updateSelectedThread(payload.data.id);
        this._emitter.emit('change');
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.NOTIFY_THREAD_SWITCH:
        this._notifyThreadSwitch(payload.data.sourceURL, payload.data.lineNumber, payload.data.message);
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.DEBUGGER_MODE_CHANGE:
        if (this._debuggerMode === (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.RUNNING && payload.data === (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.PAUSED) {
          // If the debugger just transitioned from running to paused, the debug server should
          // be sending updated thread stacks. This may take a moment.
          this._threadsReloading = true;
        } else if (payload.data === (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.RUNNING) {
          // The UI is never waiting for threads if it's running.
          this._threadsReloading = false;
        }
        this._debuggerMode = payload.data;
        this._emitter.emit('change');
        break;
      default:
        return;
    }
  }

  _updateThreads(threadData) {
    this._threadMap.clear();
    this._owningProcessId = threadData.owningProcessId;
    this._stopThreadId = threadData.stopThreadId;
    this._selectedThreadId = threadData.stopThreadId;
    this._threadsReloading = false;
    threadData.threads.forEach(thread => this._threadMap.set(Number(thread.id), thread));
  }

  _updateThread(thread) {
    // TODO(jonaldislarry): add deleteThread API so that this stop reason checking is not needed.
    if (thread.stopReason === 'end' || thread.stopReason === 'error' || thread.stopReason === 'stopped') {
      this._threadMap.delete(Number(thread.id));
    } else {
      this._threadMap.set(Number(thread.id), thread);
    }
  }

  _updateStopThread(id) {
    this._stopThreadId = Number(id);
    this._selectedThreadId = Number(id);
  }

  _updateSelectedThread(id) {
    this._selectedThreadId = Number(id);
  }

  _handleClearInterface() {
    this._threadMap.clear();
    this._cleanUpDatatip();
  }

  _cleanUpDatatip() {
    if (this._threadChangeDatatip) {
      if (this._datatipService != null) {
        this._threadChangeDatatip.dispose();
      }
      this._threadChangeDatatip = null;
    }
  }

  // TODO(dbonafilia): refactor this code along with the ui code in callstackStore to a ui controller.
  _notifyThreadSwitch(sourceURL, lineNumber, message) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const notifyThreadSwitches = yield (0, (_passesGK || _load_passesGK()).default)(GK_THREAD_SWITCH_UI, GK_TIMEOUT);
      if (!notifyThreadSwitches) {
        return;
      }
      const path = (_nuclideUri || _load_nuclideUri()).default.uriToNuclideUri(sourceURL);
      // we want to put the message one line above the current line unless the selected
      // line is the top line, in which case we will put the datatip next to the line.
      const notificationLineNumber = lineNumber === 0 ? 0 : lineNumber - 1;
      // only handle real files for now
      const datatipService = _this._datatipService;
      if (datatipService != null && path != null && atom.workspace != null) {
        // This should be goToLocation instead but since the searchAllPanes option is correctly
        // provided it's not urgent.
        // eslint-disable-next-line nuclide-internal/atom-apis
        atom.workspace.open(path, { searchAllPanes: true }).then(function (editor) {
          const buffer = editor.getBuffer();
          const rowRange = buffer.rangeForRow(notificationLineNumber);
          _this._threadChangeDatatip = datatipService.createPinnedDataTip({
            component: _this._createAlertComponentClass(message),
            range: rowRange,
            pinnable: true
          }, editor);
        });
      }
    })();
  }

  getThreadList() {
    return Array.from(this._threadMap.values());
  }

  getSelectedThreadId() {
    return this._selectedThreadId;
  }

  getThreadsReloading() {
    return this._threadsReloading;
  }

  onChange(callback) {
    return this._emitter.on('change', callback);
  }

  _createAlertComponentClass(message) {
    return () => _react.createElement(
      'div',
      { className: 'nuclide-debugger-thread-switch-alert' },
      _react.createElement((_Icon || _load_Icon()).Icon, { icon: 'alert' }),
      message
    );
  }

  dispose() {
    this._cleanUpDatatip();
    this._disposables.dispose();
  }
}
exports.default = ThreadStore;