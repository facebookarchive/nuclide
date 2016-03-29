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
    _classCallCheck(this, DebuggerStore);

    this._dispatcher = dispatcher;
    this._eventEmitter = new EventEmitter();
    this._dispatcherToken = this._dispatcher.register(this._handlePayload.bind(this));

    this._debuggerProcess = null;
    this._error = null;
    this._services = new Set();
    this._evaluationExpressionProviders = new Set();
    this._processSocket = null;
    this._debuggerMode = DebuggerMode.STOPPED;
  }

  _createClass(DebuggerStore, [{
    key: 'dispose',
    value: function dispose() {
      this._eventEmitter.removeAllListeners();
      this._dispatcher.unregister(this._dispatcherToken);
      if (this._debuggerProcess) {
        this._debuggerProcess.dispose();
      }
    }
  }, {
    key: 'getDebuggerProcess',
    value: function getDebuggerProcess() {
      return this._debuggerProcess;
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
      return Promise.all(require('../../nuclide-commons').array.from(this._services).map(function (service) {
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
        case Constants.Actions.SET_DEBUGGER_PROCESS:
          this._debuggerProcess = payload.data;
          break;
        case Constants.Actions.DEBUGGER_MODE_CHANGE:
          this._debuggerMode = payload.data;
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
//# sourceMappingURL=data:application/json;base64,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QUMsSUFBSSxDQUFDO0FBQzNCLGdCQUFNO0FBQUEsQUFDUixhQUFLLFNBQVMsQ0FBQyxPQUFPLENBQUMsb0JBQW9CO0FBQ3pDLGNBQUksQ0FBQyxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO0FBQ3JDLGdCQUFNO0FBQUEsQUFDUixhQUFLLFNBQVMsQ0FBQyxPQUFPLENBQUMsb0JBQW9CO0FBQ3pDLGNBQUksQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztBQUNsQyxnQkFBTTtBQUFBLEFBQ1IsYUFBSyxTQUFTLENBQUMsT0FBTyxDQUFDLGtDQUFrQztBQUN2RCxjQUFJLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ3pELG1CQUFPO1dBQ1I7QUFDRCxjQUFJLENBQUMsOEJBQThCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0RCxnQkFBTTtBQUFBLEFBQ1IsYUFBSyxTQUFTLENBQUMsT0FBTyxDQUFDLHFDQUFxQztBQUMxRCxjQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDMUQsbUJBQU87V0FDUjtBQUNELGNBQUksQ0FBQyw4QkFBOEIsVUFBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6RCxnQkFBTTtBQUFBLEFBQ1I7QUFDRSxpQkFBTztBQUFBLE9BQ1Y7QUFDRCxVQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNuQzs7O1NBbElHLGFBQWE7OztBQXFJbkIsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLGNBQVksRUFBWixZQUFZO0FBQ1osZUFBYSxFQUFiLGFBQWE7Q0FDZCxDQUFDIiwiZmlsZSI6IkRlYnVnZ2VyU3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7RGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCB7RXZlbnRFbWl0dGVyfSA9IHJlcXVpcmUoJ2V2ZW50cycpO1xuY29uc3QgQ29uc3RhbnRzID0gcmVxdWlyZSgnLi9Db25zdGFudHMnKTtcblxuaW1wb3J0IHR5cGUge0Rpc3BhdGNoZXJ9IGZyb20gJ2ZsdXgnO1xuaW1wb3J0IHR5cGUge1xuICBudWNsaWRlX2RlYnVnZ2VyJFNlcnZpY2UsXG4gIE51Y2xpZGVFdmFsdWF0aW9uRXhwcmVzc2lvblByb3ZpZGVyLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWludGVyZmFjZXMvc2VydmljZSc7XG5pbXBvcnQgdHlwZSBEZWJ1Z2dlckluc3RhbmNlIGZyb20gJy4vRGVidWdnZXJJbnN0YW5jZSc7XG5pbXBvcnQgdHlwZSBEZWJ1Z2dlclByb2Nlc3NJbmZvVHlwZSBmcm9tICcuL0RlYnVnZ2VyUHJvY2Vzc0luZm8nO1xuXG50eXBlIERlYnVnZ2VyTW9kZVR5cGUgPSAnc3RhcnRpbmcnIHwgJ3J1bm5pbmcnIHwgJ3BhdXNlZCcgfCAnc3RvcHBpbmcnIHwgJ3N0b3BwZWQnO1xuY29uc3QgRGVidWdnZXJNb2RlOiB7W2tleTogc3RyaW5nXTogRGVidWdnZXJNb2RlVHlwZX0gPSBPYmplY3QuZnJlZXplKHtcbiAgU1RBUlRJTkc6ICdzdGFydGluZycsXG4gIFJVTk5JTkc6ICdydW5uaW5nJyxcbiAgUEFVU0VEOiAncGF1c2VkJyxcbiAgU1RPUFBJTkc6ICdzdG9wcGluZycsXG4gIFNUT1BQRUQ6ICdzdG9wcGVkJyxcbn0pO1xuXG4vKipcbiAqIEZsdXggc3R5bGUgU3RvcmUgaG9sZGluZyBhbGwgZGF0YSB1c2VkIGJ5IHRoZSBkZWJ1Z2dlciBwbHVnaW4uXG4gKi9cbmNsYXNzIERlYnVnZ2VyU3RvcmUge1xuICBfZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcbiAgX2V2ZW50RW1pdHRlcjogRXZlbnRFbWl0dGVyO1xuICBfZGlzcGF0Y2hlclRva2VuOiBhbnk7XG5cbiAgLy8gU3RvcmVkIHZhbHVlc1xuICBfZGVidWdnZXJQcm9jZXNzOiA/RGVidWdnZXJJbnN0YW5jZTtcbiAgX2Vycm9yOiA/c3RyaW5nO1xuICBfc2VydmljZXM6IFNldDxudWNsaWRlX2RlYnVnZ2VyJFNlcnZpY2U+O1xuICBfZXZhbHVhdGlvbkV4cHJlc3Npb25Qcm92aWRlcnM6IFNldDxOdWNsaWRlRXZhbHVhdGlvbkV4cHJlc3Npb25Qcm92aWRlcj47XG4gIF9wcm9jZXNzU29ja2V0OiA/c3RyaW5nO1xuICBfZGVidWdnZXJNb2RlOiBEZWJ1Z2dlck1vZGVUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKGRpc3BhdGNoZXI6IERpc3BhdGNoZXIpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcbiAgICB0aGlzLl9ldmVudEVtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5fZGlzcGF0Y2hlclRva2VuID0gdGhpcy5fZGlzcGF0Y2hlci5yZWdpc3Rlcih0aGlzLl9oYW5kbGVQYXlsb2FkLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5fZGVidWdnZXJQcm9jZXNzID0gbnVsbDtcbiAgICB0aGlzLl9lcnJvciA9IG51bGw7XG4gICAgdGhpcy5fc2VydmljZXMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5fZXZhbHVhdGlvbkV4cHJlc3Npb25Qcm92aWRlcnMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5fcHJvY2Vzc1NvY2tldCA9IG51bGw7XG4gICAgdGhpcy5fZGVidWdnZXJNb2RlID0gRGVidWdnZXJNb2RlLlNUT1BQRUQ7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2V2ZW50RW1pdHRlci5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLnVucmVnaXN0ZXIodGhpcy5fZGlzcGF0Y2hlclRva2VuKTtcbiAgICBpZiAodGhpcy5fZGVidWdnZXJQcm9jZXNzKSB7XG4gICAgICB0aGlzLl9kZWJ1Z2dlclByb2Nlc3MuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIGdldERlYnVnZ2VyUHJvY2VzcygpOiA/RGVidWdnZXJJbnN0YW5jZSB7XG4gICAgcmV0dXJuIHRoaXMuX2RlYnVnZ2VyUHJvY2VzcztcbiAgfVxuXG4gIGdldEVycm9yKCk6ID9zdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9lcnJvcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYXR0YWNoYWJsZXMuXG4gICAqXG4gICAqIEBwYXJhbSBvcHRpb25hbCBzZXJ2aWNlIG5hbWUgKGUuZy4gbGxkYikgdG8gZmlsdGVyIHJlc3VsdGluZyBhdHRhY2hhYmxlcy5cbiAgICovXG4gIGdldFByb2Nlc3NJbmZvTGlzdChzZXJ2aWNlTmFtZT86IHN0cmluZyk6IFByb21pc2U8QXJyYXk8RGVidWdnZXJQcm9jZXNzSW5mb1R5cGU+PiB7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKFxuICAgICAgICByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNvbW1vbnMnKS5hcnJheS5mcm9tKHRoaXMuX3NlcnZpY2VzKVxuICAgICAgICAgIC5tYXAoc2VydmljZSA9PiB7XG4gICAgICAgICAgICBpZiAoIXNlcnZpY2VOYW1lIHx8IHNlcnZpY2UubmFtZSA9PT0gc2VydmljZU5hbWUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNlcnZpY2UuZ2V0UHJvY2Vzc0luZm9MaXN0KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSlcbiAgICAgICAgLnRoZW4odmFsdWVzID0+IFtdLmNvbmNhdC5hcHBseShbXSwgdmFsdWVzKSk7XG4gIH1cblxuICBnZXRQcm9jZXNzU29ja2V0KCk6ID9zdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9wcm9jZXNzU29ja2V0O1xuICB9XG5cbiAgZ2V0RGVidWdnZXJNb2RlKCk6IERlYnVnZ2VyTW9kZVR5cGUge1xuICAgIHJldHVybiB0aGlzLl9kZWJ1Z2dlck1vZGU7XG4gIH1cblxuICBnZXRFdmFsdWF0aW9uRXhwcmVzc2lvblByb3ZpZGVycygpOiBTZXQ8TnVjbGlkZUV2YWx1YXRpb25FeHByZXNzaW9uUHJvdmlkZXI+IHtcbiAgICByZXR1cm4gdGhpcy5fZXZhbHVhdGlvbkV4cHJlc3Npb25Qcm92aWRlcnM7XG4gIH1cblxuICBvbkNoYW5nZShjYWxsYmFjazogKCkgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIGNvbnN0IGVtaXR0ZXIgPSB0aGlzLl9ldmVudEVtaXR0ZXI7XG4gICAgdGhpcy5fZXZlbnRFbWl0dGVyLm9uKCdjaGFuZ2UnLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoJ2NoYW5nZScsIGNhbGxiYWNrKSk7XG4gIH1cblxuICBzZXREZWJ1Z2dlck1vZGUobmV3TW9kZTogRGVidWdnZXJNb2RlVHlwZSk6IHZvaWQge1xuICAgIHRoaXMuX2RlYnVnZ2VyTW9kZSA9IG5ld01vZGU7XG4gIC8vIFVzaW5nIGEgc2V0dGVyIGlzIG5lY2Vzc2FyeSB0byBjaXJjdW12ZW50IHRpbWluZyBpc3N1ZXMgd2hlbiB1c2luZyB0aGUgZGlzcGF0Y2hlci5cbiAgICAvLyBUT0RPIGZpeCB1bmRlcmx5aW5nIGRpc3BhdGNoZXIgdGltaW5nIHByb2JsZW0gJiBtb3ZlIHRvIHByb3BlciBGbHV4IGltcGxlbWVudGF0aW9uLlxuICAgIC8vIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgIC8vICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuREVCVUdHRVJfTU9ERV9DSEFOR0UsXG4gICAgLy8gICBkYXRhOiBuZXdNb2RlLFxuICAgIC8vIH0pO1xuICB9XG5cbiAgX2hhbmRsZVBheWxvYWQocGF5bG9hZDogT2JqZWN0KSB7XG4gICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvblR5cGUpIHtcbiAgICAgIGNhc2UgQ29uc3RhbnRzLkFjdGlvbnMuU0VUX1BST0NFU1NfU09DS0VUOlxuICAgICAgICB0aGlzLl9wcm9jZXNzU29ja2V0ID0gcGF5bG9hZC5kYXRhO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQ29uc3RhbnRzLkFjdGlvbnMuQUREX1NFUlZJQ0U6XG4gICAgICAgIGlmICh0aGlzLl9zZXJ2aWNlcy5oYXMocGF5bG9hZC5kYXRhKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zZXJ2aWNlcy5hZGQocGF5bG9hZC5kYXRhKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIENvbnN0YW50cy5BY3Rpb25zLlJFTU9WRV9TRVJWSUNFOlxuICAgICAgICBpZiAoIXRoaXMuX3NlcnZpY2VzLmhhcyhwYXlsb2FkLmRhdGEpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3NlcnZpY2VzLmRlbGV0ZShwYXlsb2FkLmRhdGEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQ29uc3RhbnRzLkFjdGlvbnMuU0VUX0VSUk9SOlxuICAgICAgICB0aGlzLl9lcnJvciA9IHBheWxvYWQuZGF0YTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIENvbnN0YW50cy5BY3Rpb25zLlNFVF9ERUJVR0dFUl9QUk9DRVNTOlxuICAgICAgICB0aGlzLl9kZWJ1Z2dlclByb2Nlc3MgPSBwYXlsb2FkLmRhdGE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBDb25zdGFudHMuQWN0aW9ucy5ERUJVR0dFUl9NT0RFX0NIQU5HRTpcbiAgICAgICAgdGhpcy5fZGVidWdnZXJNb2RlID0gcGF5bG9hZC5kYXRhO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQ29uc3RhbnRzLkFjdGlvbnMuQUREX0VWQUxVQVRJT05fRVhQUkVTU0lPTl9QUk9WSURFUjpcbiAgICAgICAgaWYgKHRoaXMuX2V2YWx1YXRpb25FeHByZXNzaW9uUHJvdmlkZXJzLmhhcyhwYXlsb2FkLmRhdGEpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2V2YWx1YXRpb25FeHByZXNzaW9uUHJvdmlkZXJzLmFkZChwYXlsb2FkLmRhdGEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQ29uc3RhbnRzLkFjdGlvbnMuUkVNT1ZFX0VWQUxVQVRJT05fRVhQUkVTU0lPTl9QUk9WSURFUjpcbiAgICAgICAgaWYgKCF0aGlzLl9ldmFsdWF0aW9uRXhwcmVzc2lvblByb3ZpZGVycy5oYXMocGF5bG9hZC5kYXRhKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9ldmFsdWF0aW9uRXhwcmVzc2lvblByb3ZpZGVycy5kZWxldGUocGF5bG9hZC5kYXRhKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2V2ZW50RW1pdHRlci5lbWl0KCdjaGFuZ2UnKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgRGVidWdnZXJNb2RlLFxuICBEZWJ1Z2dlclN0b3JlLFxufTtcbiJdfQ==