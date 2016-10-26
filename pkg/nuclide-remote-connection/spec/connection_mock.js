'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ServerConnection} from '..';

import fsPromise from '../../commons-node/fsPromise';
import {RemoteDirectory} from '../lib/RemoteDirectory';
import {RemoteFile} from '../lib/RemoteFile';

const fsService = {
  ...fsPromise,
  async newFile(path) {
    return true;
  },
  async copy(src, dst) {
    await fsPromise.copy(src, dst);
    return true;
  },
};

const connectionMock: ServerConnection & { getFsService(): Object } = ({
  getFsService: () => fsService,
  createDirectory: uri => new RemoteDirectory(connectionMock, uri),
  createFile: uri => new RemoteFile(connectionMock, uri),
  getRemoteConnectionForUri: () => null,
  getService: (serviceName: string) => {
    if (serviceName === 'FileSystemService') {
      return fsService;
    } else {
      throw new Error(`TODO: missing mock ${serviceName}`);
    }
  },
  getFileWatch: () => {
    throw new Error('mock me');
  },
  getDirectoryWatch: () => {
    throw new Error('mock me');
  },
}: any);

module.exports = connectionMock;
