Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _analytics = require('../../analytics');

var _remoteUri = require('../../remote-uri');

var _require = require('atom');

var Disposable = _require.Disposable;

var logger = require('../../logging').getLogger();

var NuclideSocket = require('../../server/lib/NuclideSocket');

var HEARTBEAT_AWAY_REPORT_COUNT = 3;
var HEARTBEAT_NOTIFICATION_ERROR = 1;
var HEARTBEAT_NOTIFICATION_WARNING = 2;

// Provides feedback to the user of the health of a NuclideSocket.

var ConnectionHealthNotifier = (function () {
  function ConnectionHealthNotifier(host, socket) {
    var _this = this;

    _classCallCheck(this, ConnectionHealthNotifier);

    this._heartbeatNetworkAwayCount = 0;
    this._lastHeartbeatNotification = null;

    var serverUri = socket.getServerUri();

    /**
     * Adds an Atom notification for the detected heartbeat network status
     * The function makes sure not to add many notifications for the same event and prioritize
     * new events.
     */
    var addHeartbeatNotification = function addHeartbeatNotification(type, errorCode, message, dismissable, askToReload) {
      var _ref = _this._lastHeartbeatNotification || {};

      var code = _ref.code;
      var existingNotification = _ref.notification;

      if (code && code === errorCode && dismissable) {
        // A dismissible heartbeat notification with this code is already active.
        return;
      }
      var notification = null;
      var options = { dismissable: dismissable, buttons: [] };
      if (askToReload) {
        options.buttons.push({
          className: 'icon icon-zap',
          onDidClick: function onDidClick() {
            atom.reload();
          },
          text: 'Reload Atom'
        });
      }
      switch (type) {
        case HEARTBEAT_NOTIFICATION_ERROR:
          notification = atom.notifications.addError(message, options);
          break;
        case HEARTBEAT_NOTIFICATION_WARNING:
          notification = atom.notifications.addWarning(message, options);
          break;
        default:
          throw new Error('Unrecongnized heartbeat notification type');
      }
      if (existingNotification) {
        existingNotification.dismiss();
      }
      (0, _assert2['default'])(notification);
      _this._lastHeartbeatNotification = {
        notification: notification,
        code: errorCode
      };
    };

    var onHeartbeat = function onHeartbeat() {
      if (_this._lastHeartbeatNotification) {
        // If there has been existing heartbeat error/warning,
        // that means connection has been lost and we shall show a message about connection
        // being restored without a reconnect prompt.
        var _notification = _this._lastHeartbeatNotification.notification;

        _notification.dismiss();
        atom.notifications.addSuccess('Connection restored to Nuclide Server at: ' + serverUri);
        _this._heartbeatNetworkAwayCount = 0;
        _this._lastHeartbeatNotification = null;
      }
    };

    var notifyNetworkAway = function notifyNetworkAway(code) {
      _this._heartbeatNetworkAwayCount++;
      if (_this._heartbeatNetworkAwayCount >= HEARTBEAT_AWAY_REPORT_COUNT) {
        addHeartbeatNotification(HEARTBEAT_NOTIFICATION_WARNING, code, 'Nuclide server can not be reached at "' + serverUri + '".<br/>' + 'Check your network connection.',
        /*dismissable*/true,
        /*askToReload*/false);
      }
    };

    var onHeartbeatError = function onHeartbeatError(error) {
      var code = error.code;
      var message = error.message;
      var originalCode = error.originalCode;

      (0, _analytics.trackEvent)({
        type: 'heartbeat-error',
        data: {
          code: code || '',
          message: message || '',
          host: host
        }
      });
      logger.info('Heartbeat network error:', code, originalCode, message);
      switch (code) {
        case 'NETWORK_AWAY':
          // Notify switching networks, disconnected, timeout, unreachable server or fragile
          // connection.
          notifyNetworkAway(code);
          break;
        case 'SERVER_CRASHED':
          // Server shut down or port no longer accessible.
          // Notify the server was there, but now gone.
          addHeartbeatNotification(HEARTBEAT_NOTIFICATION_ERROR, code, '**Nuclide Server Crashed**<br/>' + 'Please reload Atom to restore your remote project connection.',
          /*dismissable*/true,
          /*askToReload*/true);
          // TODO(most) reconnect ServerConnection, restore the current project state,
          // and finally change dismissable to false and type to 'WARNING'.
          break;
        case 'PORT_NOT_ACCESSIBLE':
          // Notify never heard a heartbeat from the server.

          var _parseRemoteUri = (0, _remoteUri.parse)(serverUri),
              port = _parseRemoteUri.port;

          addHeartbeatNotification(HEARTBEAT_NOTIFICATION_ERROR, code, '**Nuclide Server Is Not Reachable**<br/>' + ('It could be running on a port that is not accessible: ' + port + '.'),
          /*dismissable*/true,
          /*askToReload*/false);
          break;
        case 'INVALID_CERTIFICATE':
          // Notify the client certificate is not accepted by nuclide server
          // (certificate mismatch).
          addHeartbeatNotification(HEARTBEAT_NOTIFICATION_ERROR, code, '**Connection Reset Error**<br/>' + 'This could be caused by the client certificate mismatching the ' + 'server certificate.<br/>' + 'Please reload Atom to restore your remote project connection.',
          /*dismissable*/true,
          /*askToReload*/true);
          // TODO(most): reconnect ServerConnection, restore the current project state.
          // and finally change dismissable to false and type to 'WARNING'.
          break;
        default:
          notifyNetworkAway(code);
          logger.error('Unrecongnized heartbeat error code: ' + code, message);
          break;
      }
    };
    socket.on('heartbeat', onHeartbeat);
    socket.on('heartbeat.error', onHeartbeatError);

    this._subscription = new Disposable(function () {
      socket.removeListener('heartbeat', onHeartbeat);
      socket.removeListener('heartbeat.error', onHeartbeatError);
    });
  }

  _createClass(ConnectionHealthNotifier, [{
    key: 'dispose',
    value: function dispose() {
      this._subscription.dispose();
    }
  }]);

  return ConnectionHealthNotifier;
})();

