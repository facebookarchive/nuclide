'use babel';
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* @flow */

var path = require('path');

function getConnectionDialogDefaultSettings(): mixed {
  var username = process.env.USER;
  return {
    host: '',
    username: username,
    cwd: path.join('/home', username),
    pathToPrivateKey: path.join(process.env.HOME, '.ssh/id_rsa'),
    useSshAgent: false,
    remoteServerCommand: path.join(process.env.HOME, '.nuclide', 'start-nuclide-server'),
    sshPort: 22,
  };
}

module.exports = {
  getConnectionDialogDefaultSettings,
};
