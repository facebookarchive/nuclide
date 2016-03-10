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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _Constants = require('./Constants');

var _Constants2 = _interopRequireDefault(_Constants);

var _events = require('events');

var CONNECTIONS_UPDATED_EVENT = 'CONNECTIONS_UPDATED_EVENT';

/**
 * Flux style store holding all data related to debugger provider.
 */

var DebuggerProviderStore = (function () {
  function DebuggerProviderStore(dispatcher, debuggerActions) {
    _classCallCheck(this, DebuggerProviderStore);

    this._dispatcher = dispatcher;
    this._disposables = new _atom.CompositeDisposable(this._registerDispatcherEvents(), this._listenForProjectChange());
    this._debuggerActions = debuggerActions;
    this._eventEmitter = new _events.EventEmitter();
    this._debuggerProviders = new Set();
    this._connections = [];
  }

  _createClass(DebuggerProviderStore, [{
    key: '_registerDispatcherEvents',
    value: function _registerDispatcherEvents() {
      var _this = this;

      var dispatcherToken = this._dispatcher.register(this._handlePayload.bind(this));
      return new _atom.Disposable(function () {
        return _this._dispatcher.unregister(dispatcherToken);
      });
    }
  }, {
    key: '_listenForProjectChange',
    value: function _listenForProjectChange() {
      var _this2 = this;

      return atom.project.onDidChangePaths(function () {
        _this2._debuggerActions.updateConnections();
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }

    /**
     * Subscribe to new connection updates from DebuggerActions.
     */
  }, {
    key: 'onConnectionsUpdated',
    value: function onConnectionsUpdated(callback) {
      var emitter = this._eventEmitter;
      this._eventEmitter.on(CONNECTIONS_UPDATED_EVENT, callback);
      return new _atom.Disposable(function () {
        return emitter.removeListener(CONNECTIONS_UPDATED_EVENT, callback);
      });
    }
  }, {
    key: 'getConnections',
    value: function getConnections() {
      return this._connections;
    }

    /**
     * Return available launch/attach provider for input connection.
     * Caller is responsible for disposing the results.
     */
  }, {
    key: 'getLaunchAttachProvidersForConnection',
    value: function getLaunchAttachProvidersForConnection(connection) {
      var availableLaunchAttachProviders = [];
      for (var provider of this._debuggerProviders) {
        var launchAttachProvider = provider.getLaunchAttachProvider(connection);
        if (launchAttachProvider != null) {
          availableLaunchAttachProviders.push(launchAttachProvider);
        }
      }
      return availableLaunchAttachProviders;
    }
  }, {
    key: '_handlePayload',
    value: function _handlePayload(payload) {
      switch (payload.actionType) {
        case _Constants2['default'].Actions.ADD_DEBUGGER_PROVIDER:
          if (this._debuggerProviders.has(payload.data)) {
            return;
          }
          this._debuggerProviders.add(payload.data);
          break;
        case _Constants2['default'].Actions.REMOVE_DEBUGGER_PROVIDER:
          if (!this._debuggerProviders.has(payload.data)) {
            return;
          }
          this._debuggerProviders['delete'](payload.data);
          break;
        case _Constants2['default'].Actions.UPDATE_CONNECTIONS:
          this._connections = payload.data;
          this._eventEmitter.emit(CONNECTIONS_UPDATED_EVENT);
          break;
      }
    }
  }]);

  return DebuggerProviderStore;
})();

exports.DebuggerProviderStore = DebuggerProviderStore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyUHJvdmlkZXJTdG9yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBa0I4QyxNQUFNOzt5QkFDOUIsYUFBYTs7OztzQkFDUixRQUFROztBQUVuQyxJQUFNLHlCQUF5QixHQUFHLDJCQUEyQixDQUFDOzs7Ozs7SUFLakQscUJBQXFCO0FBUXJCLFdBUkEscUJBQXFCLENBUXBCLFVBQXNCLEVBQUUsZUFBZ0MsRUFBRTswQkFSM0QscUJBQXFCOztBQVM5QixRQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztBQUM5QixRQUFJLENBQUMsWUFBWSxHQUFHLDhCQUNsQixJQUFJLENBQUMseUJBQXlCLEVBQUUsRUFDaEMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQy9CLENBQUM7QUFDRixRQUFJLENBQUMsZ0JBQWdCLEdBQUcsZUFBZSxDQUFDO0FBQ3hDLFFBQUksQ0FBQyxhQUFhLEdBQUcsMEJBQWtCLENBQUM7QUFDeEMsUUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDcEMsUUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7R0FDeEI7O2VBbEJVLHFCQUFxQjs7V0FvQlAscUNBQWdCOzs7QUFDdkMsVUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNsRixhQUFPLHFCQUFlO2VBQU0sTUFBSyxXQUFXLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQztPQUFBLENBQUMsQ0FBQztLQUMzRTs7O1dBRXNCLG1DQUFnQjs7O0FBQ3JDLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFNO0FBQ3pDLGVBQUssZ0JBQWdCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztPQUMzQyxDQUFDLENBQUM7S0FDSjs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7Ozs7O1dBS21CLDhCQUFDLFFBQW9CLEVBQWU7QUFDdEQsVUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztBQUNuQyxVQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyx5QkFBeUIsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUMzRCxhQUFPLHFCQUFlO2VBQU0sT0FBTyxDQUFDLGNBQWMsQ0FBQyx5QkFBeUIsRUFBRSxRQUFRLENBQUM7T0FBQSxDQUFDLENBQUM7S0FDMUY7OztXQUVhLDBCQUFrQjtBQUM5QixhQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7S0FDMUI7Ozs7Ozs7O1dBTW9DLCtDQUFDLFVBQWtCLEVBQXVDO0FBQzdGLFVBQU0sOEJBQThCLEdBQUcsRUFBRSxDQUFDO0FBQzFDLFdBQUssSUFBTSxRQUFRLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO0FBQzlDLFlBQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzFFLFlBQUksb0JBQW9CLElBQUksSUFBSSxFQUFFO0FBQ2hDLHdDQUE4QixDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1NBQzNEO09BQ0Y7QUFDRCxhQUFPLDhCQUE4QixDQUFDO0tBQ3ZDOzs7V0FFYSx3QkFBQyxPQUFlLEVBQUU7QUFDOUIsY0FBUSxPQUFPLENBQUMsVUFBVTtBQUN4QixhQUFLLHVCQUFVLE9BQU8sQ0FBQyxxQkFBcUI7QUFDMUMsY0FBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUM3QyxtQkFBTztXQUNSO0FBQ0QsY0FBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUMsZ0JBQU07QUFBQSxBQUNSLGFBQUssdUJBQVUsT0FBTyxDQUFDLHdCQUF3QjtBQUM3QyxjQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDOUMsbUJBQU87V0FDUjtBQUNELGNBQUksQ0FBQyxrQkFBa0IsVUFBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QyxnQkFBTTtBQUFBLEFBQ1IsYUFBSyx1QkFBVSxPQUFPLENBQUMsa0JBQWtCO0FBQ3ZDLGNBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztBQUNqQyxjQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQ25ELGdCQUFNO0FBQUEsT0FDVDtLQUNGOzs7U0FsRlUscUJBQXFCIiwiZmlsZSI6IkRlYnVnZ2VyUHJvdmlkZXJTdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtEaXNwYXRjaGVyfSBmcm9tICdmbHV4JztcbmltcG9ydCB0eXBlIERlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXIgZnJvbSAnLi9EZWJ1Z2dlckxhdW5jaEF0dGFjaFByb3ZpZGVyJztcbmltcG9ydCB0eXBlIHtcbiAgTnVjbGlkZURlYnVnZ2VyUHJvdmlkZXIsXG59IGZyb20gJy4uLy4uL2ludGVyZmFjZXMvc2VydmljZSc7XG5pbXBvcnQgdHlwZSBEZWJ1Z2dlckFjdGlvbnMgZnJvbSAnLi9EZWJ1Z2dlckFjdGlvbnMnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IENvbnN0YW50cyBmcm9tICcuL0NvbnN0YW50cyc7XG5pbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcblxuY29uc3QgQ09OTkVDVElPTlNfVVBEQVRFRF9FVkVOVCA9ICdDT05ORUNUSU9OU19VUERBVEVEX0VWRU5UJztcblxuLyoqXG4gKiBGbHV4IHN0eWxlIHN0b3JlIGhvbGRpbmcgYWxsIGRhdGEgcmVsYXRlZCB0byBkZWJ1Z2dlciBwcm92aWRlci5cbiAqL1xuZXhwb3J0IGNsYXNzIERlYnVnZ2VyUHJvdmlkZXJTdG9yZSB7XG4gIF9kaXNwYXRjaGVyOiBEaXNwYXRjaGVyO1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9kZWJ1Z2dlckFjdGlvbnM6IERlYnVnZ2VyQWN0aW9ucztcbiAgX2V2ZW50RW1pdHRlcjogRXZlbnRFbWl0dGVyO1xuICBfZGVidWdnZXJQcm92aWRlcnM6IFNldDxOdWNsaWRlRGVidWdnZXJQcm92aWRlcj47XG4gIF9jb25uZWN0aW9uczogQXJyYXk8c3RyaW5nPjtcblxuICBjb25zdHJ1Y3RvcihkaXNwYXRjaGVyOiBEaXNwYXRjaGVyLCBkZWJ1Z2dlckFjdGlvbnM6IERlYnVnZ2VyQWN0aW9ucykge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICB0aGlzLl9yZWdpc3RlckRpc3BhdGNoZXJFdmVudHMoKSxcbiAgICAgIHRoaXMuX2xpc3RlbkZvclByb2plY3RDaGFuZ2UoKSxcbiAgICApO1xuICAgIHRoaXMuX2RlYnVnZ2VyQWN0aW9ucyA9IGRlYnVnZ2VyQWN0aW9ucztcbiAgICB0aGlzLl9ldmVudEVtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5fZGVidWdnZXJQcm92aWRlcnMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5fY29ubmVjdGlvbnMgPSBbXTtcbiAgfVxuXG4gIF9yZWdpc3RlckRpc3BhdGNoZXJFdmVudHMoKTogSURpc3Bvc2FibGUge1xuICAgIGNvbnN0IGRpc3BhdGNoZXJUb2tlbiA9IHRoaXMuX2Rpc3BhdGNoZXIucmVnaXN0ZXIodGhpcy5faGFuZGxlUGF5bG9hZC5iaW5kKHRoaXMpKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4gdGhpcy5fZGlzcGF0Y2hlci51bnJlZ2lzdGVyKGRpc3BhdGNoZXJUb2tlbikpO1xuICB9XG5cbiAgX2xpc3RlbkZvclByb2plY3RDaGFuZ2UoKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocygoKSA9PiB7XG4gICAgICB0aGlzLl9kZWJ1Z2dlckFjdGlvbnMudXBkYXRlQ29ubmVjdGlvbnMoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byBuZXcgY29ubmVjdGlvbiB1cGRhdGVzIGZyb20gRGVidWdnZXJBY3Rpb25zLlxuICAgKi9cbiAgb25Db25uZWN0aW9uc1VwZGF0ZWQoY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgY29uc3QgZW1pdHRlciA9IHRoaXMuX2V2ZW50RW1pdHRlcjtcbiAgICB0aGlzLl9ldmVudEVtaXR0ZXIub24oQ09OTkVDVElPTlNfVVBEQVRFRF9FVkVOVCwgY2FsbGJhY2spO1xuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiBlbWl0dGVyLnJlbW92ZUxpc3RlbmVyKENPTk5FQ1RJT05TX1VQREFURURfRVZFTlQsIGNhbGxiYWNrKSk7XG4gIH1cblxuICBnZXRDb25uZWN0aW9ucygpOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fY29ubmVjdGlvbnM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGF2YWlsYWJsZSBsYXVuY2gvYXR0YWNoIHByb3ZpZGVyIGZvciBpbnB1dCBjb25uZWN0aW9uLlxuICAgKiBDYWxsZXIgaXMgcmVzcG9uc2libGUgZm9yIGRpc3Bvc2luZyB0aGUgcmVzdWx0cy5cbiAgICovXG4gIGdldExhdW5jaEF0dGFjaFByb3ZpZGVyc0ZvckNvbm5lY3Rpb24oY29ubmVjdGlvbjogc3RyaW5nKTogQXJyYXk8RGVidWdnZXJMYXVuY2hBdHRhY2hQcm92aWRlcj4ge1xuICAgIGNvbnN0IGF2YWlsYWJsZUxhdW5jaEF0dGFjaFByb3ZpZGVycyA9IFtdO1xuICAgIGZvciAoY29uc3QgcHJvdmlkZXIgb2YgdGhpcy5fZGVidWdnZXJQcm92aWRlcnMpIHtcbiAgICAgIGNvbnN0IGxhdW5jaEF0dGFjaFByb3ZpZGVyID0gcHJvdmlkZXIuZ2V0TGF1bmNoQXR0YWNoUHJvdmlkZXIoY29ubmVjdGlvbik7XG4gICAgICBpZiAobGF1bmNoQXR0YWNoUHJvdmlkZXIgIT0gbnVsbCkge1xuICAgICAgICBhdmFpbGFibGVMYXVuY2hBdHRhY2hQcm92aWRlcnMucHVzaChsYXVuY2hBdHRhY2hQcm92aWRlcik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhdmFpbGFibGVMYXVuY2hBdHRhY2hQcm92aWRlcnM7XG4gIH1cblxuICBfaGFuZGxlUGF5bG9hZChwYXlsb2FkOiBPYmplY3QpIHtcbiAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uVHlwZSkge1xuICAgICAgY2FzZSBDb25zdGFudHMuQWN0aW9ucy5BRERfREVCVUdHRVJfUFJPVklERVI6XG4gICAgICAgIGlmICh0aGlzLl9kZWJ1Z2dlclByb3ZpZGVycy5oYXMocGF5bG9hZC5kYXRhKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9kZWJ1Z2dlclByb3ZpZGVycy5hZGQocGF5bG9hZC5kYXRhKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIENvbnN0YW50cy5BY3Rpb25zLlJFTU9WRV9ERUJVR0dFUl9QUk9WSURFUjpcbiAgICAgICAgaWYgKCF0aGlzLl9kZWJ1Z2dlclByb3ZpZGVycy5oYXMocGF5bG9hZC5kYXRhKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9kZWJ1Z2dlclByb3ZpZGVycy5kZWxldGUocGF5bG9hZC5kYXRhKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIENvbnN0YW50cy5BY3Rpb25zLlVQREFURV9DT05ORUNUSU9OUzpcbiAgICAgICAgdGhpcy5fY29ubmVjdGlvbnMgPSBwYXlsb2FkLmRhdGE7XG4gICAgICAgIHRoaXMuX2V2ZW50RW1pdHRlci5lbWl0KENPTk5FQ1RJT05TX1VQREFURURfRVZFTlQpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn1cbiJdfQ==