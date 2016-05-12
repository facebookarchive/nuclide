function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _path2;

function _path() {
  return _path2 = _interopRequireDefault(require('path'));
}

var _nuclideCommons2;

function _nuclideCommons() {
  return _nuclideCommons2 = require('../../nuclide-commons');
}

function getConnectionDialogDefaultSettings() {
  return {
    server: '',
    username: (_nuclideCommons2 || _nuclideCommons()).env.USER,
    // Do not use path.join() because we assume that the remote machine is *nix,
    // so we always want to use `/` as the path separator for cwd, even if Atom
    // is running on Windows.
    cwd: '/home/' + (_nuclideCommons2 || _nuclideCommons()).env.USER + '/',
    pathToPrivateKey: (_path2 || _path()).default.join((_nuclideCommons2 || _nuclideCommons()).env.HOME, '.ssh', 'id_rsa'),
    remoteServerCommand: 'nuclide-start-server',
    authMethod: require('../../nuclide-remote-connection').SshHandshake.SupportedMethods.PASSWORD,
    sshPort: '22'
  };
}

module.exports = {
  getConnectionDialogDefaultSettings: getConnectionDialogDefaultSettings
};