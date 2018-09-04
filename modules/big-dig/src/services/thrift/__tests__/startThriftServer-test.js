"use strict";

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function processModule() {
  const data = _interopRequireWildcard(require("../../../../../nuclide-commons/process"));

  processModule = function () {
    return data;
  };

  return data;
}

function serverPortModule() {
  const data = _interopRequireWildcard(require("../../../../../nuclide-commons/serverPort"));

  serverPortModule = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _which() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/which"));

  _which = function () {
    return data;
  };

  return data;
}

function _configUtils() {
  const data = require("../config-utils");

  _configUtils = function () {
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

function _jest_mock_utils() {
  const data = require("../../../../../../jest/jest_mock_utils");

  _jest_mock_utils = function () {
    return data;
  };

  return data;
}

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
jest.mock('log4js');
jest.mock(require.resolve("../../../../../nuclide-commons/which"));
const logger = (0, _log4js().getLogger)();
describe('startThriftServer', () => {
  let serverPort;
  beforeEach(() => {
    jest.resetAllMocks();

    _which().default.mockImplementation(cmd => cmd);
  });
  describe('config', () => {
    it('throws if remote command is not valid', async () => {
      // all commands are invalid
      _which().default.mockImplementation(cmd => null);

      await expect((0, _startThriftServer().startThriftServer)({
        name: 'thriftservername',
        remoteCommand: 'test',
        remoteCommandArgs: [],
        remotePort: 123,
        killOldThriftServerProcess: true
      }).refCount().take(1).toPromise()).rejects.toThrow('Remote command not found: test');
    });
    it('throws if remote port is 0 but "{PORT}" is not part of arguments', async () => {
      await expect((0, _startThriftServer().startThriftServer)({
        name: 'thriftservername',
        remoteCommand: 'test',
        remoteCommandArgs: [],
        remotePort: 0,
        killOldThriftServerProcess: true
      }).refCount().take(1).toPromise()).rejects.toThrow('Expected placeholder "{PORT}" for remote port');
    });
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
            remotePort: serverPort,
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
    it('computes remote port', async () => {
      // there is no process running
      jest.spyOn(processModule(), 'psTree').mockReturnValue(Promise.resolve([])); // all commands are invalid

      _which().default.mockImplementation(cmd => cmd); // thrift server's messages


      jest.spyOn(processModule(), 'observeProcess').mockImplementation(command => {
        if (command === 'test') {
          return _RxMin.Observable.empty();
        }

        throw new Error('invalid command');
      }); // available port

      jest.spyOn(serverPortModule(), 'getAvailableServerPort').mockReturnValue(baseConfig.remotePort);
      expect((await (0, _startThriftServer().startThriftServer)({
        name: 'thriftservername',
        remoteCommand: 'test',
        remoteCommandArgs: ['--port', '{PORT}'],
        remotePort: 0,
        killOldThriftServerProcess: true
      }).refCount().take(1).toPromise())).toBe(baseConfig.remotePort);
    });
    it('kills old server', async () => {
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
          return _RxMin.Observable.empty();
        }

        throw new Error('invalid command');
      });
      const spy = jest.spyOn(processModule(), 'killPid').mockImplementation(pid => {});
      await (0, _startThriftServer().startThriftServer)(baseConfig).refCount().take(1).toPromise();
      expect(spy).toBeCalledWith(oldProcessInfo.pid);
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
          return _RxMin.Observable.empty();
        }

        throw new Error('invalid command');
      });
      const spy = jest.spyOn(processModule(), 'killPid').mockImplementation(pid => {});
      await (0, _startThriftServer().startThriftServer)(Object.assign({}, baseConfig, {
        killOldThriftServerProcess: false
      })).refCount().take(1).toPromise();
      expect(spy).not.toBeCalledWith(oldProcessInfo.pid);
    });
    it('communicates server is ready', async () => {
      // there is no process running
      jest.spyOn(processModule(), 'psTree').mockReturnValue(Promise.resolve([])); // thrift server's messages

      jest.spyOn(processModule(), 'observeProcess').mockImplementation(command => {
        if (command === 'test') {
          return _RxMin.Observable.empty();
        }

        throw new Error('invalid command');
      });
      const serverMessage = await (0, _startThriftServer().startThriftServer)(baseConfig).refCount().take(1).toPromise();
      expect(serverMessage).toEqual(baseConfig.remotePort);
    });
    it('caches servers', async () => {
      // there is no process running
      jest.spyOn(processModule(), 'psTree').mockReturnValue(Promise.resolve([])); // thrift server's messages

      jest.spyOn(processModule(), 'observeProcess').mockImplementation(command => {
        if (command === 'test') {
          return _RxMin.Observable.empty();
        }

        throw new Error('invalid command');
      }); // start first server

      const observableServerA = await (0, _startThriftServer().startThriftServer)(baseConfig);
      const promiseStatusA = observableServerA.take(1).toPromise();
      const subscriptonA = observableServerA.connect();
      const statusA = await promiseStatusA;
      expect(statusA).toBe(baseConfig.remotePort); // we must have one log entry after start the first server

      expect((0, _jest_mock_utils().getMock)(logger.info)).toHaveBeenCalledTimes(1); // $FlowFixMe

      expect((0, _jest_mock_utils().getMock)(logger.info)).toHaveBeenNthCalledWith(1, '(thriftservername) ', 'Thrift Server is ready'); // start second server which reuses the process from the first server

      const observableServerB = await (0, _startThriftServer().startThriftServer)(baseConfig);
      const promiseStatusB = observableServerB.take(1).toPromise();
      const subscriptonB = observableServerB.connect();
      const statusB = await promiseStatusB;
      expect(statusB).toBe(baseConfig.remotePort); // release observableServerA but don't kill the server process

      subscriptonA.unsubscribe();
      expect(logger.info).toHaveBeenCalledTimes(1); // release observableServerB and kill server process

      subscriptonB.unsubscribe();
      expect(logger.info).toHaveBeenCalledTimes(2); // $FlowFixMe

      expect(logger.info).toHaveBeenNthCalledWith(2, 'Thrift Server has been closed ', (0, _configUtils().genConfigId)(baseConfig));
    });
  });
  describe('thrift server does not run', () => {
    it('throws when server failed to be ready', async () => {
      // there is no process running
      jest.spyOn(processModule(), 'psTree').mockReturnValue(Promise.resolve([])); // thrift server's messages

      jest.spyOn(processModule(), 'observeProcess').mockImplementation(command => {
        if (command === 'test') {
          return _RxMin.Observable.empty();
        }

        throw new Error('invalid command');
      }); // ignore timers

      jest.spyOn(_RxMin.Observable, 'timer').mockImplementation(() => {
        return _RxMin.Observable.of(0);
      }); // port with no servers running

      const serverPort2 = 1;
      await expect((0, _startThriftServer().startThriftServer)({
        name: 'thriftservername',
        remoteCommand: 'test',
        remoteCommandArgs: ['--server-port', String(serverPort)],
        remotePort: serverPort2,
        killOldThriftServerProcess: true
      }).refCount().take(1).toPromise()).rejects.toThrow(/Occurred an error when connecting to the thrift server|Connection closed but server is not ready/);
    });
  });
});