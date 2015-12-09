'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const path = require('path');
const {USER, HOME} = require('../../commons').env;

import type {NuclideRemoteConnectionParams} from './connection-types';


function getConnectionDialogDefaultSettings(): NuclideRemoteConnectionParams {
  return {
    server: '',
    username: USER,
    // Do not use path.join() because we assume that the remote machine is *nix,
    // so we always want to use `/` as the path separator for cwd, even if Atom
    // is running on Windows.
    cwd: `/home/${USER}/`,
    pathToPrivateKey: path.join(HOME, '.ssh', 'id_rsa'),
    remoteServerCommand: 'nuclide-start-server',
    authMethod: require('../../remote-connection').SshHandshake.SupportedMethods.PASSWORD,
    sshPort: '22',
  };
}

module.exports = {
  getConnectionDialogDefaultSettings,
};
