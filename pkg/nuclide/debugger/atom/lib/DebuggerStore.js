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
//# sourceMappingURL=data:application/json;base64,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QU07QUFBQSxBQUNSLGFBQUssU0FBUyxDQUFDLE9BQU8sQ0FBQyxXQUFXO0FBQ2hDLGNBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ3BDLG1CQUFPO1dBQ1I7QUFDRCxjQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakMsZ0JBQU07QUFBQSxBQUNSLGFBQUssU0FBUyxDQUFDLE9BQU8sQ0FBQyxjQUFjO0FBQ25DLGNBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDckMsbUJBQU87V0FDUjtBQUNELGNBQUksQ0FBQyxTQUFTLFVBQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEMsZ0JBQU07QUFBQSxBQUNSLGFBQUssU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTO0FBQzlCLGNBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztBQUMzQixnQkFBTTtBQUFBLEFBQ1IsYUFBSyxTQUFTLENBQUMsT0FBTyxDQUFDLG9CQUFvQjtBQUN6QyxjQUFJLENBQUMsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztBQUNyQyxnQkFBTTtBQUFBLEFBQ1I7QUFDRSxpQkFBTztBQUFBLE9BQ1Y7QUFDRCxVQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNuQzs7O1NBN0ZHLGFBQWE7OztBQWdHbkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMiLCJmaWxlIjoiRGVidWdnZXJTdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IHtFdmVudEVtaXR0ZXJ9ID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5jb25zdCBDb25zdGFudHMgPSByZXF1aXJlKCcuL0NvbnN0YW50cycpO1xuXG5pbXBvcnQgdHlwZSB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5pbXBvcnQgdHlwZSB7XG4gIG51Y2xpZGVfZGVidWdnZXIkRGVidWdnZXJJbnN0YW5jZSxcbiAgbnVjbGlkZV9kZWJ1Z2dlciRTZXJ2aWNlLFxufSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL3NlcnZpY2UnO1xuaW1wb3J0IHR5cGUgRGVidWdnZXJQcm9jZXNzSW5mb1R5cGUgZnJvbSAnLi9EZWJ1Z2dlclByb2Nlc3NJbmZvJztcblxuLyoqXG4gKiBGbHV4IHN0eWxlIFN0b3JlIGhvbGRpbmcgYWxsIGRhdGEgdXNlZCBieSB0aGUgZGVidWdnZXIgcGx1Z2luLlxuICovXG5jbGFzcyBEZWJ1Z2dlclN0b3JlIHtcbiAgX2Rpc3BhdGNoZXI6IERpc3BhdGNoZXI7XG4gIF9ldmVudEVtaXR0ZXI6IEV2ZW50RW1pdHRlcjtcbiAgX2Rpc3BhdGNoZXJUb2tlbjogYW55O1xuXG4gIC8vIFN0b3JlZCB2YWx1ZXNcbiAgX2RlYnVnZ2VyUHJvY2VzczogP251Y2xpZGVfZGVidWdnZXIkRGVidWdnZXJJbnN0YW5jZTtcbiAgX2Vycm9yOiA/c3RyaW5nO1xuICBfc2VydmljZXM6IFNldDxudWNsaWRlX2RlYnVnZ2VyJFNlcnZpY2U+O1xuICBfcHJvY2Vzc1NvY2tldDogP3N0cmluZztcblxuICBjb25zdHJ1Y3RvcihkaXNwYXRjaGVyOiBEaXNwYXRjaGVyKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgdGhpcy5fZXZlbnRFbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXJUb2tlbiA9IHRoaXMuX2Rpc3BhdGNoZXIucmVnaXN0ZXIodGhpcy5faGFuZGxlUGF5bG9hZC5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuX2RlYnVnZ2VyUHJvY2VzcyA9IG51bGw7XG4gICAgdGhpcy5fZXJyb3IgPSBudWxsO1xuICAgIHRoaXMuX3NlcnZpY2VzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX3Byb2Nlc3NTb2NrZXQgPSBudWxsO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9ldmVudEVtaXR0ZXIucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci51bnJlZ2lzdGVyKHRoaXMuX2Rpc3BhdGNoZXJUb2tlbik7XG4gICAgaWYgKHRoaXMuX2RlYnVnZ2VyUHJvY2Vzcykge1xuICAgICAgdGhpcy5fZGVidWdnZXJQcm9jZXNzLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICBnZXREZWJ1Z2dlclByb2Nlc3MoKTogP251Y2xpZGVfZGVidWdnZXIkRGVidWdnZXJJbnN0YW5jZSB7XG4gICAgcmV0dXJuIHRoaXMuX2RlYnVnZ2VyUHJvY2VzcztcbiAgfVxuXG4gIGdldEVycm9yKCk6ID9zdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9lcnJvcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYXR0YWNoYWJsZXMuXG4gICAqXG4gICAqIEBwYXJhbSBvcHRpb25hbCBzZXJ2aWNlIG5hbWUgKGUuZy4gbGxkYikgdG8gZmlsdGVyIHJlc3VsdGluZyBhdHRhY2hhYmxlcy5cbiAgICovXG4gIGdldFByb2Nlc3NJbmZvTGlzdChzZXJ2aWNlTmFtZT86IHN0cmluZyk6IFByb21pc2U8QXJyYXk8RGVidWdnZXJQcm9jZXNzSW5mb1R5cGU+PiB7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKFxuICAgICAgICByZXF1aXJlKCcuLi8uLi8uLi9jb21tb25zJykuYXJyYXkuZnJvbSh0aGlzLl9zZXJ2aWNlcylcbiAgICAgICAgICAubWFwKHNlcnZpY2UgPT4ge1xuICAgICAgICAgICAgaWYgKCFzZXJ2aWNlTmFtZSB8fCBzZXJ2aWNlLm5hbWUgPT09IHNlcnZpY2VOYW1lKSB7XG4gICAgICAgICAgICAgIHJldHVybiBzZXJ2aWNlLmdldFByb2Nlc3NJbmZvTGlzdCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSkpXG4gICAgICAgIC50aGVuKHZhbHVlcyA9PiBbXS5jb25jYXQuYXBwbHkoW10sIHZhbHVlcykpO1xuICB9XG5cbiAgZ2V0UHJvY2Vzc1NvY2tldCgpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvY2Vzc1NvY2tldDtcbiAgfVxuXG4gIG9uQ2hhbmdlKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgY29uc3QgZW1pdHRlciA9IHRoaXMuX2V2ZW50RW1pdHRlcjtcbiAgICB0aGlzLl9ldmVudEVtaXR0ZXIub24oJ2NoYW5nZScsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4gZW1pdHRlci5yZW1vdmVMaXN0ZW5lcignY2hhbmdlJywgY2FsbGJhY2spKTtcbiAgfVxuXG4gIF9oYW5kbGVQYXlsb2FkKHBheWxvYWQ6IE9iamVjdCkge1xuICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb25UeXBlKSB7XG4gICAgICBjYXNlIENvbnN0YW50cy5BY3Rpb25zLlNFVF9QUk9DRVNTX1NPQ0tFVDpcbiAgICAgICAgdGhpcy5fcHJvY2Vzc1NvY2tldCA9IHBheWxvYWQuZGF0YTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIENvbnN0YW50cy5BY3Rpb25zLkFERF9TRVJWSUNFOlxuICAgICAgICBpZiAodGhpcy5fc2VydmljZXMuaGFzKHBheWxvYWQuZGF0YSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc2VydmljZXMuYWRkKHBheWxvYWQuZGF0YSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBDb25zdGFudHMuQWN0aW9ucy5SRU1PVkVfU0VSVklDRTpcbiAgICAgICAgaWYgKCF0aGlzLl9zZXJ2aWNlcy5oYXMocGF5bG9hZC5kYXRhKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zZXJ2aWNlcy5kZWxldGUocGF5bG9hZC5kYXRhKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIENvbnN0YW50cy5BY3Rpb25zLlNFVF9FUlJPUjpcbiAgICAgICAgdGhpcy5fZXJyb3IgPSBwYXlsb2FkLmRhdGE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBDb25zdGFudHMuQWN0aW9ucy5TRVRfREVCVUdHRVJfUFJPQ0VTUzpcbiAgICAgICAgdGhpcy5fZGVidWdnZXJQcm9jZXNzID0gcGF5bG9hZC5kYXRhO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fZXZlbnRFbWl0dGVyLmVtaXQoJ2NoYW5nZScpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGVidWdnZXJTdG9yZTtcbiJdfQ==