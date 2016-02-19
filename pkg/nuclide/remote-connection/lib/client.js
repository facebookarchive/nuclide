'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../remote-uri';
import type {RemoteFile} from './RemoteFile';

const {RemoteConnection} = require('./RemoteConnection');
const {isRemote} = require('../../remote-uri');

module.exports = {
  getFileForPath(filePath: NuclideUri): ?(atom$File | RemoteFile) {
    if (isRemote(filePath)) {
      const connection = RemoteConnection.getForUri(filePath);
      if (!connection) {
        return null;
      }
      return connection.createFile(filePath);
    } else {
      const {File} = require('atom');
      return new File(filePath);
    }
  },
};
