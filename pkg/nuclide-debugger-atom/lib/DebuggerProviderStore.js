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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyUHJvdmlkZXJTdG9yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBa0I4QyxNQUFNOzt5QkFDOUIsYUFBYTs7OztzQkFDUixRQUFROztBQUVuQyxJQUFNLHlCQUF5QixHQUFHLDJCQUEyQixDQUFDOzs7Ozs7SUFLakQscUJBQXFCO0FBUXJCLFdBUkEscUJBQXFCLENBUXBCLFVBQXNCLEVBQUUsZUFBZ0MsRUFBRTswQkFSM0QscUJBQXFCOztBQVM5QixRQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztBQUM5QixRQUFJLENBQUMsWUFBWSxHQUFHLDhCQUNsQixJQUFJLENBQUMseUJBQXlCLEVBQUUsRUFDaEMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQy9CLENBQUM7QUFDRixRQUFJLENBQUMsZ0JBQWdCLEdBQUcsZUFBZSxDQUFDO0FBQ3hDLFFBQUksQ0FBQyxhQUFhLEdBQUcsMEJBQWtCLENBQUM7QUFDeEMsUUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDcEMsUUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7R0FDeEI7O2VBbEJVLHFCQUFxQjs7V0FvQlAscUNBQWdCOzs7QUFDdkMsVUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNsRixhQUFPLHFCQUFlO2VBQU0sTUFBSyxXQUFXLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQztPQUFBLENBQUMsQ0FBQztLQUMzRTs7O1dBRXNCLG1DQUFnQjs7O0FBQ3JDLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFNO0FBQ3pDLGVBQUssZ0JBQWdCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztPQUMzQyxDQUFDLENBQUM7S0FDSjs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7Ozs7O1dBS21CLDhCQUFDLFFBQW9CLEVBQWU7QUFDdEQsVUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztBQUNuQyxVQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyx5QkFBeUIsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUMzRCxhQUFPLHFCQUFlO2VBQU0sT0FBTyxDQUFDLGNBQWMsQ0FBQyx5QkFBeUIsRUFBRSxRQUFRLENBQUM7T0FBQSxDQUFDLENBQUM7S0FDMUY7OztXQUVhLDBCQUFrQjtBQUM5QixhQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7S0FDMUI7Ozs7Ozs7O1dBTW9DLCtDQUFDLFVBQWtCLEVBQXVDO0FBQzdGLFVBQU0sOEJBQThCLEdBQUcsRUFBRSxDQUFDO0FBQzFDLFdBQUssSUFBTSxRQUFRLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO0FBQzlDLFlBQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzFFLFlBQUksb0JBQW9CLElBQUksSUFBSSxFQUFFO0FBQ2hDLHdDQUE4QixDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1NBQzNEO09BQ0Y7QUFDRCxhQUFPLDhCQUE4QixDQUFDO0tBQ3ZDOzs7V0FFYSx3QkFBQyxPQUFlLEVBQUU7QUFDOUIsY0FBUSxPQUFPLENBQUMsVUFBVTtBQUN4QixhQUFLLHVCQUFVLE9BQU8sQ0FBQyxxQkFBcUI7QUFDMUMsY0FBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUM3QyxtQkFBTztXQUNSO0FBQ0QsY0FBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUMsZ0JBQU07QUFBQSxBQUNSLGFBQUssdUJBQVUsT0FBTyxDQUFDLHdCQUF3QjtBQUM3QyxjQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDOUMsbUJBQU87V0FDUjtBQUNELGNBQUksQ0FBQyxrQkFBa0IsVUFBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QyxnQkFBTTtBQUFBLEFBQ1IsYUFBSyx1QkFBVSxPQUFPLENBQUMsa0JBQWtCO0FBQ3ZDLGNBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztBQUNqQyxjQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQ25ELGdCQUFNO0FBQUEsT0FDVDtLQUNGOzs7U0FsRlUscUJBQXFCIiwiZmlsZSI6IkRlYnVnZ2VyUHJvdmlkZXJTdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtEaXNwYXRjaGVyfSBmcm9tICdmbHV4JztcbmltcG9ydCB0eXBlIERlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXIgZnJvbSAnLi9EZWJ1Z2dlckxhdW5jaEF0dGFjaFByb3ZpZGVyJztcbmltcG9ydCB0eXBlIHtcbiAgTnVjbGlkZURlYnVnZ2VyUHJvdmlkZXIsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtZGVidWdnZXItaW50ZXJmYWNlcy9zZXJ2aWNlJztcbmltcG9ydCB0eXBlIERlYnVnZ2VyQWN0aW9ucyBmcm9tICcuL0RlYnVnZ2VyQWN0aW9ucyc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4vQ29uc3RhbnRzJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tICdldmVudHMnO1xuXG5jb25zdCBDT05ORUNUSU9OU19VUERBVEVEX0VWRU5UID0gJ0NPTk5FQ1RJT05TX1VQREFURURfRVZFTlQnO1xuXG4vKipcbiAqIEZsdXggc3R5bGUgc3RvcmUgaG9sZGluZyBhbGwgZGF0YSByZWxhdGVkIHRvIGRlYnVnZ2VyIHByb3ZpZGVyLlxuICovXG5leHBvcnQgY2xhc3MgRGVidWdnZXJQcm92aWRlclN0b3JlIHtcbiAgX2Rpc3BhdGNoZXI6IERpc3BhdGNoZXI7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2RlYnVnZ2VyQWN0aW9uczogRGVidWdnZXJBY3Rpb25zO1xuICBfZXZlbnRFbWl0dGVyOiBFdmVudEVtaXR0ZXI7XG4gIF9kZWJ1Z2dlclByb3ZpZGVyczogU2V0PE51Y2xpZGVEZWJ1Z2dlclByb3ZpZGVyPjtcbiAgX2Nvbm5lY3Rpb25zOiBBcnJheTxzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKGRpc3BhdGNoZXI6IERpc3BhdGNoZXIsIGRlYnVnZ2VyQWN0aW9uczogRGVidWdnZXJBY3Rpb25zKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIHRoaXMuX3JlZ2lzdGVyRGlzcGF0Y2hlckV2ZW50cygpLFxuICAgICAgdGhpcy5fbGlzdGVuRm9yUHJvamVjdENoYW5nZSgpLFxuICAgICk7XG4gICAgdGhpcy5fZGVidWdnZXJBY3Rpb25zID0gZGVidWdnZXJBY3Rpb25zO1xuICAgIHRoaXMuX2V2ZW50RW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9kZWJ1Z2dlclByb3ZpZGVycyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLl9jb25uZWN0aW9ucyA9IFtdO1xuICB9XG5cbiAgX3JlZ2lzdGVyRGlzcGF0Y2hlckV2ZW50cygpOiBJRGlzcG9zYWJsZSB7XG4gICAgY29uc3QgZGlzcGF0Y2hlclRva2VuID0gdGhpcy5fZGlzcGF0Y2hlci5yZWdpc3Rlcih0aGlzLl9oYW5kbGVQYXlsb2FkLmJpbmQodGhpcykpO1xuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB0aGlzLl9kaXNwYXRjaGVyLnVucmVnaXN0ZXIoZGlzcGF0Y2hlclRva2VuKSk7XG4gIH1cblxuICBfbGlzdGVuRm9yUHJvamVjdENoYW5nZSgpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKCgpID0+IHtcbiAgICAgIHRoaXMuX2RlYnVnZ2VyQWN0aW9ucy51cGRhdGVDb25uZWN0aW9ucygpO1xuICAgIH0pO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlIHRvIG5ldyBjb25uZWN0aW9uIHVwZGF0ZXMgZnJvbSBEZWJ1Z2dlckFjdGlvbnMuXG4gICAqL1xuICBvbkNvbm5lY3Rpb25zVXBkYXRlZChjYWxsYmFjazogKCkgPT4gdm9pZCk6IElEaXNwb3NhYmxlIHtcbiAgICBjb25zdCBlbWl0dGVyID0gdGhpcy5fZXZlbnRFbWl0dGVyO1xuICAgIHRoaXMuX2V2ZW50RW1pdHRlci5vbihDT05ORUNUSU9OU19VUERBVEVEX0VWRU5ULCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoQ09OTkVDVElPTlNfVVBEQVRFRF9FVkVOVCwgY2FsbGJhY2spKTtcbiAgfVxuXG4gIGdldENvbm5lY3Rpb25zKCk6IEFycmF5PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9jb25uZWN0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYXZhaWxhYmxlIGxhdW5jaC9hdHRhY2ggcHJvdmlkZXIgZm9yIGlucHV0IGNvbm5lY3Rpb24uXG4gICAqIENhbGxlciBpcyByZXNwb25zaWJsZSBmb3IgZGlzcG9zaW5nIHRoZSByZXN1bHRzLlxuICAgKi9cbiAgZ2V0TGF1bmNoQXR0YWNoUHJvdmlkZXJzRm9yQ29ubmVjdGlvbihjb25uZWN0aW9uOiBzdHJpbmcpOiBBcnJheTxEZWJ1Z2dlckxhdW5jaEF0dGFjaFByb3ZpZGVyPiB7XG4gICAgY29uc3QgYXZhaWxhYmxlTGF1bmNoQXR0YWNoUHJvdmlkZXJzID0gW107XG4gICAgZm9yIChjb25zdCBwcm92aWRlciBvZiB0aGlzLl9kZWJ1Z2dlclByb3ZpZGVycykge1xuICAgICAgY29uc3QgbGF1bmNoQXR0YWNoUHJvdmlkZXIgPSBwcm92aWRlci5nZXRMYXVuY2hBdHRhY2hQcm92aWRlcihjb25uZWN0aW9uKTtcbiAgICAgIGlmIChsYXVuY2hBdHRhY2hQcm92aWRlciAhPSBudWxsKSB7XG4gICAgICAgIGF2YWlsYWJsZUxhdW5jaEF0dGFjaFByb3ZpZGVycy5wdXNoKGxhdW5jaEF0dGFjaFByb3ZpZGVyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGF2YWlsYWJsZUxhdW5jaEF0dGFjaFByb3ZpZGVycztcbiAgfVxuXG4gIF9oYW5kbGVQYXlsb2FkKHBheWxvYWQ6IE9iamVjdCkge1xuICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb25UeXBlKSB7XG4gICAgICBjYXNlIENvbnN0YW50cy5BY3Rpb25zLkFERF9ERUJVR0dFUl9QUk9WSURFUjpcbiAgICAgICAgaWYgKHRoaXMuX2RlYnVnZ2VyUHJvdmlkZXJzLmhhcyhwYXlsb2FkLmRhdGEpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2RlYnVnZ2VyUHJvdmlkZXJzLmFkZChwYXlsb2FkLmRhdGEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQ29uc3RhbnRzLkFjdGlvbnMuUkVNT1ZFX0RFQlVHR0VSX1BST1ZJREVSOlxuICAgICAgICBpZiAoIXRoaXMuX2RlYnVnZ2VyUHJvdmlkZXJzLmhhcyhwYXlsb2FkLmRhdGEpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2RlYnVnZ2VyUHJvdmlkZXJzLmRlbGV0ZShwYXlsb2FkLmRhdGEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQ29uc3RhbnRzLkFjdGlvbnMuVVBEQVRFX0NPTk5FQ1RJT05TOlxuICAgICAgICB0aGlzLl9jb25uZWN0aW9ucyA9IHBheWxvYWQuZGF0YTtcbiAgICAgICAgdGhpcy5fZXZlbnRFbWl0dGVyLmVtaXQoQ09OTkVDVElPTlNfVVBEQVRFRF9FVkVOVCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufVxuIl19