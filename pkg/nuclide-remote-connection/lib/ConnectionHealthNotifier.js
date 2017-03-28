'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConnectionHealthNotifier = undefined;

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _atom = require('atom');

var _NuclideSocket;

function _load_NuclideSocket() {
  return _NuclideSocket = require('../../nuclide-server/lib/NuclideSocket');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)(); /**
                                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                                              * All rights reserved.
                                                                              *
                                                                              * This source code is licensed under the license found in the LICENSE file in
                                                                              * the root directory of this source tree.
                                                                              *
                                                                              * 
                                                                              */

const HEARTBEAT_AWAY_REPORT_COUNT = 3;
const HEARTBEAT_NOTIFICATION_ERROR = 1;
const HEARTBEAT_NOTIFICATION_WARNING = 2;

// Provides feedback to the user of the health of a NuclideSocket.
class ConnectionHealthNotifier {

  constructor(host, socket) {
    this._heartbeatNetworkAwayCount = 0;
    this._lastHeartbeatNotification = null;

    const serverUri = socket.getServerUri();

    /**
     * Adds an Atom notification for the detected heartbeat network status
     * The function makes sure not to add many notifications for the same event and prioritize
     * new events.
     */
    const addHeartbeatNotification = (type, errorCode, message, dismissable, askToReload) => {
      const { code, notification: existingNotification } = this._lastHeartbeatNotification || {};
      if (code && code === errorCode && dismissable) {
        // A dismissible heartbeat notification with this code is already active.
        return;
      }
      let notification = null;
      const options = { dismissable, buttons: [] };
      if (askToReload) {
        options.buttons.push({
          className: 'icon icon-zap',
          onDidClick() {
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

      if (!notification) {
        throw new Error('Invariant violation: "notification"');
      }

      this._lastHeartbeatNotification = {
        notification,
        code: errorCode
      };
    };

    const onHeartbeat = () => {
      if (this._lastHeartbeatNotification) {
        // If there has been existing heartbeat error/warning,
        // that means connection has been lost and we shall show a message about connection
        // being restored without a reconnect prompt.
        const { notification } = this._lastHeartbeatNotification;
        notification.dismiss();
        atom.notifications.addSuccess('Connection restored to Nuclide Server at: ' + serverUri);
        this._heartbeatNetworkAwayCount = 0;
        this._lastHeartbeatNotification = null;
      }
    };

    const notifyNetworkAway = code => {
      this._heartbeatNetworkAwayCount++;
      if (this._heartbeatNetworkAwayCount >= HEARTBEAT_AWAY_REPORT_COUNT) {
        addHeartbeatNotification(HEARTBEAT_NOTIFICATION_WARNING, code, `Nuclide server cannot be reached at "${serverUri}".<br/>` + 'Nuclide will reconnect when the network is restored.',
        /* dismissable */true,
        /* askToReload */false);
      }
    };

    const onHeartbeatError = error => {
      const { code, message, originalCode } = error;
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackEvent)({
        type: 'heartbeat-error',
        data: {
          code: code || '',
          message: message || '',
          host
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
          /* dismissable */true,
          /* askToReload */true);
          // TODO(most) reconnect ServerConnection, restore the current project state,
          // and finally change dismissable to false and type to 'WARNING'.
          break;
        case 'PORT_NOT_ACCESSIBLE':
          // Notify never heard a heartbeat from the server.
          const port = socket.getServerPort();
          addHeartbeatNotification(HEARTBEAT_NOTIFICATION_ERROR, code, '**Nuclide Server Is Not Reachable**<br/>' + `It could be running on a port that is not accessible: ${String(port)}.`,
          /* dismissable */true,
          /* askToReload */false);
          break;
        case 'INVALID_CERTIFICATE':
          // Notify the client certificate is not accepted by nuclide server
          // (certificate mismatch).
          addHeartbeatNotification(HEARTBEAT_NOTIFICATION_ERROR, code, '**Connection Reset Error**<br/>' + 'This could be caused by the client certificate mismatching the ' + 'server certificate.<br/>' + 'Please reload Atom to restore your remote project connection.',
          /* dismissable */true,
          /* askToReload */true);
          // TODO(most): reconnect ServerConnection, restore the current project state.
          // and finally change dismissable to false and type to 'WARNING'.
          break;
        default:
          notifyNetworkAway(code);
          logger.error('Unrecongnized heartbeat error code: ' + code, message);
          break;
      }
    };
    this._subscription = new _atom.CompositeDisposable(socket.onHeartbeat(onHeartbeat), socket.onHeartbeatError(onHeartbeatError));
  }

  dispose() {
    this._subscription.dispose();
  }
}
exports.ConnectionHealthNotifier = ConnectionHealthNotifier;