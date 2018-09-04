/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {
  SshConnectionConfiguration,
  SshHandshakeErrorType,
} from '../../nuclide-remote-connection/lib/SshHandshake';

import {SshHandshake} from '../../nuclide-remote-connection';

import {shell} from 'electron';
import escapeHtml from 'escape-html';
import child_process from 'child_process';

const NUCLIDE_CANT_CONNECT_URL = 'http://fburl.com/nuclidecantconnect';

export function notifySshHandshakeError(
  errorType: SshHandshakeErrorType,
  error: Error,
  config: SshConnectionConfiguration,
): void {
  let message = '';
  let detail = '';
  let buttons = [];
  const originalErrorDetail = `Original error message:\n ${error.message}`;

  // This comes from people and people can't be trusted. Escape it before dumping it into the DOM.
  const host = escapeHtml(config.host);
  const remoteServerCommand = escapeHtml(config.remoteServerCommand);
  const cwd = escapeHtml(config.cwd);
  const sshPort = escapeHtml(config.sshPort.toString());
  const pathToPrivateKey = escapeHtml(config.pathToPrivateKey);
  const authMethod = escapeHtml(config.authMethod);

  const createTimeoutDetail = () =>
    'Troubleshooting:\n' +
    `Make sure you can run "sftp ${host}" on the command line.\n` +
    'Check your .bashrc / .bash_profile for extraneous output.\n' +
    'You may need to add the following to the top of your .bashrc:\n' +
    '  [ -z "$PS1" ] && return';

  switch (errorType) {
    case 'HOST_NOT_FOUND':
      message = `Can't resolve IP address for host ${host}.`;
      detail =
        'Troubleshooting:\n' +
        '  1. Check your network connection.\n' +
        `  2. Make sure the hostname ${host} is valid.\n`;
      break;
    case 'CANT_READ_PRIVATE_KEY':
      message = `Can't read content of private key path ${pathToPrivateKey}.`;
      detail =
        'Make sure the private key path is properly configured.\n' +
        'You may need to convert your private key from PKCS to RSA.\n' +
        originalErrorDetail;
      break;
    case 'SSH_CONNECT_TIMEOUT':
      message = `Timeout while connecting to ${host}.`;
      detail =
        'Troubleshooting:\n' +
        '  1. Check your network connection.\n' +
        '  2. Input correct 2Fac passcode when prompted.';
      break;
    case 'SFTP_TIMEOUT':
      message = `Timeout while connecting to ${host}.`;
      detail = createTimeoutDetail();
      break;
    case 'USER_CANCELLED':
      message = `User cancelled while connecting to ${host}.`;
      detail = createTimeoutDetail();
      break;
    case 'SSH_CONNECT_FAILED':
      message = `Failed to connect to ${host}:${sshPort}.`;
      detail =
        'Troubleshooting:\n' +
        '  1. Check your network connection.\n' +
        `  2. Make sure the host ${host} is running and has` +
        ` ssh server running on ${sshPort}.\n\n` +
        originalErrorDetail;
      break;
    case 'SSH_AUTHENTICATION':
      switch (config.authMethod) {
        case SshHandshake.SupportedMethods.PASSWORD:
          message = 'Password Authentication failed';
          detail =
            'Troubleshooting:\n' +
            '  1. Did you mean to choose password authentication?\n' +
            '  2. Make sure you provided the correct username and password.';
          break;
        case SshHandshake.SupportedMethods.PRIVATE_KEY:
          message = 'Private Key Authentication failed';
          detail =
            'Troubleshooting:\n' +
            '  1. Did you mean to choose private key authentication?\n' +
            '  2. Make sure your SSH private key is properly configured.';
          break;
        case SshHandshake.SupportedMethods.SSL_AGENT:
          message = 'SSL Agent Authentication failed';
          detail =
            'Troubleshooting:\n' +
            '  1. Did you mean to choose SSL agent authentication?\n' +
            '  2. Make sure your SSH connection is properly configured.';
          break;
        default:
          message = 'Unknown SSH Authentication Method failed';
          detail =
            `Unknown authentication method '${authMethod}' provided. Make sure your` +
            ' SSH connection is properly configured.';
          break;
      }
      break;
    case 'DIRECTORY_NOT_FOUND':
      message = `There is no such directory ${cwd} on ${host}.`;
      detail = `Make sure ${cwd} exists on ${host}.`;
      break;
    case 'SERVER_START_FAILED':
      message =
        `Failed to start nuclide-server on ${host} using  ` +
        `${remoteServerCommand}`;
      detail =
        'Troubleshooting: \n' +
        `  1. Make sure the command "${remoteServerCommand}" is correct.\n` +
        '  2. The server might take longer to start up than expected, try to connect again.\n' +
        `  3. If none of above works, ssh to ${host} and kill existing nuclide-server` +
        ' by running "killall node", and reconnect.\n' +
        // @fb-only: '  4. If that still fails, you can try the remediation steps at' +
        // @fb-only: ` ${NUCLIDE_CANT_CONNECT_URL}\n\n\n` +
        originalErrorDetail;
      break;
    case 'SERVER_CANNOT_CONNECT':
      message = 'Unable to connect to server';
      detail =
        'The server successfully started, but we were unable to connect.\n' +
        // @fb-only: 'Troubleshooting: \n' +
        // @fb-only: `  1. Try the remediation steps at ${NUCLIDE_CANT_CONNECT_URL}\n\n\n` +
        originalErrorDetail;
      break;
    case 'CERT_NOT_YET_VALID':
      message = 'Your clock is behind';
      detail =
        'Your system clock is behind - unable to authenticate.\n' +
        'Please check your date and time settings to continue.\n\n' +
        originalErrorDetail;
      buttons = [
        {
          className: 'icon icon-watch',
          text: 'Sync System Clock with Time Server',
          onDidClick: () => handleSyncDateTime(notification),
        },
      ];
      break;
    case 'UNKNOWN':
      message = `Unexpected error occurred: ${error.message}.`;
      detail = originalErrorDetail;
      break;
    default:
      (errorType: empty);
      detail = originalErrorDetail;
  }

  const notification = atom.notifications.addError(message, {
    detail,
    dismissable: true,
    buttons,
  });
}

function handleSyncDateTime(notification) {
  switch (process.platform) {
    case 'darwin':
      shell.openItem('/System/Library/PreferencePanes/DateAndTime.prefPane');
      notification.dismiss();
      break;
    case 'win32':
      child_process.spawn('powershell', [
        '-Command',
        'Start-Process cmd.exe -Verb RunAs -ArgumentList {/c w32tm /resync}',
      ]);
      notification.onDidDismiss(() => {
        atom.notifications.addSuccess('System Time Synced', {
          detail:
            'Your system time has been automatically synced with the time server.',
        });
      });
      notification.dismiss();
      break;
    default:
      notification.dismiss();
  }
}