exports.ConnectionHealthNotifier = ConnectionHealthNotifier;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbm5lY3Rpb25IZWFsdGhOb3RpZmllci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBV3NCLFFBQVE7Ozs7eUJBQ0wsaUJBQWlCOzt5QkFHSixrQkFBa0I7O2VBRG5DLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQTdCLFVBQVUsWUFBVixVQUFVOztBQUVqQixJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7O0FBRXBELElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDOztBQUVoRSxJQUFNLDJCQUEyQixHQUFHLENBQUMsQ0FBQztBQUN0QyxJQUFNLDRCQUE0QixHQUFHLENBQUMsQ0FBQztBQUN2QyxJQUFNLDhCQUE4QixHQUFHLENBQUMsQ0FBQzs7OztJQVE1Qix3QkFBd0I7QUFLeEIsV0FMQSx3QkFBd0IsQ0FLdkIsSUFBWSxFQUFFLE1BQXFCLEVBQUU7OzswQkFMdEMsd0JBQXdCOztBQU1qQyxRQUFJLENBQUMsMEJBQTBCLEdBQUcsQ0FBQyxDQUFDO0FBQ3BDLFFBQUksQ0FBQywwQkFBMEIsR0FBRyxJQUFJLENBQUM7O0FBRXZDLFFBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7Ozs7OztBQU94QyxRQUFNLHdCQUF3QixHQUFHLFNBQTNCLHdCQUF3QixDQUM1QixJQUFJLEVBQ0osU0FBUyxFQUNULE9BQU8sRUFDUCxXQUFXLEVBQ1gsV0FBVyxFQUNSO2lCQUNnRCxNQUFLLDBCQUEwQixJQUFJLEVBQUU7O1VBQWpGLElBQUksUUFBSixJQUFJO1VBQWdCLG9CQUFvQixRQUFsQyxZQUFZOztBQUN6QixVQUFJLElBQUksSUFBSSxJQUFJLEtBQUssU0FBUyxJQUFJLFdBQVcsRUFBRTs7QUFFN0MsZUFBTztPQUNSO0FBQ0QsVUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLFVBQU0sT0FBTyxHQUFHLEVBQUMsV0FB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cUI7OztnQ0FFVCxzQkFBZSxTQUFTLENBQUM7Y0FBakMsSUFBSSxtQkFBSixJQUFJOztBQUNYLGtDQUF3QixDQUFDLDRCQUE0QixFQUFFLElBQUksRUFDckQsMENBQTBDLCtEQUNlLElBQUksT0FBRzt5QkFDaEQsSUFBSTt5QkFDSixLQUFLLENBQUMsQ0FBQztBQUM3QixnQkFBTTtBQUFBLEFBQ1IsYUFBSyxxQkFBcUI7OztBQUd4QixrQ0FBd0IsQ0FBQyw0QkFBNEIsRUFBRSxJQUFJLEVBQ3JELGlDQUFpQyxHQUNqQyxpRUFBaUUsR0FDL0QsMEJBQTBCLEdBQzVCLCtEQUErRDt5QkFDL0MsSUFBSTt5QkFDSixJQUFJLENBQUMsQ0FBQzs7O0FBRzVCLGdCQUFNO0FBQUEsQUFDUjtBQUNFLDJCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hCLGdCQUFNLENBQUMsS0FBSyxDQUFDLHNDQUFzQyxHQUFHLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNyRSxnQkFBTTtBQUFBLE9BQ1Q7S0FDRixDQUFDO0FBQ0YsVUFBTSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDcEMsVUFBTSxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDOztBQUUvQyxRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksVUFBVSxDQUFDLFlBQU07QUFDeEMsWUFBTSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDaEQsWUFBTSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0tBQzVELENBQUMsQ0FBQztHQUNKOztlQWhKVSx3QkFBd0I7O1dBa0o1QixtQkFBUztBQUNkLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDOUI7OztTQXBKVSx3QkFBd0IiLCJmaWxlIjoiQ29ubmVjdGlvbkhlYWx0aE5vdGlmaWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHt0cmFja0V2ZW50fSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuXG5jb25zdCB7RGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5pbXBvcnQge3BhcnNlIGFzIHBhcnNlUmVtb3RlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcblxuY29uc3QgTnVjbGlkZVNvY2tldCA9IHJlcXVpcmUoJy4uLy4uL3NlcnZlci9saWIvTnVjbGlkZVNvY2tldCcpO1xuXG5jb25zdCBIRUFSVEJFQVRfQVdBWV9SRVBPUlRfQ09VTlQgPSAzO1xuY29uc3QgSEVBUlRCRUFUX05PVElGSUNBVElPTl9FUlJPUiA9IDE7XG5jb25zdCBIRUFSVEJFQVRfTk9USUZJQ0FUSU9OX1dBUk5JTkcgPSAyO1xuXG50eXBlIEhlYXJ0YmVhdE5vdGlmaWNhdGlvbiA9IHtcbiAgbm90aWZpY2F0aW9uOiBhdG9tJE5vdGlmaWNhdGlvbjtcbiAgY29kZTogc3RyaW5nO1xufVxuXG4vLyBQcm92aWRlcyBmZWVkYmFjayB0byB0aGUgdXNlciBvZiB0aGUgaGVhbHRoIG9mIGEgTnVjbGlkZVNvY2tldC5cbmV4cG9ydCBjbGFzcyBDb25uZWN0aW9uSGVhbHRoTm90aWZpZXIge1xuICBfaGVhcnRiZWF0TmV0d29ya0F3YXlDb3VudDogbnVtYmVyO1xuICBfbGFzdEhlYXJ0YmVhdE5vdGlmaWNhdGlvbjogP0hlYXJ0YmVhdE5vdGlmaWNhdGlvbjtcbiAgX3N1YnNjcmlwdGlvbjogSURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoaG9zdDogc3RyaW5nLCBzb2NrZXQ6IE51Y2xpZGVTb2NrZXQpIHtcbiAgICB0aGlzLl9oZWFydGJlYXROZXR3b3JrQXdheUNvdW50ID0gMDtcbiAgICB0aGlzLl9sYXN0SGVhcnRiZWF0Tm90aWZpY2F0aW9uID0gbnVsbDtcblxuICAgIGNvbnN0IHNlcnZlclVyaSA9IHNvY2tldC5nZXRTZXJ2ZXJVcmkoKTtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgYW4gQXRvbSBub3RpZmljYXRpb24gZm9yIHRoZSBkZXRlY3RlZCBoZWFydGJlYXQgbmV0d29yayBzdGF0dXNcbiAgICAgKiBUaGUgZnVuY3Rpb24gbWFrZXMgc3VyZSBub3QgdG8gYWRkIG1hbnkgbm90aWZpY2F0aW9ucyBmb3IgdGhlIHNhbWUgZXZlbnQgYW5kIHByaW9yaXRpemVcbiAgICAgKiBuZXcgZXZlbnRzLlxuICAgICAqL1xuICAgIGNvbnN0IGFkZEhlYXJ0YmVhdE5vdGlmaWNhdGlvbiA9IChcbiAgICAgIHR5cGU6IG51bWJlcixcbiAgICAgIGVycm9yQ29kZTogc3RyaW5nLFxuICAgICAgbWVzc2FnZTogc3RyaW5nLFxuICAgICAgZGlzbWlzc2FibGU6IGJvb2xlYW4sXG4gICAgICBhc2tUb1JlbG9hZDogYm9vbGVhblxuICAgICkgPT4ge1xuICAgICAgY29uc3Qge2NvZGUsIG5vdGlmaWNhdGlvbjogZXhpc3RpbmdOb3RpZmljYXRpb259ID0gdGhpcy5fbGFzdEhlYXJ0YmVhdE5vdGlmaWNhdGlvbiB8fCB7fTtcbiAgICAgIGlmIChjb2RlICYmIGNvZGUgPT09IGVycm9yQ29kZSAmJiBkaXNtaXNzYWJsZSkge1xuICAgICAgICAvLyBBIGRpc21pc3NpYmxlIGhlYXJ0YmVhdCBub3RpZmljYXRpb24gd2l0aCB0aGlzIGNvZGUgaXMgYWxyZWFkeSBhY3RpdmUuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGxldCBub3RpZmljYXRpb24gPSBudWxsO1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IHtkaXNtaXNzYWJsZSwgYnV0dG9uczogW119O1xuICAgICAgaWYgKGFza1RvUmVsb2FkKSB7XG4gICAgICAgIG9wdGlvbnMuYnV0dG9ucy5wdXNoKHtcbiAgICAgICAgICBjbGFzc05hbWU6ICdpY29uIGljb24temFwJyxcbiAgICAgICAgICBvbkRpZENsaWNrKCkgeyBhdG9tLnJlbG9hZCgpOyB9LFxuICAgICAgICAgIHRleHQ6ICdSZWxvYWQgQXRvbScsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgSEVBUlRCRUFUX05PVElGSUNBVElPTl9FUlJPUjpcbiAgICAgICAgICBub3RpZmljYXRpb24gPSBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobWVzc2FnZSwgb3B0aW9ucyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgSEVBUlRCRUFUX05PVElGSUNBVElPTl9XQVJOSU5HOlxuICAgICAgICAgIG5vdGlmaWNhdGlvbiA9IGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5yZWNvbmduaXplZCBoZWFydGJlYXQgbm90aWZpY2F0aW9uIHR5cGUnKTtcbiAgICAgIH1cbiAgICAgIGlmIChleGlzdGluZ05vdGlmaWNhdGlvbikge1xuICAgICAgICBleGlzdGluZ05vdGlmaWNhdGlvbi5kaXNtaXNzKCk7XG4gICAgICB9XG4gICAgICBpbnZhcmlhbnQobm90aWZpY2F0aW9uKTtcbiAgICAgIHRoaXMuX2xhc3RIZWFydGJlYXROb3RpZmljYXRpb24gPSB7XG4gICAgICAgIG5vdGlmaWNhdGlvbixcbiAgICAgICAgY29kZTogZXJyb3JDb2RlLFxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgY29uc3Qgb25IZWFydGJlYXQgPSAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5fbGFzdEhlYXJ0YmVhdE5vdGlmaWNhdGlvbikge1xuICAgICAgICAvLyBJZiB0aGVyZSBoYXMgYmVlbiBleGlzdGluZyBoZWFydGJlYXQgZXJyb3Ivd2FybmluZyxcbiAgICAgICAgLy8gdGhhdCBtZWFucyBjb25uZWN0aW9uIGhhcyBiZWVuIGxvc3QgYW5kIHdlIHNoYWxsIHNob3cgYSBtZXNzYWdlIGFib3V0IGNvbm5lY3Rpb25cbiAgICAgICAgLy8gYmVpbmcgcmVzdG9yZWQgd2l0aG91dCBhIHJlY29ubmVjdCBwcm9tcHQuXG4gICAgICAgIGNvbnN0IHtub3RpZmljYXRpb259ID0gdGhpcy5fbGFzdEhlYXJ0YmVhdE5vdGlmaWNhdGlvbjtcbiAgICAgICAgbm90aWZpY2F0aW9uLmRpc21pc3MoKTtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MoJ0Nvbm5lY3Rpb24gcmVzdG9yZWQgdG8gTnVjbGlkZSBTZXJ2ZXIgYXQ6ICcgKyBzZXJ2ZXJVcmkpO1xuICAgICAgICB0aGlzLl9oZWFydGJlYXROZXR3b3JrQXdheUNvdW50ID0gMDtcbiAgICAgICAgdGhpcy5fbGFzdEhlYXJ0YmVhdE5vdGlmaWNhdGlvbiA9IG51bGw7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IG5vdGlmeU5ldHdvcmtBd2F5ID0gKGNvZGU6IHN0cmluZykgPT4ge1xuICAgICAgdGhpcy5faGVhcnRiZWF0TmV0d29ya0F3YXlDb3VudCsrO1xuICAgICAgaWYgKHRoaXMuX2hlYXJ0YmVhdE5ldHdvcmtBd2F5Q291bnQgPj0gSEVBUlRCRUFUX0FXQVlfUkVQT1JUX0NPVU5UKSB7XG4gICAgICAgIGFkZEhlYXJ0YmVhdE5vdGlmaWNhdGlvbihIRUFSVEJFQVRfTk9USUZJQ0FUSU9OX1dBUk5JTkcsIGNvZGUsXG4gICAgICAgICAgYE51Y2xpZGUgc2VydmVyIGNhbiBub3QgYmUgcmVhY2hlZCBhdCBcIiR7c2VydmVyVXJpfVwiLjxici8+YCArXG4gICAgICAgICAgJ0NoZWNrIHlvdXIgbmV0d29yayBjb25uZWN0aW9uLicsXG4gICAgICAgICAgLypkaXNtaXNzYWJsZSovIHRydWUsXG4gICAgICAgICAgLyphc2tUb1JlbG9hZCovIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb25IZWFydGJlYXRFcnJvciA9IChlcnJvcjogYW55KSA9PiB7XG4gICAgICBjb25zdCB7Y29kZSwgbWVzc2FnZSwgb3JpZ2luYWxDb2RlfSA9IGVycm9yO1xuICAgICAgdHJhY2tFdmVudCh7XG4gICAgICAgIHR5cGU6ICdoZWFydGJlYXQtZXJyb3InLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgY29kZTogY29kZSB8fCAnJyxcbiAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlIHx8ICcnLFxuICAgICAgICAgIGhvc3Q6IGhvc3QsXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICAgIGxvZ2dlci5pbmZvKCdIZWFydGJlYXQgbmV0d29yayBlcnJvcjonLCBjb2RlLCBvcmlnaW5hbENvZGUsIG1lc3NhZ2UpO1xuICAgICAgc3dpdGNoIChjb2RlKSB7XG4gICAgICAgIGNhc2UgJ05FVFdPUktfQVdBWSc6XG4gICAgICAgICAgICAvLyBOb3RpZnkgc3dpdGNoaW5nIG5ldHdvcmtzLCBkaXNjb25uZWN0ZWQsIHRpbWVvdXQsIHVucmVhY2hhYmxlIHNlcnZlciBvciBmcmFnaWxlXG4gICAgICAgICAgICAvLyBjb25uZWN0aW9uLlxuICAgICAgICAgIG5vdGlmeU5ldHdvcmtBd2F5KGNvZGUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdTRVJWRVJfQ1JBU0hFRCc6XG4gICAgICAgICAgICAvLyBTZXJ2ZXIgc2h1dCBkb3duIG9yIHBvcnQgbm8gbG9uZ2VyIGFjY2Vzc2libGUuXG4gICAgICAgICAgICAvLyBOb3RpZnkgdGhlIHNlcnZlciB3YXMgdGhlcmUsIGJ1dCBub3cgZ29uZS5cbiAgICAgICAgICBhZGRIZWFydGJlYXROb3RpZmljYXRpb24oSEVBUlRCRUFUX05PVElGSUNBVElPTl9FUlJPUiwgY29kZSxcbiAgICAgICAgICAgICAgICAnKipOdWNsaWRlIFNlcnZlciBDcmFzaGVkKio8YnIvPicgK1xuICAgICAgICAgICAgICAgICdQbGVhc2UgcmVsb2FkIEF0b20gdG8gcmVzdG9yZSB5b3VyIHJlbW90ZSBwcm9qZWN0IGNvbm5lY3Rpb24uJyxcbiAgICAgICAgICAgICAgICAvKmRpc21pc3NhYmxlKi8gdHJ1ZSxcbiAgICAgICAgICAgICAgICAvKmFza1RvUmVsb2FkKi8gdHJ1ZSk7XG4gICAgICAgICAgICAvLyBUT0RPKG1vc3QpIHJlY29ubmVjdCBTZXJ2ZXJDb25uZWN0aW9uLCByZXN0b3JlIHRoZSBjdXJyZW50IHByb2plY3Qgc3RhdGUsXG4gICAgICAgICAgICAvLyBhbmQgZmluYWxseSBjaGFuZ2UgZGlzbWlzc2FibGUgdG8gZmFsc2UgYW5kIHR5cGUgdG8gJ1dBUk5JTkcnLlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdQT1JUX05PVF9BQ0NFU1NJQkxFJzpcbiAgICAgICAgICAgIC8vIE5vdGlmeSBuZXZlciBoZWFyZCBhIGhlYXJ0YmVhdCBmcm9tIHRoZSBzZXJ2ZXIuXG4gICAgICAgICAgY29uc3Qge3BvcnR9ID0gcGFyc2VSZW1vdGVVcmkoc2VydmVyVXJpKTtcbiAgICAgICAgICBhZGRIZWFydGJlYXROb3RpZmljYXRpb24oSEVBUlRCRUFUX05PVElGSUNBVElPTl9FUlJPUiwgY29kZSxcbiAgICAgICAgICAgICAgICAnKipOdWNsaWRlIFNlcnZlciBJcyBOb3QgUmVhY2hhYmxlKio8YnIvPicgK1xuICAgICAgICAgICAgICAgIGBJdCBjb3VsZCBiZSBydW5uaW5nIG9uIGEgcG9ydCB0aGF0IGlzIG5vdCBhY2Nlc3NpYmxlOiAke3BvcnR9LmAsXG4gICAgICAgICAgICAgICAgLypkaXNtaXNzYWJsZSovIHRydWUsXG4gICAgICAgICAgICAgICAgLyphc2tUb1JlbG9hZCovIGZhbHNlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnSU5WQUxJRF9DRVJUSUZJQ0FURSc6XG4gICAgICAgICAgICAvLyBOb3RpZnkgdGhlIGNsaWVudCBjZXJ0aWZpY2F0ZSBpcyBub3QgYWNjZXB0ZWQgYnkgbnVjbGlkZSBzZXJ2ZXJcbiAgICAgICAgICAgIC8vIChjZXJ0aWZpY2F0ZSBtaXNtYXRjaCkuXG4gICAgICAgICAgYWRkSGVhcnRiZWF0Tm90aWZpY2F0aW9uKEhFQVJUQkVBVF9OT1RJRklDQVRJT05fRVJST1IsIGNvZGUsXG4gICAgICAgICAgICAgICAgJyoqQ29ubmVjdGlvbiBSZXNldCBFcnJvcioqPGJyLz4nICtcbiAgICAgICAgICAgICAgICAnVGhpcyBjb3VsZCBiZSBjYXVzZWQgYnkgdGhlIGNsaWVudCBjZXJ0aWZpY2F0ZSBtaXNtYXRjaGluZyB0aGUgJyArXG4gICAgICAgICAgICAgICAgICAnc2VydmVyIGNlcnRpZmljYXRlLjxici8+JyArXG4gICAgICAgICAgICAgICAgJ1BsZWFzZSByZWxvYWQgQXRvbSB0byByZXN0b3JlIHlvdXIgcmVtb3RlIHByb2plY3QgY29ubmVjdGlvbi4nLFxuICAgICAgICAgICAgICAgIC8qZGlzbWlzc2FibGUqLyB0cnVlLFxuICAgICAgICAgICAgICAgIC8qYXNrVG9SZWxvYWQqLyB0cnVlKTtcbiAgICAgICAgICAgIC8vIFRPRE8obW9zdCk6IHJlY29ubmVjdCBTZXJ2ZXJDb25uZWN0aW9uLCByZXN0b3JlIHRoZSBjdXJyZW50IHByb2plY3Qgc3RhdGUuXG4gICAgICAgICAgICAvLyBhbmQgZmluYWxseSBjaGFuZ2UgZGlzbWlzc2FibGUgdG8gZmFsc2UgYW5kIHR5cGUgdG8gJ1dBUk5JTkcnLlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIG5vdGlmeU5ldHdvcmtBd2F5KGNvZGUpO1xuICAgICAgICAgIGxvZ2dlci5lcnJvcignVW5yZWNvbmduaXplZCBoZWFydGJlYXQgZXJyb3IgY29kZTogJyArIGNvZGUsIG1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH07XG4gICAgc29ja2V0Lm9uKCdoZWFydGJlYXQnLCBvbkhlYXJ0YmVhdCk7XG4gICAgc29ja2V0Lm9uKCdoZWFydGJlYXQuZXJyb3InLCBvbkhlYXJ0YmVhdEVycm9yKTtcblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbiA9IG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHNvY2tldC5yZW1vdmVMaXN0ZW5lcignaGVhcnRiZWF0Jywgb25IZWFydGJlYXQpO1xuICAgICAgc29ja2V0LnJlbW92ZUxpc3RlbmVyKCdoZWFydGJlYXQuZXJyb3InLCBvbkhlYXJ0YmVhdEVycm9yKTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgfVxufVxuIl19