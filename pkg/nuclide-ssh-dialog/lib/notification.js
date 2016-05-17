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

exports.notifySshHandshakeError = notifySshHandshakeError;

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

function notifySshHandshakeError(errorType, error, config) {
  var message = '';
  var detail = '';
  var originalErrorDetail = 'Original error message:\n ' + error.message;
  switch (errorType) {
    case (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).SshHandshake.ErrorType.HOST_NOT_FOUND:
      message = 'Can\'t resolve IP address for host ' + config.host + '.';
      detail = 'Trouble shooting:\n' + '  1. Check your network connection.\n' + ('  2. Make sure the hostname ' + config.host + ' is valid.\n');
      break;
    case (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).SshHandshake.ErrorType.CANT_READ_PRIVATE_KEY:
      message = 'Can\'t read content of private key path ' + config.pathToPrivateKey + '.';
      detail = 'Make sure the private key path is properly configured.';
      break;
    case (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).SshHandshake.ErrorType.SSH_CONNECT_TIMEOUT:
      message = 'Timeout while connecting to ' + config.host + '.';
      detail = 'Trouble shooting:\n' + '  1. Check your network connection.\n' + '  2. Input correct 2Fac passcode when prompted.';
      break;
    case (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).SshHandshake.ErrorType.SSH_CONNECT_FAILED:
      message = 'Failed to connect to ' + config.host + ':' + config.sshPort + '.';
      detail = 'Trouble shooting:\n' + '  1. Check your network connection.\n' + ('  2. Make sure the host ' + config.host + ' is running and has') + (' ssh server running on ' + config.sshPort + '.\n\n') + originalErrorDetail;
      break;
    case (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).SshHandshake.ErrorType.SSH_AUTHENTICATION:
      message = 'Authentication failed';
      detail = 'Make sure your password or private key is properly configured.';
      break;
    case (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).SshHandshake.ErrorType.DIRECTORY_NOT_FOUND:
      message = 'There is no such directory ' + config.cwd + ' on ' + config.host + '.';
      detail = 'Make sure ' + config.cwd + ' exists on ' + config.host + '.';
      break;
    case (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).SshHandshake.ErrorType.SERVER_START_FAILED:
      message = 'Failed to start nuclide-server on ' + config.host + ' using  ' + ('' + config.remoteServerCommand);
      detail = 'Trouble shooting: \n' + ('  1. Make sure the command "' + config.remoteServerCommand + '" is correct.\n') + '  2. The server might take longer to start up than expected, try to connect again.\n' + ('  3. If none of above works, ssh to ' + config.host + ' and kill existing nuclide-server') + ' by running "killall node", and reconnect.';
      break;
    case (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).SshHandshake.ErrorType.SERVER_VERSION_MISMATCH:
      message = 'Server version is different than client version';
      detail = originalErrorDetail;
      break;
    default:
      message = 'Unexpected error occurred: ' + error.message + '.';
      detail = originalErrorDetail;
  }
  atom.notifications.addError(message, { detail: detail, dismissable: true });
}