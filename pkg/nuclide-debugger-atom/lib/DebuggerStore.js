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
//# sourceMappingURL=data:application/json;base64,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TyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pELGdCQUFNO0FBQUEsQUFDUjtBQUNFLGlCQUFPO0FBQUEsT0FDVjtBQUNELFVBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ25DOzs7U0FoSkcsYUFBYTs7O0FBbUpuQixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsY0FBWSxFQUFaLFlBQVk7QUFDWixlQUFhLEVBQWIsYUFBYTtDQUNkLENBQUMiLCJmaWxlIjoiRGVidWdnZXJTdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IHtFdmVudEVtaXR0ZXJ9ID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5jb25zdCBDb25zdGFudHMgPSByZXF1aXJlKCcuL0NvbnN0YW50cycpO1xuXG5pbXBvcnQgdHlwZSB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5pbXBvcnQgdHlwZSB7XG4gIG51Y2xpZGVfZGVidWdnZXIkU2VydmljZSxcbiAgTnVjbGlkZUV2YWx1YXRpb25FeHByZXNzaW9uUHJvdmlkZXIsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtZGVidWdnZXItaW50ZXJmYWNlcy9zZXJ2aWNlJztcbmltcG9ydCB0eXBlIERlYnVnZ2VySW5zdGFuY2UgZnJvbSAnLi9EZWJ1Z2dlckluc3RhbmNlJztcbmltcG9ydCB0eXBlIERlYnVnZ2VyUHJvY2Vzc0luZm9UeXBlIGZyb20gJy4vRGVidWdnZXJQcm9jZXNzSW5mbyc7XG5cbmV4cG9ydCB0eXBlIERlYnVnZ2VyTW9kZVR5cGUgPSAnc3RhcnRpbmcnIHwgJ3J1bm5pbmcnIHwgJ3BhdXNlZCcgfCAnc3RvcHBpbmcnIHwgJ3N0b3BwZWQnO1xuY29uc3QgRGVidWdnZXJNb2RlOiB7W2tleTogc3RyaW5nXTogRGVidWdnZXJNb2RlVHlwZX0gPSBPYmplY3QuZnJlZXplKHtcbiAgU1RBUlRJTkc6ICdzdGFydGluZycsXG4gIFJVTk5JTkc6ICdydW5uaW5nJyxcbiAgUEFVU0VEOiAncGF1c2VkJyxcbiAgU1RPUFBJTkc6ICdzdG9wcGluZycsXG4gIFNUT1BQRUQ6ICdzdG9wcGVkJyxcbn0pO1xuXG4vKipcbiAqIEZsdXggc3R5bGUgU3RvcmUgaG9sZGluZyBhbGwgZGF0YSB1c2VkIGJ5IHRoZSBkZWJ1Z2dlciBwbHVnaW4uXG4gKi9cbmNsYXNzIERlYnVnZ2VyU3RvcmUge1xuICBfZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcbiAgX2V2ZW50RW1pdHRlcjogRXZlbnRFbWl0dGVyO1xuICBfZGlzcGF0Y2hlclRva2VuOiBhbnk7XG5cbiAgLy8gU3RvcmVkIHZhbHVlc1xuICBfZGVidWdnZXJJbnN0YW5jZTogP0RlYnVnZ2VySW5zdGFuY2U7XG4gIF9lcnJvcjogP3N0cmluZztcbiAgX3NlcnZpY2VzOiBTZXQ8bnVjbGlkZV9kZWJ1Z2dlciRTZXJ2aWNlPjtcbiAgX2V2YWx1YXRpb25FeHByZXNzaW9uUHJvdmlkZXJzOiBTZXQ8TnVjbGlkZUV2YWx1YXRpb25FeHByZXNzaW9uUHJvdmlkZXI+O1xuICBfcHJvY2Vzc1NvY2tldDogP3N0cmluZztcbiAgX2RlYnVnZ2VyTW9kZTogRGVidWdnZXJNb2RlVHlwZTtcbiAgX29uTG9hZGVyQnJlYWtwb2ludFJlc3VtZTogKCkgPT4gdm9pZDtcbiAgbG9hZGVyQnJlYWtwb2ludFJlc3VtZVByb21pc2U6IFByb21pc2U8dm9pZD47XG5cbiAgY29uc3RydWN0b3IoZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcikge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICAgIHRoaXMuX2V2ZW50RW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9kaXNwYXRjaGVyVG9rZW4gPSB0aGlzLl9kaXNwYXRjaGVyLnJlZ2lzdGVyKHRoaXMuX2hhbmRsZVBheWxvYWQuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLl9kZWJ1Z2dlckluc3RhbmNlID0gbnVsbDtcbiAgICB0aGlzLl9lcnJvciA9IG51bGw7XG4gICAgdGhpcy5fc2VydmljZXMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5fZXZhbHVhdGlvbkV4cHJlc3Npb25Qcm92aWRlcnMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5fcHJvY2Vzc1NvY2tldCA9IG51bGw7XG4gICAgdGhpcy5fZGVidWdnZXJNb2RlID0gRGVidWdnZXJNb2RlLlNUT1BQRUQ7XG4gICAgdGhpcy5sb2FkZXJCcmVha3BvaW50UmVzdW1lUHJvbWlzZSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgdGhpcy5fb25Mb2FkZXJCcmVha3BvaW50UmVzdW1lID0gcmVzb2x2ZTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZXZlbnRFbWl0dGVyLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIudW5yZWdpc3Rlcih0aGlzLl9kaXNwYXRjaGVyVG9rZW4pO1xuICAgIGlmICh0aGlzLl9kZWJ1Z2dlckluc3RhbmNlKSB7XG4gICAgICB0aGlzLl9kZWJ1Z2dlckluc3RhbmNlLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICBsb2FkZXJCcmVha3BvaW50UmVzdW1lZCgpOiB2b2lkIHtcbiAgICB0aGlzLl9vbkxvYWRlckJyZWFrcG9pbnRSZXN1bWUoKTsgLy8gUmVzb2x2ZXMgb25Mb2FkZXJCcmVha3BvaW50UmVzdW1lUHJvbWlzZS5cbiAgfVxuXG4gIGdldERlYnVnZ2VySW5zdGFuY2UoKTogP0RlYnVnZ2VySW5zdGFuY2Uge1xuICAgIHJldHVybiB0aGlzLl9kZWJ1Z2dlckluc3RhbmNlO1xuICB9XG5cbiAgZ2V0RXJyb3IoKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2Vycm9yO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhdHRhY2hhYmxlcy5cbiAgICpcbiAgICogQHBhcmFtIG9wdGlvbmFsIHNlcnZpY2UgbmFtZSAoZS5nLiBsbGRiKSB0byBmaWx0ZXIgcmVzdWx0aW5nIGF0dGFjaGFibGVzLlxuICAgKi9cbiAgZ2V0UHJvY2Vzc0luZm9MaXN0KHNlcnZpY2VOYW1lPzogc3RyaW5nKTogUHJvbWlzZTxBcnJheTxEZWJ1Z2dlclByb2Nlc3NJbmZvVHlwZT4+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICAgIEFycmF5LmZyb20odGhpcy5fc2VydmljZXMpXG4gICAgICAgICAgLm1hcChzZXJ2aWNlID0+IHtcbiAgICAgICAgICAgIGlmICghc2VydmljZU5hbWUgfHwgc2VydmljZS5uYW1lID09PSBzZXJ2aWNlTmFtZSkge1xuICAgICAgICAgICAgICByZXR1cm4gc2VydmljZS5nZXRQcm9jZXNzSW5mb0xpc3QoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pKVxuICAgICAgICAudGhlbih2YWx1ZXMgPT4gW10uY29uY2F0LmFwcGx5KFtdLCB2YWx1ZXMpKTtcbiAgfVxuXG4gIGdldFByb2Nlc3NTb2NrZXQoKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb2Nlc3NTb2NrZXQ7XG4gIH1cblxuICBnZXREZWJ1Z2dlck1vZGUoKTogRGVidWdnZXJNb2RlVHlwZSB7XG4gICAgcmV0dXJuIHRoaXMuX2RlYnVnZ2VyTW9kZTtcbiAgfVxuXG4gIGdldEV2YWx1YXRpb25FeHByZXNzaW9uUHJvdmlkZXJzKCk6IFNldDxOdWNsaWRlRXZhbHVhdGlvbkV4cHJlc3Npb25Qcm92aWRlcj4ge1xuICAgIHJldHVybiB0aGlzLl9ldmFsdWF0aW9uRXhwcmVzc2lvblByb3ZpZGVycztcbiAgfVxuXG4gIG9uQ2hhbmdlKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgY29uc3QgZW1pdHRlciA9IHRoaXMuX2V2ZW50RW1pdHRlcjtcbiAgICB0aGlzLl9ldmVudEVtaXR0ZXIub24oJ2NoYW5nZScsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4gZW1pdHRlci5yZW1vdmVMaXN0ZW5lcignY2hhbmdlJywgY2FsbGJhY2spKTtcbiAgfVxuXG4gIHNldERlYnVnZ2VyTW9kZShuZXdNb2RlOiBEZWJ1Z2dlck1vZGVUeXBlKTogdm9pZCB7XG4gICAgdGhpcy5fZGVidWdnZXJNb2RlID0gbmV3TW9kZTtcbiAgLy8gVXNpbmcgYSBzZXR0ZXIgaXMgbmVjZXNzYXJ5IHRvIGNpcmN1bXZlbnQgdGltaW5nIGlzc3VlcyB3aGVuIHVzaW5nIHRoZSBkaXNwYXRjaGVyLlxuICAgIC8vIFRPRE8gZml4IHVuZGVybHlpbmcgZGlzcGF0Y2hlciB0aW1pbmcgcHJvYmxlbSAmIG1vdmUgdG8gcHJvcGVyIEZsdXggaW1wbGVtZW50YXRpb24uXG4gICAgLy8gdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgLy8gICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5ERUJVR0dFUl9NT0RFX0NIQU5HRSxcbiAgICAvLyAgIGRhdGE6IG5ld01vZGUsXG4gICAgLy8gfSk7XG4gIH1cblxuICBfaGFuZGxlUGF5bG9hZChwYXlsb2FkOiBPYmplY3QpIHtcbiAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uVHlwZSkge1xuICAgICAgY2FzZSBDb25zdGFudHMuQWN0aW9ucy5TRVRfUFJPQ0VTU19TT0NLRVQ6XG4gICAgICAgIHRoaXMuX3Byb2Nlc3NTb2NrZXQgPSBwYXlsb2FkLmRhdGE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBDb25zdGFudHMuQWN0aW9ucy5BRERfU0VSVklDRTpcbiAgICAgICAgaWYgKHRoaXMuX3NlcnZpY2VzLmhhcyhwYXlsb2FkLmRhdGEpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3NlcnZpY2VzLmFkZChwYXlsb2FkLmRhdGEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQ29uc3RhbnRzLkFjdGlvbnMuUkVNT1ZFX1NFUlZJQ0U6XG4gICAgICAgIGlmICghdGhpcy5fc2VydmljZXMuaGFzKHBheWxvYWQuZGF0YSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc2VydmljZXMuZGVsZXRlKHBheWxvYWQuZGF0YSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBDb25zdGFudHMuQWN0aW9ucy5TRVRfRVJST1I6XG4gICAgICAgIHRoaXMuX2Vycm9yID0gcGF5bG9hZC5kYXRhO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQ29uc3RhbnRzLkFjdGlvbnMuU0VUX0RFQlVHR0VSX0lOU1RBTkNFOlxuICAgICAgICB0aGlzLl9kZWJ1Z2dlckluc3RhbmNlID0gcGF5bG9hZC5kYXRhO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQ29uc3RhbnRzLkFjdGlvbnMuREVCVUdHRVJfTU9ERV9DSEFOR0U6XG4gICAgICAgIHRoaXMuX2RlYnVnZ2VyTW9kZSA9IHBheWxvYWQuZGF0YTtcbiAgICAgICAgaWYgKHRoaXMuX2RlYnVnZ2VyTW9kZSA9PT0gRGVidWdnZXJNb2RlLlNUT1BQRUQpIHtcbiAgICAgICAgICB0aGlzLmxvYWRlckJyZWFrcG9pbnRSZXN1bWVQcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9vbkxvYWRlckJyZWFrcG9pbnRSZXN1bWUgPSByZXNvbHZlO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBDb25zdGFudHMuQWN0aW9ucy5BRERfRVZBTFVBVElPTl9FWFBSRVNTSU9OX1BST1ZJREVSOlxuICAgICAgICBpZiAodGhpcy5fZXZhbHVhdGlvbkV4cHJlc3Npb25Qcm92aWRlcnMuaGFzKHBheWxvYWQuZGF0YSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZXZhbHVhdGlvbkV4cHJlc3Npb25Qcm92aWRlcnMuYWRkKHBheWxvYWQuZGF0YSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBDb25zdGFudHMuQWN0aW9ucy5SRU1PVkVfRVZBTFVBVElPTl9FWFBSRVNTSU9OX1BST1ZJREVSOlxuICAgICAgICBpZiAoIXRoaXMuX2V2YWx1YXRpb25FeHByZXNzaW9uUHJvdmlkZXJzLmhhcyhwYXlsb2FkLmRhdGEpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2V2YWx1YXRpb25FeHByZXNzaW9uUHJvdmlkZXJzLmRlbGV0ZShwYXlsb2FkLmRhdGEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fZXZlbnRFbWl0dGVyLmVtaXQoJ2NoYW5nZScpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBEZWJ1Z2dlck1vZGUsXG4gIERlYnVnZ2VyU3RvcmUsXG59O1xuIl19