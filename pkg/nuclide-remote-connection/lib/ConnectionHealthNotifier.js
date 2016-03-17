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

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _require = require('atom');

var Disposable = _require.Disposable;

var logger = require('../../nuclide-logging').getLogger();

var NuclideSocket = require('../../nuclide-server/lib/NuclideSocket');

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

      (0, _nuclideAnalytics.trackEvent)({
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

          var _parseRemoteUri = (0, _nuclideRemoteUri.parse)(serverUri),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbm5lY3Rpb25IZWFsdGhOb3RpZmllci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBV3NCLFFBQVE7Ozs7Z0NBQ0wseUJBQXlCOztnQ0FHWiwwQkFBMEI7O2VBRDNDLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQTdCLFVBQVUsWUFBVixVQUFVOztBQUVqQixJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7QUFFNUQsSUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7O0FBRXhFLElBQU0sMkJBQTJCLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLElBQU0sNEJBQTRCLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZDLElBQU0sOEJBQThCLEdBQUcsQ0FBQyxDQUFDOzs7O0lBUTVCLHdCQUF3QjtBQUt4QixXQUxBLHdCQUF3QixDQUt2QixJQUFZLEVBQUUsTUFBcUIsRUFBRTs7OzBCQUx0Qyx3QkFBd0I7O0FBTWpDLFFBQUksQ0FBQywwQkFBMEIsR0FBRyxDQUFDLENBQUM7QUFDcEMsUUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksQ0FBQzs7QUFFdkMsUUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDOzs7Ozs7O0FBT3hDLFFBQU0sd0JBQXdCLEdBQUcsU0FBM0Isd0JBQXdCLENBQzVCLElBQUksRUFDSixTQUFTLEVBQ1QsT0FBTyxFQUNQLFdBQVcsRUFDWCxXQUFXLEVBQ1I7aUJBQ2dELE1BQUssMEJBQTBCLElBQUksRUFBRTs7VUFBakYsSUFBSSxRQUFKLElBQUk7VUFBZ0Isb0JBQW9CLFFBQWxDLFlBQVk7O0FBQ3pCLFVBQUksSUFBSSxJQUFJLElBQUksS0FBSyxTQUFTLElBQUksV0FBVyxFQUFFOztBQUU3QyxlQUFPO09BQ1I7QUFDRCxVQUFJLFlBQVksR0FBRyxJQUFJLENBQUM7QUFDeEIsVUFBTSxPQUFPLEdBQUcsRUFBQyxX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QUFxQjs7O2dDQUVULDZCQUFlLFNBQVMsQ0FBQztjQUFqQyxJQUFJLG1CQUFKLElBQUk7O0FBQ1gsa0NBQXdCLENBQUMsNEJBQTRCLEVBQUUsSUFBSSxFQUNyRCwwQ0FBMEMsK0RBQ2UsSUFBSSxPQUFHO3lCQUNoRCxJQUFJO3lCQUNKLEtBQUssQ0FBQyxDQUFDO0FBQzdCLGdCQUFNO0FBQUEsQUFDUixhQUFLLHFCQUFxQjs7O0FBR3hCLGtDQUF3QixDQUFDLDRCQUE0QixFQUFFLElBQUksRUFDckQsaUNBQWlDLEdBQ2pDLGlFQUFpRSxHQUMvRCwwQkFBMEIsR0FDNUIsK0RBQStEO3lCQUMvQyxJQUFJO3lCQUNKLElBQUksQ0FBQyxDQUFDOzs7QUFHNUIsZ0JBQU07QUFBQSxBQUNSO0FBQ0UsMkJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDeEIsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsc0NBQXNDLEdBQUcsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3JFLGdCQUFNO0FBQUEsT0FDVDtLQUNGLENBQUM7QUFDRixVQUFNLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztBQUNwQyxVQUFNLENBQUMsRUFBRSxDQUFDLGlCQUFpQixFQUFFLGdCQUFnQixDQUFDLENBQUM7O0FBRS9DLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxVQUFVLENBQUMsWUFBTTtBQUN4QyxZQUFNLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztBQUNoRCxZQUFNLENBQUMsY0FBYyxDQUFDLGlCQUFpQixFQUFFLGdCQUFnQixDQUFDLENBQUM7S0FDNUQsQ0FBQyxDQUFDO0dBQ0o7O2VBaEpVLHdCQUF3Qjs7V0FrSjVCLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM5Qjs7O1NBcEpVLHdCQUF3QiIsImZpbGUiOiJDb25uZWN0aW9uSGVhbHRoTm90aWZpZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge3RyYWNrRXZlbnR9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcblxuY29uc3Qge0Rpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuaW1wb3J0IHtwYXJzZSBhcyBwYXJzZVJlbW90ZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtbG9nZ2luZycpLmdldExvZ2dlcigpO1xuXG5jb25zdCBOdWNsaWRlU29ja2V0ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1zZXJ2ZXIvbGliL051Y2xpZGVTb2NrZXQnKTtcblxuY29uc3QgSEVBUlRCRUFUX0FXQVlfUkVQT1JUX0NPVU5UID0gMztcbmNvbnN0IEhFQVJUQkVBVF9OT1RJRklDQVRJT05fRVJST1IgPSAxO1xuY29uc3QgSEVBUlRCRUFUX05PVElGSUNBVElPTl9XQVJOSU5HID0gMjtcblxudHlwZSBIZWFydGJlYXROb3RpZmljYXRpb24gPSB7XG4gIG5vdGlmaWNhdGlvbjogYXRvbSROb3RpZmljYXRpb247XG4gIGNvZGU6IHN0cmluZztcbn1cblxuLy8gUHJvdmlkZXMgZmVlZGJhY2sgdG8gdGhlIHVzZXIgb2YgdGhlIGhlYWx0aCBvZiBhIE51Y2xpZGVTb2NrZXQuXG5leHBvcnQgY2xhc3MgQ29ubmVjdGlvbkhlYWx0aE5vdGlmaWVyIHtcbiAgX2hlYXJ0YmVhdE5ldHdvcmtBd2F5Q291bnQ6IG51bWJlcjtcbiAgX2xhc3RIZWFydGJlYXROb3RpZmljYXRpb246ID9IZWFydGJlYXROb3RpZmljYXRpb247XG4gIF9zdWJzY3JpcHRpb246IElEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKGhvc3Q6IHN0cmluZywgc29ja2V0OiBOdWNsaWRlU29ja2V0KSB7XG4gICAgdGhpcy5faGVhcnRiZWF0TmV0d29ya0F3YXlDb3VudCA9IDA7XG4gICAgdGhpcy5fbGFzdEhlYXJ0YmVhdE5vdGlmaWNhdGlvbiA9IG51bGw7XG5cbiAgICBjb25zdCBzZXJ2ZXJVcmkgPSBzb2NrZXQuZ2V0U2VydmVyVXJpKCk7XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGFuIEF0b20gbm90aWZpY2F0aW9uIGZvciB0aGUgZGV0ZWN0ZWQgaGVhcnRiZWF0IG5ldHdvcmsgc3RhdHVzXG4gICAgICogVGhlIGZ1bmN0aW9uIG1ha2VzIHN1cmUgbm90IHRvIGFkZCBtYW55IG5vdGlmaWNhdGlvbnMgZm9yIHRoZSBzYW1lIGV2ZW50IGFuZCBwcmlvcml0aXplXG4gICAgICogbmV3IGV2ZW50cy5cbiAgICAgKi9cbiAgICBjb25zdCBhZGRIZWFydGJlYXROb3RpZmljYXRpb24gPSAoXG4gICAgICB0eXBlOiBudW1iZXIsXG4gICAgICBlcnJvckNvZGU6IHN0cmluZyxcbiAgICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICAgIGRpc21pc3NhYmxlOiBib29sZWFuLFxuICAgICAgYXNrVG9SZWxvYWQ6IGJvb2xlYW5cbiAgICApID0+IHtcbiAgICAgIGNvbnN0IHtjb2RlLCBub3RpZmljYXRpb246IGV4aXN0aW5nTm90aWZpY2F0aW9ufSA9IHRoaXMuX2xhc3RIZWFydGJlYXROb3RpZmljYXRpb24gfHwge307XG4gICAgICBpZiAoY29kZSAmJiBjb2RlID09PSBlcnJvckNvZGUgJiYgZGlzbWlzc2FibGUpIHtcbiAgICAgICAgLy8gQSBkaXNtaXNzaWJsZSBoZWFydGJlYXQgbm90aWZpY2F0aW9uIHdpdGggdGhpcyBjb2RlIGlzIGFscmVhZHkgYWN0aXZlLlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBsZXQgbm90aWZpY2F0aW9uID0gbnVsbDtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7ZGlzbWlzc2FibGUsIGJ1dHRvbnM6IFtdfTtcbiAgICAgIGlmIChhc2tUb1JlbG9hZCkge1xuICAgICAgICBvcHRpb25zLmJ1dHRvbnMucHVzaCh7XG4gICAgICAgICAgY2xhc3NOYW1lOiAnaWNvbiBpY29uLXphcCcsXG4gICAgICAgICAgb25EaWRDbGljaygpIHsgYXRvbS5yZWxvYWQoKTsgfSxcbiAgICAgICAgICB0ZXh0OiAnUmVsb2FkIEF0b20nLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlIEhFQVJUQkVBVF9OT1RJRklDQVRJT05fRVJST1I6XG4gICAgICAgICAgbm90aWZpY2F0aW9uID0gYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEhFQVJUQkVBVF9OT1RJRklDQVRJT05fV0FSTklORzpcbiAgICAgICAgICBub3RpZmljYXRpb24gPSBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhtZXNzYWdlLCBvcHRpb25zKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VucmVjb25nbml6ZWQgaGVhcnRiZWF0IG5vdGlmaWNhdGlvbiB0eXBlJyk7XG4gICAgICB9XG4gICAgICBpZiAoZXhpc3RpbmdOb3RpZmljYXRpb24pIHtcbiAgICAgICAgZXhpc3RpbmdOb3RpZmljYXRpb24uZGlzbWlzcygpO1xuICAgICAgfVxuICAgICAgaW52YXJpYW50KG5vdGlmaWNhdGlvbik7XG4gICAgICB0aGlzLl9sYXN0SGVhcnRiZWF0Tm90aWZpY2F0aW9uID0ge1xuICAgICAgICBub3RpZmljYXRpb24sXG4gICAgICAgIGNvZGU6IGVycm9yQ29kZSxcbiAgICAgIH07XG4gICAgfTtcblxuICAgIGNvbnN0IG9uSGVhcnRiZWF0ID0gKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX2xhc3RIZWFydGJlYXROb3RpZmljYXRpb24pIHtcbiAgICAgICAgLy8gSWYgdGhlcmUgaGFzIGJlZW4gZXhpc3RpbmcgaGVhcnRiZWF0IGVycm9yL3dhcm5pbmcsXG4gICAgICAgIC8vIHRoYXQgbWVhbnMgY29ubmVjdGlvbiBoYXMgYmVlbiBsb3N0IGFuZCB3ZSBzaGFsbCBzaG93IGEgbWVzc2FnZSBhYm91dCBjb25uZWN0aW9uXG4gICAgICAgIC8vIGJlaW5nIHJlc3RvcmVkIHdpdGhvdXQgYSByZWNvbm5lY3QgcHJvbXB0LlxuICAgICAgICBjb25zdCB7bm90aWZpY2F0aW9ufSA9IHRoaXMuX2xhc3RIZWFydGJlYXROb3RpZmljYXRpb247XG4gICAgICAgIG5vdGlmaWNhdGlvbi5kaXNtaXNzKCk7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKCdDb25uZWN0aW9uIHJlc3RvcmVkIHRvIE51Y2xpZGUgU2VydmVyIGF0OiAnICsgc2VydmVyVXJpKTtcbiAgICAgICAgdGhpcy5faGVhcnRiZWF0TmV0d29ya0F3YXlDb3VudCA9IDA7XG4gICAgICAgIHRoaXMuX2xhc3RIZWFydGJlYXROb3RpZmljYXRpb24gPSBudWxsO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBub3RpZnlOZXR3b3JrQXdheSA9IChjb2RlOiBzdHJpbmcpID0+IHtcbiAgICAgIHRoaXMuX2hlYXJ0YmVhdE5ldHdvcmtBd2F5Q291bnQrKztcbiAgICAgIGlmICh0aGlzLl9oZWFydGJlYXROZXR3b3JrQXdheUNvdW50ID49IEhFQVJUQkVBVF9BV0FZX1JFUE9SVF9DT1VOVCkge1xuICAgICAgICBhZGRIZWFydGJlYXROb3RpZmljYXRpb24oSEVBUlRCRUFUX05PVElGSUNBVElPTl9XQVJOSU5HLCBjb2RlLFxuICAgICAgICAgIGBOdWNsaWRlIHNlcnZlciBjYW4gbm90IGJlIHJlYWNoZWQgYXQgXCIke3NlcnZlclVyaX1cIi48YnIvPmAgK1xuICAgICAgICAgICdDaGVjayB5b3VyIG5ldHdvcmsgY29ubmVjdGlvbi4nLFxuICAgICAgICAgIC8qZGlzbWlzc2FibGUqLyB0cnVlLFxuICAgICAgICAgIC8qYXNrVG9SZWxvYWQqLyBmYWxzZSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IG9uSGVhcnRiZWF0RXJyb3IgPSAoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgY29uc3Qge2NvZGUsIG1lc3NhZ2UsIG9yaWdpbmFsQ29kZX0gPSBlcnJvcjtcbiAgICAgIHRyYWNrRXZlbnQoe1xuICAgICAgICB0eXBlOiAnaGVhcnRiZWF0LWVycm9yJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGNvZGU6IGNvZGUgfHwgJycsXG4gICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSB8fCAnJyxcbiAgICAgICAgICBob3N0OiBob3N0LFxuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgICBsb2dnZXIuaW5mbygnSGVhcnRiZWF0IG5ldHdvcmsgZXJyb3I6JywgY29kZSwgb3JpZ2luYWxDb2RlLCBtZXNzYWdlKTtcbiAgICAgIHN3aXRjaCAoY29kZSkge1xuICAgICAgICBjYXNlICdORVRXT1JLX0FXQVknOlxuICAgICAgICAgICAgLy8gTm90aWZ5IHN3aXRjaGluZyBuZXR3b3JrcywgZGlzY29ubmVjdGVkLCB0aW1lb3V0LCB1bnJlYWNoYWJsZSBzZXJ2ZXIgb3IgZnJhZ2lsZVxuICAgICAgICAgICAgLy8gY29ubmVjdGlvbi5cbiAgICAgICAgICBub3RpZnlOZXR3b3JrQXdheShjb2RlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnU0VSVkVSX0NSQVNIRUQnOlxuICAgICAgICAgICAgLy8gU2VydmVyIHNodXQgZG93biBvciBwb3J0IG5vIGxvbmdlciBhY2Nlc3NpYmxlLlxuICAgICAgICAgICAgLy8gTm90aWZ5IHRoZSBzZXJ2ZXIgd2FzIHRoZXJlLCBidXQgbm93IGdvbmUuXG4gICAgICAgICAgYWRkSGVhcnRiZWF0Tm90aWZpY2F0aW9uKEhFQVJUQkVBVF9OT1RJRklDQVRJT05fRVJST1IsIGNvZGUsXG4gICAgICAgICAgICAgICAgJyoqTnVjbGlkZSBTZXJ2ZXIgQ3Jhc2hlZCoqPGJyLz4nICtcbiAgICAgICAgICAgICAgICAnUGxlYXNlIHJlbG9hZCBBdG9tIHRvIHJlc3RvcmUgeW91ciByZW1vdGUgcHJvamVjdCBjb25uZWN0aW9uLicsXG4gICAgICAgICAgICAgICAgLypkaXNtaXNzYWJsZSovIHRydWUsXG4gICAgICAgICAgICAgICAgLyphc2tUb1JlbG9hZCovIHRydWUpO1xuICAgICAgICAgICAgLy8gVE9ETyhtb3N0KSByZWNvbm5lY3QgU2VydmVyQ29ubmVjdGlvbiwgcmVzdG9yZSB0aGUgY3VycmVudCBwcm9qZWN0IHN0YXRlLFxuICAgICAgICAgICAgLy8gYW5kIGZpbmFsbHkgY2hhbmdlIGRpc21pc3NhYmxlIHRvIGZhbHNlIGFuZCB0eXBlIHRvICdXQVJOSU5HJy5cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnUE9SVF9OT1RfQUNDRVNTSUJMRSc6XG4gICAgICAgICAgICAvLyBOb3RpZnkgbmV2ZXIgaGVhcmQgYSBoZWFydGJlYXQgZnJvbSB0aGUgc2VydmVyLlxuICAgICAgICAgIGNvbnN0IHtwb3J0fSA9IHBhcnNlUmVtb3RlVXJpKHNlcnZlclVyaSk7XG4gICAgICAgICAgYWRkSGVhcnRiZWF0Tm90aWZpY2F0aW9uKEhFQVJUQkVBVF9OT1RJRklDQVRJT05fRVJST1IsIGNvZGUsXG4gICAgICAgICAgICAgICAgJyoqTnVjbGlkZSBTZXJ2ZXIgSXMgTm90IFJlYWNoYWJsZSoqPGJyLz4nICtcbiAgICAgICAgICAgICAgICBgSXQgY291bGQgYmUgcnVubmluZyBvbiBhIHBvcnQgdGhhdCBpcyBub3QgYWNjZXNzaWJsZTogJHtwb3J0fS5gLFxuICAgICAgICAgICAgICAgIC8qZGlzbWlzc2FibGUqLyB0cnVlLFxuICAgICAgICAgICAgICAgIC8qYXNrVG9SZWxvYWQqLyBmYWxzZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0lOVkFMSURfQ0VSVElGSUNBVEUnOlxuICAgICAgICAgICAgLy8gTm90aWZ5IHRoZSBjbGllbnQgY2VydGlmaWNhdGUgaXMgbm90IGFjY2VwdGVkIGJ5IG51Y2xpZGUgc2VydmVyXG4gICAgICAgICAgICAvLyAoY2VydGlmaWNhdGUgbWlzbWF0Y2gpLlxuICAgICAgICAgIGFkZEhlYXJ0YmVhdE5vdGlmaWNhdGlvbihIRUFSVEJFQVRfTk9USUZJQ0FUSU9OX0VSUk9SLCBjb2RlLFxuICAgICAgICAgICAgICAgICcqKkNvbm5lY3Rpb24gUmVzZXQgRXJyb3IqKjxici8+JyArXG4gICAgICAgICAgICAgICAgJ1RoaXMgY291bGQgYmUgY2F1c2VkIGJ5IHRoZSBjbGllbnQgY2VydGlmaWNhdGUgbWlzbWF0Y2hpbmcgdGhlICcgK1xuICAgICAgICAgICAgICAgICAgJ3NlcnZlciBjZXJ0aWZpY2F0ZS48YnIvPicgK1xuICAgICAgICAgICAgICAgICdQbGVhc2UgcmVsb2FkIEF0b20gdG8gcmVzdG9yZSB5b3VyIHJlbW90ZSBwcm9qZWN0IGNvbm5lY3Rpb24uJyxcbiAgICAgICAgICAgICAgICAvKmRpc21pc3NhYmxlKi8gdHJ1ZSxcbiAgICAgICAgICAgICAgICAvKmFza1RvUmVsb2FkKi8gdHJ1ZSk7XG4gICAgICAgICAgICAvLyBUT0RPKG1vc3QpOiByZWNvbm5lY3QgU2VydmVyQ29ubmVjdGlvbiwgcmVzdG9yZSB0aGUgY3VycmVudCBwcm9qZWN0IHN0YXRlLlxuICAgICAgICAgICAgLy8gYW5kIGZpbmFsbHkgY2hhbmdlIGRpc21pc3NhYmxlIHRvIGZhbHNlIGFuZCB0eXBlIHRvICdXQVJOSU5HJy5cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBub3RpZnlOZXR3b3JrQXdheShjb2RlKTtcbiAgICAgICAgICBsb2dnZXIuZXJyb3IoJ1VucmVjb25nbml6ZWQgaGVhcnRiZWF0IGVycm9yIGNvZGU6ICcgKyBjb2RlLCBtZXNzYWdlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9O1xuICAgIHNvY2tldC5vbignaGVhcnRiZWF0Jywgb25IZWFydGJlYXQpO1xuICAgIHNvY2tldC5vbignaGVhcnRiZWF0LmVycm9yJywgb25IZWFydGJlYXRFcnJvcik7XG5cbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBzb2NrZXQucmVtb3ZlTGlzdGVuZXIoJ2hlYXJ0YmVhdCcsIG9uSGVhcnRiZWF0KTtcbiAgICAgIHNvY2tldC5yZW1vdmVMaXN0ZW5lcignaGVhcnRiZWF0LmVycm9yJywgb25IZWFydGJlYXRFcnJvcik7XG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gIH1cbn1cbiJdfQ==