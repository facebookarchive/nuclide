Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideServerLibNuclideSocket2;

function _nuclideServerLibNuclideSocket() {
  return _nuclideServerLibNuclideSocket2 = require('../../nuclide-server/lib/NuclideSocket');
}

var logger = require('../../nuclide-logging').getLogger();

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
      (0, (_assert2 || _assert()).default)(notification);
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
        addHeartbeatNotification(HEARTBEAT_NOTIFICATION_WARNING, code, 'Nuclide server cannot be reached at "' + serverUri + '".<br/>' + 'Nuclide will reconnect when the network is restored.',
        /*dismissable*/true,
        /*askToReload*/false);
      }
    };

    var onHeartbeatError = function onHeartbeatError(error) {
      var code = error.code;
      var message = error.message;
      var originalCode = error.originalCode;

      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackEvent)({
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
          var port = socket.getServerPort();
          addHeartbeatNotification(HEARTBEAT_NOTIFICATION_ERROR, code, '**Nuclide Server Is Not Reachable**<br/>' + ('It could be running on a port that is not accessible: ' + String(port) + '.'),
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
    this._subscription = new (_atom2 || _atom()).CompositeDisposable(socket.onHeartbeat(onHeartbeat), socket.onHeartbeatError(onHeartbeatError));
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