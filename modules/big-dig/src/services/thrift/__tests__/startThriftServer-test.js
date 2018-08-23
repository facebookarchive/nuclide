/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+nuclide
 * @flow
 * @format
 */

jest.mock('log4js');
jest.mock(require.resolve('../../../../../nuclide-commons/which'));

import {getLogger} from 'log4js';
import * as processModule from 'nuclide-commons/process';
import {Observable} from 'rxjs';
import which from 'nuclide-commons/which';
import {genConfigId} from 'big-dig/src/services/thrift/config-utils';
import {startThriftServer} from '../startThriftServer';
import net from 'net';
import {getMock} from '../../../../../../jest/jest_mock_utils';

const logger = getLogger();

describe('startThriftServer', () => {
  let serverPort;

  describe('thrift server runs', () => {
    let listener: net.Server;
    let baseConfig;

    beforeAll(async () => {
      await new Promise(resolve => {
        listener = net.createServer(socket => {});
        listener.listen({port: 0}, () => {
          serverPort = listener.address().port;
          baseConfig = {
            name: 'thriftservername',
            remoteCommand: 'test',
            remoteCommandArgs: ['--server-port', String(serverPort)],
            remotePort: serverPort,
            killOldThriftServerProcess: true,
          };
          resolve();
        });
      });
    });

    beforeEach(() => {
      jest.resetAllMocks();
      (which: any).mockImplementation(cmd => cmd);
    });

    afterAll(async () => {
      await new Promise(resolve => {
        listener.close(resolve);
      });
    });

    it('kills old server', async () => {
      // there is one server running
      const oldProcessInfo = {
        parentPid: 0,
        pid: 1,
        command: 'test',
        commandWithArgs: `test --server-port ${serverPort}`,
      };
      jest
        .spyOn(processModule, 'psTree')
        .mockReturnValue(Promise.resolve([oldProcessInfo]));
      // thrift server's messages
      jest
        .spyOn(processModule, 'observeProcess')
        .mockImplementation(command => {
          if (command === 'test') {
            return Observable.empty();
          }
          throw new Error('invalid command');
        });
      const spy = jest
        .spyOn(processModule, 'killPid')
        .mockImplementation(pid => {});

      await startThriftServer(baseConfig)
        .refCount()
        .take(1)
        .toPromise();
      expect(spy).toBeCalledWith(oldProcessInfo.pid);
    });

    it('ignores old thrift server and try to start a new one', async () => {
      // there is one server running
      const oldProcessInfo = {
        parentPid: 0,
        pid: 1,
        command: 'test',
        commandWithArgs: `test --server-port ${serverPort}`,
      };
      jest
        .spyOn(processModule, 'psTree')
        .mockReturnValue(Promise.resolve([oldProcessInfo]));
      // thrift server's messages
      jest
        .spyOn(processModule, 'observeProcess')
        .mockImplementation(command => {
          if (command === 'test') {
            return Observable.empty();
          }
          throw new Error('invalid command');
        });
      const spy = jest
        .spyOn(processModule, 'killPid')
        .mockImplementation(pid => {});

      await startThriftServer({
        ...baseConfig,
        killOldThriftServerProcess: false,
      })
        .refCount()
        .take(1)
        .toPromise();
      expect(spy).not.toBeCalledWith(oldProcessInfo.pid);
    });

    it('communicates server is ready', async () => {
      // there is no process running
      jest.spyOn(processModule, 'psTree').mockReturnValue(Promise.resolve([]));
      // thrift server's messages
      jest
        .spyOn(processModule, 'observeProcess')
        .mockImplementation(command => {
          if (command === 'test') {
            return Observable.empty();
          }
          throw new Error('invalid command');
        });

      const serverMessage = await startThriftServer(baseConfig)
        .refCount()
        .take(1)
        .toPromise();
      expect(serverMessage).toEqual('ready');
    });

    it('caches servers', async () => {
      // there is no process running
      jest.spyOn(processModule, 'psTree').mockReturnValue(Promise.resolve([]));
      // thrift server's messages
      jest
        .spyOn(processModule, 'observeProcess')
        .mockImplementation(command => {
          if (command === 'test') {
            return Observable.empty();
          }
          throw new Error('invalid command');
        });

      // start first server
      const observableServerA = await startThriftServer(baseConfig);
      const promiseStatusA = observableServerA.take(1).toPromise();
      const subscriptonA = observableServerA.connect();
      const statusA = await promiseStatusA;
      expect(statusA).toBe('ready');

      // we must have one log entry after start the first server
      expect(getMock(logger.info)).toHaveBeenCalledTimes(1);
      // $FlowFixMe
      expect(getMock(logger.info)).toHaveBeenNthCalledWith(
        1,
        '(thriftservername) ',
        'Thrift Server is ready',
      );

      // start second server which reuses the process from the first server
      const observableServerB = await startThriftServer(baseConfig);
      const promiseStatusB = observableServerB.take(1).toPromise();
      const subscriptonB = observableServerB.connect();
      const statusB = await promiseStatusB;
      expect(statusB).toBe('ready');

      // release observableServerA but don't kill the server process
      subscriptonA.unsubscribe();
      expect(logger.info).toHaveBeenCalledTimes(1);

      // release observableServerB and kill server process
      subscriptonB.unsubscribe();
      expect(logger.info).toHaveBeenCalledTimes(2);
      // $FlowFixMe
      expect(logger.info).toHaveBeenNthCalledWith(
        2,
        'Thrift Server has been closed ',
        genConfigId(baseConfig),
      );
    });
  });

  describe('thrift server does not run', () => {
    it('throws when server failed to be ready', async () => {
      // there is no process running
      jest.spyOn(processModule, 'psTree').mockReturnValue(Promise.resolve([]));
      // thrift server's messages
      jest
        .spyOn(processModule, 'observeProcess')
        .mockImplementation(command => {
          if (command === 'test') {
            return Observable.empty();
          }
          throw new Error('invalid command');
        });
      // ignore timers
      jest.spyOn(Observable, 'timer').mockImplementation(() => {
        return Observable.of(1);
      });
      // make remote command valid
      (which: any).mockImplementation(cmd => cmd);
      // port with no servers running
      const serverPort2 = 1;
      expect(
        startThriftServer({
          name: 'thriftservername',
          remoteCommand: 'test',
          remoteCommandArgs: ['--server-port', String(serverPort)],
          remotePort: serverPort2,
          killOldThriftServerProcess: true,
        })
          .refCount()
          .take(1)
          .toPromise(),
      ).rejects.toThrow(
        /Occurred an error when connecting to the thrift server|Connection closed but server is not ready/,
      );
    });
  });
});
