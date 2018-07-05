/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {ThriftServerConfig} from '../types';

import {RemoteFileSystemServer} from '../../fs/fsServer';
import {expect, jest} from 'nuclide-jest/globals';
import {createThriftServer} from '../createThriftServer';
import thrift from 'thrift';
import * as portHelper from '../../../common/ports';

const RemoteFileSystemServiceHandler = jest.fn(function(root, watchman) {
  this._watcher = watchman;
});
const mockPort = 9090;

jest.mock(require.resolve('../../fs/RemoteFileSystemServiceHandler'), () => ({
  RemoteFileSystemServiceHandler,
}));

jest
  .spyOn(portHelper, 'scanPortsToListen')
  .mockImplementation(async (server: any, ports: string) => true);

jest.spyOn(thrift, 'createServer').mockImplementation(function() {
  return {
    address: function() {
      return {port: mockPort};
    },
    on: function(tag: string, cb: any) {},
    once: function(tag: string, cb: any) {},
    listen: function(port: number, cb: any) {},
    removeListener: function(tag: string, cb: any) {},
  };
});

test('remote file system client factory function', async () => {
  const serverConfig: ThriftServerConfig = {
    name: 'thrift-rfs',
    remoteCommand: '',
    remoteCommandArgs: [],
    remotePort: mockPort,
    killOldThriftServerProcess: true,
  };
  const server = await createThriftServer(serverConfig);
  expect(server.getPort()).toBe(mockPort);
});
