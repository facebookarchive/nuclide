'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import typeof * as DummyService from './DummyService';

import path from 'path';
import invariant from 'assert';
import {safeSpawn} from '../process';
import RpcProcess from '../RpcProcess';
import {ServiceRegistry} from '../../nuclide-rpc';

const PROCESS_PATH = path.join(__dirname, '/fixtures/dummyioserver.py');
const OPTS = {
  cwd: path.dirname(PROCESS_PATH),
  stdio: 'pipe',
  detached: false,
};

const serviceRegistry = ServiceRegistry.createLocal([{
  name: 'dummy',
  definition: path.join(__dirname, 'DummyService.js'),
  implementation: path.join(__dirname, 'DummyService.js'),
  preserveFunctionNames: true,
}]);

describe('RpcProcess', () => {
  let server: RpcProcess;

  beforeEach(() => {
    waitsForPromise(async () => {
      const createProcess = () => safeSpawn('python', [PROCESS_PATH], OPTS);
      server = new RpcProcess('Dummy IO Server', serviceRegistry, createProcess);
    });
  });

  afterEach(() => {
    invariant(server != null);
    server.dispose();
  });

  function getService(): Promise<DummyService> {
    return server.getService('dummy');
  }

  it('should be able to complete calls', () => {
    waitsForPromise(async () => {
      // All methods except 'kill' and 'error' return the same result in our
      // dummy server.
      const response = await (await getService()).binarysystems();
      expect(response).toEqual({
        hello: 'Hello World',
      });
    });
  });

  it('should be able to handle multiple calls', () => {
    waitsForPromise(async () => {
      const service = await getService();
      const responses = await Promise.all([
        service.a(),
        service.b(),
        service.c(),
        service.d(),
      ]);
      expect(responses.length).toBe(4);
      expect(responses).toEqual([
        {hello: 'Hello World'},
        {hello: 'Hello World'},
        {hello: 'Hello World'},
        {hello: 'Hello World'},
      ]);
    });
  });

  it('should reject pending calls upon error', () => {
    waitsForPromise(async () => {
      try {
        await (await getService()).error();
        invariant(false, 'Fail - expected promise to reject');
      } catch (e) {
        expect(e).toEqual('Command to error received');
      }
    });
  });

  it('should reject pending calls upon the child process exiting', () => {
    waitsForPromise(async () => {
      try {
        await (await getService()).kill();
        invariant(false, 'Fail - expected promise to reject');
      } catch (e) {
        expect(e.message.startsWith('Remote Error: Connection Closed processing message'))
          .toBeTruthy();
      }
    });
  });

  it('should recover gracefully after the child process exits', () => {
    waitsForPromise(async () => {
      try {
        await (await getService()).kill();
        invariant(false, 'Fail - expected promise to reject');
      } catch (e) {
        // Ignore.
      }

      // Subsequent request should process successfully, meaning the killed
      // child process has been restarted.
      const response = await (await getService()).polarbears();
      expect(response).toEqual({
        hello: 'Hello World',
      });
    });
  });
});
