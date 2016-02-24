'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {RemoteConnection} from '../../remote-connection';

import fsPlus from 'fs-plus';
import {fsPromise} from '../../commons';
import {RemoteDirectory} from '../lib/RemoteDirectory';
import {RemoteFile} from '../lib/RemoteFile';
/*
 * Match the signature of `NuclideClient::newFile`:
 *
 *     newFile(path: string): Promise<boolean>
 */
// $FlowIgnore mock override.
fsPromise.newFile = async function(path) {
  return true;
};

// $FlowIgnore mock override.
fsPromise.copy = async function(src, dst) {
  await new Promise((resolve, reject) => {
    fsPlus.copy(src, dst, error => {
      error ? reject(error) : resolve();
    });
  });
  return true;
};

const connectionMock: RemoteConnection & { getFsService(): Object } = ({
  getFsService: () => fsPromise,
  createDirectory: uri => new RemoteDirectory(connectionMock, uri),
  createFile: uri => new RemoteFile(connectionMock, uri),
  getService: (serviceName: string) => {
    if (serviceName === 'FileSystemService') {
      return fsPromise;
    } else {
      throw new Error(`TODO: missing mock ${serviceName}`);
    }
  },
}: any);

module.exports = connectionMock;
