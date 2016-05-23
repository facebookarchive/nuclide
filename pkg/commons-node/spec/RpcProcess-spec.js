'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import path from 'path';
import invariant from 'assert';
import {safeSpawn} from '../process';
import RpcProcess from '../RpcProcess';

const PROCESS_PATH = path.join(__dirname, '/fixtures/dummyioserver.py');
const OPTS = {
  cwd: path.dirname(PROCESS_PATH),
  stdio: 'pipe',
  detached: false,
};

describe('RpcProcess', () => {
  let server: RpcProcess;

  beforeEach(() => {
    waitsForPromise(async () => {
      const createProcess = () => safeSpawn('python', [PROCESS_PATH], OPTS);
      server = new RpcProcess('Dummy IO Server', createProcess);
    });
  });

  afterEach(() => {
    invariant(server != null);
    server.dispose();
  });

  it('should be able to complete calls', () => {
    waitsForPromise(async () => {
      const response = await server.call({
        // All methods except 'kill' and 'error' return the same result in our
        // dummy server.
        method: 'binarysystems',
      });
      expect(response).toEqual({
        hello: 'Hello World',
      });
    });
  });

  it('should be able to handle multiple calls', () => {
    waitsForPromise(async () => {
      const responses = await Promise.all(['a', 'b', 'c', 'd'].map(async method =>
        await server.call({method})
      ));
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
        await server.call({method: 'error'});
        invariant(false, 'Fail - expected promise to reject');
      } catch (e) {
        expect(e.message).toEqual('Command to error received');
      }
    });
  });

  it('should reject pending calls upon the child process exiting', () => {
    waitsForPromise(async () => {
      try {
        await server.call({method: 'kill'});
        invariant(false, 'Fail - expected promise to reject');
      } catch (e) {
        expect(e.message).toEqual('Server exited.');
      }
    });
  });

  it('should recover gracefully after the child process exits', () => {
    waitsForPromise(async () => {
      try {
        await server.call({method: 'kill'});
        invariant(false, 'Fail - expected promise to reject');
      } catch (e) {
        // Ignore.
      }

      // Subsequent request should process successfully, meaning the killed
      // child process has been restarted.
      const response = await server.call({
        // All methods except 'kill' and 'error' return the same result in our
        // dummy server.
        method: 'polarbears',
      });
      expect(response).toEqual({
        hello: 'Hello World',
      });
    });
  });
});
