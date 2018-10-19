"use strict";

function _createThriftServer() {
  const data = require("../createThriftServer");

  _createThriftServer = function () {
    return data;
  };

  return data;
}

function _thrift() {
  const data = _interopRequireDefault(require("thrift"));

  _thrift = function () {
    return data;
  };

  return data;
}

function portHelper() {
  const data = _interopRequireWildcard(require("../../../common/ports"));

  portHelper = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
const ThriftFileSystemServiceHandler = jest.fn(function (root, watchman) {
  this._watcher = watchman;
});
const mockPort = 9090;
jest.mock(require.resolve("../../../thrift-services/fs/ThriftFileSystemServiceHandler"), () => ({
  ThriftFileSystemServiceHandler
}));
jest.spyOn(portHelper(), 'scanPortsToListen').mockImplementation(async (server, ports) => true);
jest.spyOn(_thrift().default, 'createServer').mockImplementation(() => {
  return {
    address() {
      return {
        port: mockPort
      };
    },

    on(tag, cb) {},

    once(tag, cb) {},

    listen(port, cb) {},

    removeListener(tag, cb) {}

  };
});
test.skip('remote file system client factory function', async () => {
  const serverConfig = {
    name: 'thrift-rfs',
    remoteCommand: '',
    remoteCommandArgs: [],
    remoteConnection: {
      type: 'tcp',
      port: mockPort
    },
    killOldThriftServerProcess: true
  };
  const server = await (0, _createThriftServer().createThriftServer)(serverConfig);
  expect(server.getConnectionOptions()).toBe({
    port: mockPort
  });
});