var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _Constants2;

function _Constants() {
  return _Constants2 = _interopRequireDefault(require('./Constants'));
}

var _DebuggerSettings2;

function _DebuggerSettings() {
  return _DebuggerSettings2 = require('./DebuggerSettings');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var DebuggerMode = Object.freeze({
  STARTING: 'starting',
  RUNNING: 'running',
  PAUSED: 'paused',
  STOPPING: 'stopping',
  STOPPED: 'stopped'
});

var DEBUGGER_CHANGE_EVENT = 'change';
var DEBUGGER_MODE_CHANGE_EVENT = 'debugger mode change';

/**
 * Flux style Store holding all data used by the debugger plugin.
 */

var DebuggerStore = (function () {
  function DebuggerStore(dispatcher, model) {
    var _this = this;

    _classCallCheck(this, DebuggerStore);

    this._dispatcher = dispatcher;
    this._model = model;
    this._emitter = new (_atom2 || _atom()).Emitter();
    this._dispatcherToken = this._dispatcher.register(this._handlePayload.bind(this));

    this._debuggerSettings = new (_DebuggerSettings2 || _DebuggerSettings()).DebuggerSettings();
    this._debuggerInstance = null;
    this._error = null;
    this._evaluationExpressionProviders = new Set();
    this._processSocket = null;
    this._debuggerMode = DebuggerMode.STOPPED;
    this._togglePauseOnException = false;
    this._togglePauseOnCaughtException = false;
    this._enableSingleThreadStepping = false;
    this._registerExecutor = null;
    this._consoleDisposable = null;
    this._customControlButtons = [];
    this.loaderBreakpointResumePromise = new Promise(function (resolve) {
      _this._onLoaderBreakpointResume = resolve;
    });
  }

  _createClass(DebuggerStore, [{
    key: 'dispose',
    value: function dispose() {
      this._emitter.dispose();
      this._dispatcher.unregister(this._dispatcherToken);
      if (this._debuggerInstance) {
        this._debuggerInstance.dispose();
      }
    }
  }, {
    key: 'loaderBreakpointResumed',
    value: function loaderBreakpointResumed() {
      this._onLoaderBreakpointResume(); // Resolves onLoaderBreakpointResumePromise.
    }
  }, {
    key: 'getCustomControlButtons',
    value: function getCustomControlButtons() {
      return this._customControlButtons;
    }
  }, {
    key: 'getConsoleExecutorFunction',
    value: function getConsoleExecutorFunction() {
      return this._registerExecutor;
    }
  }, {
    key: 'getDebuggerInstance',
    value: function getDebuggerInstance() {
      return this._debuggerInstance;
    }
  }, {
    key: 'getError',
    value: function getError() {
      return this._error;
    }
  }, {
    key: 'getProcessSocket',
    value: function getProcessSocket() {
      return this._processSocket;
    }
  }, {
    key: 'getDebuggerMode',
    value: function getDebuggerMode() {
      return this._debuggerMode;
    }
  }, {
    key: 'getTogglePauseOnException',
    value: function getTogglePauseOnException() {
      return this._togglePauseOnException;
    }
  }, {
    key: 'getTogglePauseOnCaughtException',
    value: function getTogglePauseOnCaughtException() {
      return this._togglePauseOnCaughtException;
    }
  }, {
    key: 'getEnableSingleThreadStepping',
    value: function getEnableSingleThreadStepping() {
      return this._enableSingleThreadStepping;
    }
  }, {
    key: 'getSettings',
    value: function getSettings() {
      return this._debuggerSettings;
    }
  }, {
    key: 'getEvaluationExpressionProviders',
    value: function getEvaluationExpressionProviders() {
      return this._evaluationExpressionProviders;
    }
  }, {
    key: 'initializeSingleThreadStepping',
    value: function initializeSingleThreadStepping(mode) {
      this._enableSingleThreadStepping = mode;
    }
  }, {
    key: 'onChange',
    value: function onChange(callback) {
      return this._emitter.on(DEBUGGER_CHANGE_EVENT, callback);
    }
  }, {
    key: 'onDebuggerModeChange',
    value: function onDebuggerModeChange(callback) {
      return this._emitter.on(DEBUGGER_MODE_CHANGE_EVENT, callback);
    }
  }, {
    key: '_handlePayload',
    value: function _handlePayload(payload) {
      var _this2 = this;

      switch (payload.actionType) {
        case (_Constants2 || _Constants()).default.Actions.SET_PROCESS_SOCKET:
          this._processSocket = payload.data;
          break;
        case (_Constants2 || _Constants()).default.Actions.SET_ERROR:
          this._error = payload.data;
          break;
        case (_Constants2 || _Constants()).default.Actions.SET_DEBUGGER_INSTANCE:
          this._debuggerInstance = payload.data;
          break;
        case (_Constants2 || _Constants()).default.Actions.TOGGLE_PAUSE_ON_EXCEPTION:
          var pauseOnException = payload.data;
          this._togglePauseOnException = pauseOnException;
          this._model.getBridge().setPauseOnException(pauseOnException);
          break;
        case (_Constants2 || _Constants()).default.Actions.TOGGLE_PAUSE_ON_CAUGHT_EXCEPTION:
          var pauseOnCaughtException = payload.data;
          this._togglePauseOnCaughtException = pauseOnCaughtException;
          this._model.getBridge().setPauseOnCaughtException(pauseOnCaughtException);
          break;
        case (_Constants2 || _Constants()).default.Actions.TOGGLE_SINGLE_THREAD_STEPPING:
          var singleThreadStepping = payload.data;
          this._enableSingleThreadStepping = singleThreadStepping;
          this._model.getBridge().setSingleThreadStepping(singleThreadStepping);
          break;
        case (_Constants2 || _Constants()).default.Actions.DEBUGGER_MODE_CHANGE:
          this._debuggerMode = payload.data;
          if (this._debuggerMode === DebuggerMode.STOPPED) {
            this.loaderBreakpointResumePromise = new Promise(function (resolve) {
              _this2._onLoaderBreakpointResume = resolve;
            });
          }
          this._emitter.emit(DEBUGGER_MODE_CHANGE_EVENT);
          break;
        case (_Constants2 || _Constants()).default.Actions.ADD_EVALUATION_EXPRESSION_PROVIDER:
          if (this._evaluationExpressionProviders.has(payload.data)) {
            return;
          }
          this._evaluationExpressionProviders.add(payload.data);
          break;
        case (_Constants2 || _Constants()).default.Actions.REMOVE_EVALUATION_EXPRESSION_PROVIDER:
          if (!this._evaluationExpressionProviders.has(payload.data)) {
            return;
          }
          this._evaluationExpressionProviders.delete(payload.data);
          break;
        case (_Constants2 || _Constants()).default.Actions.ADD_REGISTER_EXECUTOR:
          (0, (_assert2 || _assert()).default)(this._registerExecutor == null);
          this._registerExecutor = payload.data;
          break;
        case (_Constants2 || _Constants()).default.Actions.REMOVE_REGISTER_EXECUTOR:
          (0, (_assert2 || _assert()).default)(this._registerExecutor === payload.data);
          this._registerExecutor = null;
          break;
        case (_Constants2 || _Constants()).default.Actions.REGISTER_CONSOLE:
          if (this._registerExecutor != null) {
            this._consoleDisposable = this._registerExecutor();
          }
          break;
        case (_Constants2 || _Constants()).default.Actions.UNREGISTER_CONSOLE:
          if (this._consoleDisposable != null) {
            this._consoleDisposable.dispose();
            this._consoleDisposable = null;
          }
          break;
        case (_Constants2 || _Constants()).default.Actions.ADD_CUSTOM_CONTROL_BUTTONS:
          this._customControlButtons = payload.data;
          break;
        default:
          return;
      }
      this._emitter.emit(DEBUGGER_CHANGE_EVENT);
    }
  }]);

  return DebuggerStore;
})();

module.exports = {
  DebuggerMode: DebuggerMode,
  DebuggerStore: DebuggerStore
};

// Stored values