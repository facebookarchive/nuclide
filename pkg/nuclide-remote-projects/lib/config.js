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

exports.getConnectionDialogDefaultSettings = getConnectionDialogDefaultSettings;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _commonsNodeUserInfo2;

function _commonsNodeUserInfo() {
  return _commonsNodeUserInfo2 = _interopRequireDefault(require('../../commons-node/userInfo'));
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

function getConnectionDialogDefaultSettings() {
  var _ref = (0, (_commonsNodeUserInfo2 || _commonsNodeUserInfo()).default)();

  var username = _ref.username;
  var homedir = _ref.homedir;

  return {
    server: '',
    username: username,
    // Do not use path.join() because we assume that the remote machine is *nix,
    // so we always want to use `/` as the path separator for cwd, even if Atom
    // is running on Windows.
    cwd: '/home/' + username + '/',
    pathToPrivateKey: (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(homedir, '.ssh', 'id_rsa'),
    remoteServerCommand: 'nuclide-start-server',
    authMethod: (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).SshHandshake.SupportedMethods.PASSWORD,
    displayTitle: '(default)',
    sshPort: '22'
  };
}