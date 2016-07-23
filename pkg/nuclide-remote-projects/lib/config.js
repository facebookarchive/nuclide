'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideRemoteConnectionParams} from './connection-types';

import nuclideUri from '../../commons-node/nuclideUri';
import userInfo from '../../commons-node/userInfo';
import {SshHandshake} from '../../nuclide-remote-connection';

export function getConnectionDialogDefaultSettings(): NuclideRemoteConnectionParams {
  const {username, homedir} = userInfo();
  return {
    server: '',
    username,
    // Do not use path.join() because we assume that the remote machine is *nix,
    // so we always want to use `/` as the path separator for cwd, even if Atom
    // is running on Windows.
    cwd: `/home/${username}/`,
    pathToPrivateKey: nuclideUri.join(homedir, '.ssh', 'id_rsa'),
    remoteServerCommand: 'nuclide-start-server',
    authMethod: SshHandshake.SupportedMethods.PASSWORD,
    displayTitle: '(default)',
    sshPort: '22',
  };
}
