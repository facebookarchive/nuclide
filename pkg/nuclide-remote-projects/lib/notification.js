"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.humanizeErrorMessage = humanizeErrorMessage;
exports.notifySshHandshakeError = notifySshHandshakeError;

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

var _electron = require("electron");

function _escapeHtml() {
  const data = _interopRequireDefault(require("escape-html"));

  _escapeHtml = function () {
    return data;
  };

  return data;
}

var _child_process = _interopRequireDefault(require("child_process"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
function humanizeErrorMessage(errorType, error, config) {
  const originalErrorDetail = `Original error message:\n ${error.message}`; // This comes from people and people can't be trusted. Escape it before dumping it into the DOM.

  const host = (0, _escapeHtml().default)(config.host);
  const remoteServerCommand = (0, _escapeHtml().default)(config.remoteServerCommand);
  const cwd = (0, _escapeHtml().default)(config.cwd);
  const sshPort = (0, _escapeHtml().default)(config.sshPort.toString());
  const pathToPrivateKey = (0, _escapeHtml().default)(config.pathToPrivateKey);
  const authMethod = (0, _escapeHtml().default)(config.authMethod);

  const createTimeoutDetail = () => 'Troubleshooting:\n' + `Make sure you can run "sftp ${host}" on the command line.\n` + 'Check your .bashrc / .bash_profile for extraneous output.\n' + 'You may need to add the following to the top of your .bashrc:\n' + '  [ -z "$PS1" ] && return';

  switch (errorType) {
    case 'HOST_NOT_FOUND':
      return {
        title: `Can't resolve IP address for host ${host}.`,
        body: 'Troubleshooting:\n' + '  1. Check your network connection.\n' + `  2. Make sure the hostname ${host} is valid.\n`
      };

    case 'CANT_READ_PRIVATE_KEY':
      return {
        title: `Can't read content of private key path ${pathToPrivateKey}.`,
        body: 'Make sure the private key path is properly configured.\n' + 'You may need to convert your private key from PKCS to RSA.',
        originalErrorDetail
      };

    case 'SSH_CONNECT_TIMEOUT':
      return {
        title: `Timeout while connecting to ${host}.`,
        body: 'Troubleshooting:\n' + '  1. Check your network connection.\n' + '  2. Input correct 2Fac passcode when prompted.'
      };

    case 'SFTP_TIMEOUT':
      return {
        title: `Timeout while connecting to ${host}.`,
        body: createTimeoutDetail()
      };

    case 'USER_CANCELLED':
      return {
        title: `User cancelled while connecting to ${host}.`,
        body: createTimeoutDetail()
      };

    case 'SSH_CONNECT_FAILED':
      return {
        title: `Failed to connect to ${host}:${sshPort}.`,
        body: 'Troubleshooting:\n' + '  1. Check your network connection.\n' + `  2. Make sure the host ${host} is running and has` + ` ssh server running on ${sshPort}.`,
        originalErrorDetail
      };

    case 'SSH_AUTHENTICATION':
      switch (config.authMethod) {
        case _nuclideRemoteConnection().SshHandshake.SupportedMethods.PASSWORD:
          return {
            title: 'Password Authentication failed',
            body: 'Troubleshooting:\n' + '  1. Did you mean to choose password authentication?\n' + '  2. Make sure you provided the correct username and password.'
          };

        case _nuclideRemoteConnection().SshHandshake.SupportedMethods.PRIVATE_KEY:
          return {
            title: 'Private Key Authentication failed',
            body: 'Troubleshooting:\n' + '  1. Did you mean to choose private key authentication?\n' + '  2. Make sure your SSH private key is properly configured.'
          };

        case _nuclideRemoteConnection().SshHandshake.SupportedMethods.SSL_AGENT:
          return {
            title: 'SSL Agent Authentication failed',
            body: 'Troubleshooting:\n' + '  1. Did you mean to choose SSL agent authentication?\n' + '  2. Make sure your SSH connection is properly configured.'
          };

        default:
          return {
            title: 'Unknown SSH Authentication Method failed',
            body: `Unknown authentication method '${authMethod}' provided. Make sure your` + ' SSH connection is properly configured.'
          };
      }

    case 'DIRECTORY_NOT_FOUND':
      return {
        title: `There is no such directory ${cwd} on ${host}.`,
        body: `Make sure ${cwd} exists on ${host}.`
      };

    case 'SERVER_START_FAILED':
      return {
        title: `Failed to start nuclide-server on ${host} using  ` + `${remoteServerCommand}`,
        body: ['Troubleshooting:', `  1. Make sure the command "${remoteServerCommand}" is correct.`, '  2. The server might take longer to start up than expected, try to connect again.', `  3. If none of above works, ssh to ${host} and kill existing nuclide-server` + ' by running "killall node", and reconnect.'].join('\n'),
        originalErrorDetail
      };

    case 'SERVER_CANNOT_CONNECT':
      return {
        title: 'Unable to connect to server',
        body: ['The server successfully started, but we were unable to connect.'].join('\n'),
        originalErrorDetail
      };

    case 'CERT_NOT_YET_VALID':
      return {
        title: 'Your clock is behind',
        body: 'Your system clock is behind - unable to authenticate.\n' + 'Please check your date and time settings to continue.',
        originalErrorDetail
      };

    case 'UNKNOWN':
      return {
        title: `Unexpected error occurred: ${error.message}.`,
        originalErrorDetail
      };

    default:
      return {
        originalErrorDetail
      };
  }
}

function notifySshHandshakeError(errorType, error, config) {
  const {
    title,
    body,
    originalErrorDetail
  } = humanizeErrorMessage(errorType, error, config);
  let buttons = [];

  if (errorType === 'SSH_AUTHENTICATION' && // $FlowFixMe (>= v0.84.0) When a variable is equality-checked with a literal, the variable's type is refined.
  config.authMethod === 'CERT_NOT_YET_VALID') {
    buttons = [{
      className: 'icon icon-watch',
      text: 'Sync System Clock with Time Server',
      onDidClick: () => handleSyncDateTime(notification)
    }];
  }

  const notification = atom.notifications.addError(title || '', {
    detail: [body, originalErrorDetail].filter(Boolean).join('\n\n'),
    dismissable: true,
    buttons
  });
}

function handleSyncDateTime(notification) {
  switch (process.platform) {
    case 'darwin':
      _electron.shell.openItem('/System/Library/PreferencePanes/DateAndTime.prefPane');

      notification.dismiss();
      break;

    case 'win32':
      _child_process.default.spawn('powershell', ['-Command', 'Start-Process cmd.exe -Verb RunAs -ArgumentList {/c w32tm /resync}']);

      notification.onDidDismiss(() => {
        atom.notifications.addSuccess('System Time Synced', {
          detail: 'Your system time has been automatically synced with the time server.'
        });
      });
      notification.dismiss();
      break;

    default:
      notification.dismiss();
  }
}