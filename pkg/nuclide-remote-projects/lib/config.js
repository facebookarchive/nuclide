'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConnectionDialogDefaultSettings = getConnectionDialogDefaultSettings;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _userInfo2;

function _load_userInfo() {
  return _userInfo2 = _interopRequireDefault(require('../../commons-node/userInfo'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getConnectionDialogDefaultSettings() {
  var _userInfo = (0, (_userInfo2 || _load_userInfo()).default)();

  const username = _userInfo.username,
        homedir = _userInfo.homedir;

  return {
    server: '',
    username: username,
    // Do not use path.join() because we assume that the remote machine is *nix,
    // so we always want to use `/` as the path separator for cwd, even if Atom
    // is running on Windows.
    cwd: `/home/${ username }/`,
    pathToPrivateKey: (_nuclideUri || _load_nuclideUri()).default.join(homedir, '.ssh', 'id_rsa'),
    remoteServerCommand: 'nuclide-start-server',
    authMethod: (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).SshHandshake.SupportedMethods.PASSWORD,
    displayTitle: '(default)',
    sshPort: '22'
  };
}