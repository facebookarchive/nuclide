'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {getFileForPath} = require('../lib/main');
var {RemoteConnection, RemoteFile} = require('nuclide-remote-connection');
var {File} = require('atom');

describe('getFileForPath()', () => {

  var connectedRemoteUri = 'nuclide://server:123/abs';
  var connection = null;

  beforeEach(() => {
    spyOn(RemoteConnection, 'getForUri').andCallFake(uri => {
      if (!uri.startsWith(connectedRemoteUri)) {
        return null;
      }
      if (!connection) {
        connection = new RemoteConnection({host: 'server', port: 123});
      }
      return connection;
    });
  });

  it('returns a local File if the path is a local path', () => {
    var localFile = getFileForPath(__filename);
    expect(localFile instanceof File).toBe(true);
  });

  it('returns a remote File if the path is a remote path that has a valid connection', () => {
    var remoteFile = getFileForPath(`${connectedRemoteUri}/dir/file.txt`);
    expect(remoteFile instanceof RemoteFile).toBe(true);
  });

  it('returns null if path is remote with no valid connection', () => {
    var remoteFile = getFileForPath('nuclide://no-conn-server:123/dir/file.txt');
    expect(remoteFile).toBe(null);
  });
});
