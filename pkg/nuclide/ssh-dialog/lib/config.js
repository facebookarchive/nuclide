'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var path = require('path');
var {USER, HOME} = require('nuclide-commons').env;

function getConnectionDialogDefaultSettings(): any {
  return {
    host: '',
    username: USER,
    // Do not use path.join() because we assume that the remote machine is *nix,
    // so we always want to use `/` as the path separator for cwd, even if Atom
    // is running on Windows.
    cwd: `/home/${USER}/`,
    pathToPrivateKey: path.join(HOME, '.ssh', 'id_rsa'),
    remoteServerCommand: 'nuclide-start-server',
    authMethod: require('nuclide-remote-connection').SshHandshake.SupportedMethods.PASSWORD,
    sshPort: 22,
  };
}

module.exports = {
  getConnectionDialogDefaultSettings,
};
