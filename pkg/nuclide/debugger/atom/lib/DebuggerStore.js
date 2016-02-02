var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Flux style Store holding all data used by the debugger plugin.
 */

var _require = require('atom');

var Disposable = _require.Disposable;

var _require2 = require('events');

var EventEmitter = _require2.EventEmitter;

var Constants = require('./Constants');

var DebuggerStore = (function () {
  function DebuggerStore(dispatcher) {
    _classCallCheck(this, DebuggerStore);

    this._dispatcher = dispatcher;
    this._eventEmitter = new EventEmitter();
    this._dispatcherToken = this._dispatcher.register(this._handlePayload.bind(this));

    this._debuggerProcess = null;
    this._error = null;
    this._services = new Set();
    this._processSocket = null;
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
      return Promise.all(require('../../../commons').array.from(this._services).map(function (service) {
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
    key: 'onChange',
    value: function onChange(callback) {
      var emitter = this._eventEmitter;
      this._eventEmitter.on('change', callback);
      return new Disposable(function () {
        return emitter.removeListener('change', callback);
      });
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
        default:
          return;
      }
      this._eventEmitter.emit('change');
    }
  }]);

  return DebuggerStore;
})();

module.exports = DebuggerStore;

// Stored values
//# sourceMappingURL=data:application/json;base64,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QU07QUFBQSxBQUNSLGFBQUssU0FBUyxDQUFDLE9BQU8sQ0FBQyxXQUFXO0FBQ2hDLGNBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ3BDLG1CQUFPO1dBQ1I7QUFDRCxjQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakMsZ0JBQU07QUFBQSxBQUNSLGFBQUssU0FBUyxDQUFDLE9BQU8sQ0FBQyxjQUFjO0FBQ25DLGNBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDckMsbUJBQU87V0FDUjtBQUNELGNBQUksQ0FBQyxTQUFTLFVBQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEMsZ0JBQU07QUFBQSxBQUNSLGFBQUssU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTO0FBQzlCLGNBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztBQUMzQixnQkFBTTtBQUFBLEFBQ1IsYUFBSyxTQUFTLENBQUMsT0FBTyxDQUFDLG9CQUFvQjtBQUN6QyxjQUFJLENBQUMsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztBQUNyQyxnQkFBTTtBQUFBLEFBQ1I7QUFDRSxpQkFBTztBQUFBLE9BQ1Y7QUFDRCxVQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNuQzs7O1NBN0ZHLGFBQWE7OztBQWdHbkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMiLCJmaWxlIjoiRGVidWdnZXJTdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IHtFdmVudEVtaXR0ZXJ9ID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5jb25zdCBDb25zdGFudHMgPSByZXF1aXJlKCcuL0NvbnN0YW50cycpO1xuXG5pbXBvcnQgdHlwZSB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5pbXBvcnQgdHlwZSB7bnVjbGlkZV9kZWJ1Z2dlciRTZXJ2aWNlfSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL3NlcnZpY2UnO1xuaW1wb3J0IHR5cGUgRGVidWdnZXJJbnN0YW5jZSBmcm9tICcuL0RlYnVnZ2VySW5zdGFuY2UnO1xuaW1wb3J0IHR5cGUgRGVidWdnZXJQcm9jZXNzSW5mb1R5cGUgZnJvbSAnLi9EZWJ1Z2dlclByb2Nlc3NJbmZvJztcblxuLyoqXG4gKiBGbHV4IHN0eWxlIFN0b3JlIGhvbGRpbmcgYWxsIGRhdGEgdXNlZCBieSB0aGUgZGVidWdnZXIgcGx1Z2luLlxuICovXG5jbGFzcyBEZWJ1Z2dlclN0b3JlIHtcbiAgX2Rpc3BhdGNoZXI6IERpc3BhdGNoZXI7XG4gIF9ldmVudEVtaXR0ZXI6IEV2ZW50RW1pdHRlcjtcbiAgX2Rpc3BhdGNoZXJUb2tlbjogYW55O1xuXG4gIC8vIFN0b3JlZCB2YWx1ZXNcbiAgX2RlYnVnZ2VyUHJvY2VzczogP0RlYnVnZ2VySW5zdGFuY2U7XG4gIF9lcnJvcjogP3N0cmluZztcbiAgX3NlcnZpY2VzOiBTZXQ8bnVjbGlkZV9kZWJ1Z2dlciRTZXJ2aWNlPjtcbiAgX3Byb2Nlc3NTb2NrZXQ6ID9zdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcikge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICAgIHRoaXMuX2V2ZW50RW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9kaXNwYXRjaGVyVG9rZW4gPSB0aGlzLl9kaXNwYXRjaGVyLnJlZ2lzdGVyKHRoaXMuX2hhbmRsZVBheWxvYWQuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLl9kZWJ1Z2dlclByb2Nlc3MgPSBudWxsO1xuICAgIHRoaXMuX2Vycm9yID0gbnVsbDtcbiAgICB0aGlzLl9zZXJ2aWNlcyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLl9wcm9jZXNzU29ja2V0ID0gbnVsbDtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZXZlbnRFbWl0dGVyLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIudW5yZWdpc3Rlcih0aGlzLl9kaXNwYXRjaGVyVG9rZW4pO1xuICAgIGlmICh0aGlzLl9kZWJ1Z2dlclByb2Nlc3MpIHtcbiAgICAgIHRoaXMuX2RlYnVnZ2VyUHJvY2Vzcy5kaXNwb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0RGVidWdnZXJQcm9jZXNzKCk6ID9EZWJ1Z2dlckluc3RhbmNlIHtcbiAgICByZXR1cm4gdGhpcy5fZGVidWdnZXJQcm9jZXNzO1xuICB9XG5cbiAgZ2V0RXJyb3IoKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2Vycm9yO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhdHRhY2hhYmxlcy5cbiAgICpcbiAgICogQHBhcmFtIG9wdGlvbmFsIHNlcnZpY2UgbmFtZSAoZS5nLiBsbGRiKSB0byBmaWx0ZXIgcmVzdWx0aW5nIGF0dGFjaGFibGVzLlxuICAgKi9cbiAgZ2V0UHJvY2Vzc0luZm9MaXN0KHNlcnZpY2VOYW1lPzogc3RyaW5nKTogUHJvbWlzZTxBcnJheTxEZWJ1Z2dlclByb2Nlc3NJbmZvVHlwZT4+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICAgIHJlcXVpcmUoJy4uLy4uLy4uL2NvbW1vbnMnKS5hcnJheS5mcm9tKHRoaXMuX3NlcnZpY2VzKVxuICAgICAgICAgIC5tYXAoc2VydmljZSA9PiB7XG4gICAgICAgICAgICBpZiAoIXNlcnZpY2VOYW1lIHx8IHNlcnZpY2UubmFtZSA9PT0gc2VydmljZU5hbWUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNlcnZpY2UuZ2V0UHJvY2Vzc0luZm9MaXN0KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSlcbiAgICAgICAgLnRoZW4odmFsdWVzID0+IFtdLmNvbmNhdC5hcHBseShbXSwgdmFsdWVzKSk7XG4gIH1cblxuICBnZXRQcm9jZXNzU29ja2V0KCk6ID9zdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9wcm9jZXNzU29ja2V0O1xuICB9XG5cbiAgb25DaGFuZ2UoY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICBjb25zdCBlbWl0dGVyID0gdGhpcy5fZXZlbnRFbWl0dGVyO1xuICAgIHRoaXMuX2V2ZW50RW1pdHRlci5vbignY2hhbmdlJywgY2FsbGJhY2spO1xuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiBlbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCdjaGFuZ2UnLCBjYWxsYmFjaykpO1xuICB9XG5cbiAgX2hhbmRsZVBheWxvYWQocGF5bG9hZDogT2JqZWN0KSB7XG4gICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvblR5cGUpIHtcbiAgICAgIGNhc2UgQ29uc3RhbnRzLkFjdGlvbnMuU0VUX1BST0NFU1NfU09DS0VUOlxuICAgICAgICB0aGlzLl9wcm9jZXNzU29ja2V0ID0gcGF5bG9hZC5kYXRhO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQ29uc3RhbnRzLkFjdGlvbnMuQUREX1NFUlZJQ0U6XG4gICAgICAgIGlmICh0aGlzLl9zZXJ2aWNlcy5oYXMocGF5bG9hZC5kYXRhKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zZXJ2aWNlcy5hZGQocGF5bG9hZC5kYXRhKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIENvbnN0YW50cy5BY3Rpb25zLlJFTU9WRV9TRVJWSUNFOlxuICAgICAgICBpZiAoIXRoaXMuX3NlcnZpY2VzLmhhcyhwYXlsb2FkLmRhdGEpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3NlcnZpY2VzLmRlbGV0ZShwYXlsb2FkLmRhdGEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQ29uc3RhbnRzLkFjdGlvbnMuU0VUX0VSUk9SOlxuICAgICAgICB0aGlzLl9lcnJvciA9IHBheWxvYWQuZGF0YTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIENvbnN0YW50cy5BY3Rpb25zLlNFVF9ERUJVR0dFUl9QUk9DRVNTOlxuICAgICAgICB0aGlzLl9kZWJ1Z2dlclByb2Nlc3MgPSBwYXlsb2FkLmRhdGE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9ldmVudEVtaXR0ZXIuZW1pdCgnY2hhbmdlJyk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEZWJ1Z2dlclN0b3JlO1xuIl19