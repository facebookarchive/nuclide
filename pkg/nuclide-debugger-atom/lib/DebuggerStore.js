Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('atom');

var Disposable = _require.Disposable;

var _require2 = require('events');

var EventEmitter = _require2.EventEmitter;

var Constants = require('./Constants');

var DebuggerMode = Object.freeze({
  STARTING: 'starting',
  RUNNING: 'running',
  PAUSED: 'paused',
  STOPPING: 'stopping',
  STOPPED: 'stopped'
});

/**
 * Flux style Store holding all data used by the debugger plugin.
 */

var DebuggerStore = (function () {
  function DebuggerStore(dispatcher) {
    var _this = this;

    _classCallCheck(this, DebuggerStore);

    this._dispatcher = dispatcher;
    this._eventEmitter = new EventEmitter();
    this._dispatcherToken = this._dispatcher.register(this._handlePayload.bind(this));

    this._debuggerInstance = null;
    this._error = null;
    this._services = new Set();
    this._evaluationExpressionProviders = new Set();
    this._processSocket = null;
    this._debuggerMode = DebuggerMode.STOPPED;
    this.loaderBreakpointResumePromise = new Promise(function (resolve) {
      _this._onLoaderBreakpointResume = resolve;
    });
  }

  _createClass(DebuggerStore, [{
    key: 'dispose',
    value: function dispose() {
      this._eventEmitter.removeAllListeners();
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
    key: 'getDebuggerInstance',
    value: function getDebuggerInstance() {
      return this._debuggerInstance;
    }
  }, {
    key: 'getError',
    value: function getError() {
      return this._error;
    }

    /**
     * Return attachables.
     *
     * @param optional service name (e.g. lldb) to filter resulting attachables.
     */
  }, {
    key: 'getProcessInfoList',
    value: function getProcessInfoList(serviceName) {
      return Promise.all(Array.from(this._services).map(function (service) {
        if (!serviceName || service.name === serviceName) {
          return service.getProcessInfoList();
        } else {
          return Promise.resolve([]);
        }
      })).then(function (values) {
        return [].concat.apply([], values);
      });
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
    key: 'getEvaluationExpressionProviders',
    value: function getEvaluationExpressionProviders() {
      return this._evaluationExpressionProviders;
    }
  }, {
    key: 'onChange',
    value: function onChange(callback) {
      var emitter = this._eventEmitter;
      this._eventEmitter.on('change', callback);
      return new Disposable(function () {
        return emitter.removeListener('change', callback);
      });
    }
  }, {
    key: 'setDebuggerMode',
    value: function setDebuggerMode(newMode) {
      this._debuggerMode = newMode;
      // Using a setter is necessary to circumvent timing issues when using the dispatcher.
      // TODO fix underlying dispatcher timing problem & move to proper Flux implementation.
      // this._dispatcher.dispatch({
      //   actionType: Constants.Actions.DEBUGGER_MODE_CHANGE,
      //   data: newMode,
      // });
    }
  }, {
    key: '_handlePayload',
    value: function _handlePayload(payload) {
      var _this2 = this;

      switch (payload.actionType) {
        case Constants.Actions.SET_PROCESS_SOCKET:
          this._processSocket = payload.data;
          break;
        case Constants.Actions.ADD_SERVICE:
          if (this._services.has(payload.data)) {
            return;
          }
          this._services.add(payload.data);
          break;
        case Constants.Actions.REMOVE_SERVICE:
          if (!this._services.has(payload.data)) {
            return;
          }
          this._services['delete'](payload.data);
          break;
        case Constants.Actions.SET_ERROR:
          this._error = payload.data;
          break;
        case Constants.Actions.SET_DEBUGGER_INSTANCE:
          this._debuggerInstance = payload.data;
          break;
        case Constants.Actions.DEBUGGER_MODE_CHANGE:
          this._debuggerMode = payload.data;
          if (this._debuggerMode === DebuggerMode.STOPPED) {
            this.loaderBreakpointResumePromise = new Promise(function (resolve) {
              _this2._onLoaderBreakpointResume = resolve;
            });
          }
          break;
        case Constants.Actions.ADD_EVALUATION_EXPRESSION_PROVIDER:
          if (this._evaluationExpressionProviders.has(payload.data)) {
            return;
          }
          this._evaluationExpressionProviders.add(payload.data);
          break;
        case Constants.Actions.REMOVE_EVALUATION_EXPRESSION_PROVIDER:
          if (!this._evaluationExpressionProviders.has(payload.data)) {
            return;
          }
          this._evaluationExpressionProviders['delete'](payload.data);
          break;
        default:
          return;
      }
      this._eventEmitter.emit('change');
    }
  }]);

  return DebuggerStore;
})();

module.exports = {
  DebuggerMode: DebuggerMode,
  DebuggerStore: DebuggerStore
};

// Stored values