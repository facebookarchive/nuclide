"use strict";

function processModule() {
  const data = _interopRequireWildcard(require("../../../../../nuclide-commons/process"));

  processModule = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _which() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/which"));

  _which = function () {
    return data;
  };

  return data;
}

function _startThriftServer() {
  const data = require("../startThriftServer");

  _startThriftServer = function () {
    return data;
  };

  return data;
}

var _net = _interopRequireDefault(require("net"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+nuclide
 * 
 * @format
 */
jest.mock(require.resolve("../../../../../nuclide-commons/which"));
describe('startThriftServer', () => {
  let serverPort;
  beforeEach(() => {
    jest.resetAllMocks();

    _which().default.mockImplementation(cmd => cmd);
  });
  describe('thrift server runs', () => {
    let listener;
    let baseConfig;
    beforeAll(async () => {
      await new Promise(resolve => {
        listener = _net.default.createServer(socket => {});
        listener.listen({
          port: 0
        }, () => {
          serverPort = listener.address().port;
          baseConfig = {
            name: 'thriftservername',
            remoteCommand: 'test',
            remoteCommandArgs: ['--server-port', String(serverPort)],
            remoteConnection: {
              type: 'tcp',
              port: serverPort
            },
            killOldThriftServerProcess: true
          };
          resolve();
        });
      });
    });
    afterAll(async () => {
      await new Promise(resolve => {
        listener.close(resolve);
      });
    });
    it('ignores old thrift server and try to start a new one', async () => {
      // there is one server running
      const oldProcessInfo = {
        parentPid: 0,
        pid: 1,
        command: 'test',
        commandWithArgs: `test --server-port ${serverPort}`
      };
      jest.spyOn(processModule(), 'psTree').mockReturnValue(Promise.resolve([oldProcessInfo])); // thrift server's messages

      jest.spyOn(processModule(), 'observeProcess').mockImplementation(command => {
        if (command === 'test') {
          return _rxjsCompatUmdMin.Observable.empty();
        }

        throw new Error('invalid command');
      });
      const spy = jest.spyOn(processModule(), 'killPid').mockImplementation(pid => {});
      await (0, _startThriftServer().startThriftServer)(Object.assign({}, baseConfig, {
        killOldThriftServerProcess: false
      })).refCount().take(1).toPromise();
      expect(spy).not.toBeCalledWith(oldProcessInfo.pid);
    });
  });
});