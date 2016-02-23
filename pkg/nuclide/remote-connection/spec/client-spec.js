'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {getFileForPath} = require('../lib/client');
const {RemoteConnection, RemoteFile} = require('../lib/main');
const {File} = require('atom');

describe('getFileForPath()', () => {

  const connectedRemoteUri = 'nuclide://server:123/abs';
  let connection = null;

  beforeEach(() => {
    spyOn(RemoteConnection, 'getForUri').andCallFake(uri => {
      if (!uri.startsWith(connectedRemoteUri)) {
        return null;
      }
      if (!connection) {
        const server: any = {
          getRemoteHost() {
            return 'server';
          },
          port: 123,
        };
        connection = new RemoteConnection(server, '');
        // $FlowFixMe Skip the usage of the watcher service.
        connection._addHandlersForEntry = () => {};
      }
      return connection;
    });
  });

  it('returns a local File if the path is a local path', () => {
    const localFile = getFileForPath(__filename);
    expect(localFile instanceof File).toBe(true);
  });

  it('returns a remote File if the path is a remote path that has a valid connection', () => {
    const remoteFile = getFileForPath(`${connectedRemoteUri}/dir/file.txt`);
    expect(remoteFile instanceof RemoteFile).toBe(true);
  });

  it('returns null if path is remote with no valid connection', () => {
    const remoteFile = getFileForPath('nuclide://no-conn-server:123/dir/file.txt');
    expect(remoteFile).toBe(null);
  });
});
