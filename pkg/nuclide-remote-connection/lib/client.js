'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';
import type {RemoteFile} from './RemoteFile';

import {File} from 'atom';
import {ServerConnection} from './ServerConnection';
import {isRemote} from '../../nuclide-remote-uri';

module.exports = {
  getFileForPath(filePath: NuclideUri): ?(atom$File | RemoteFile) {
    if (isRemote(filePath)) {
      const connection = ServerConnection.getForUri(filePath);
      if (!connection) {
        return null;
      }
      return connection.createFile(filePath);
    } else {
      return new File(filePath);
    }
  },
};
