'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import ClangServerManager from '../lib/ClangServerManager';

describe('ClangServerManager', () => {
  let serverManager;
  beforeEach(() => {
    serverManager = new ClangServerManager();
    spyOn(serverManager._flagsManager, 'getFlagsForSrc')
      .andReturn(Promise.resolve(null));
  });

  it('uses flags from manager if available', () => {
    waitsForPromise(async () => {
      serverManager._flagsManager.getFlagsForSrc.andReturn(Promise.resolve({flags: ['a']}));
      const flagsResult = await serverManager._getFlags('test.cpp');
      expect(flagsResult).toEqual({flags: ['a'], usesDefaultFlags: false});
    });
  });

  it('falls back to default flags', () => {
    waitsForPromise(async () => {
      const flagsResult = await serverManager._getFlags('test.cpp', ['b']);
      expect(flagsResult).toEqual({flags: ['b'], usesDefaultFlags: true, flagsFile: null});
    });
  });

  it('returns null when no flags are available', () => {
    waitsForPromise(async () => {
      const server = await serverManager.getClangServer('test.cpp', '');
      expect(server).toBeNull();
    });
  });

  it('handles restartIfChanged', () => {
    waitsForPromise(async () => {
      const TEST_FILE = 'test.cpp';
      const [server, server2] = await Promise.all([
        serverManager.getClangServer(TEST_FILE, '', [], true),
        serverManager.getClangServer(TEST_FILE, '', [], true),
      ]);
      expect(server).not.toBeNull();
      expect(server2).toBe(server);

      invariant(server != null);
      spyOn(server, 'getFlagsChanged').andReturn(true);
      const server3 = await serverManager.getClangServer(TEST_FILE, '', [], true);
      expect(server3).not.toBe(server);
    });
  });

  it('has a hard limit on server count', () => {
    waitsForPromise(async () => {
      const servers = [];
      for (let i = 0; i < 21; i++) {
        // eslint-disable-next-line babel/no-await-in-loop
        servers.push(await serverManager.getClangServer(`test${i}.cpp`, '', []));
      }
      invariant(servers[0]);
      expect(servers[0]._disposed).toBe(true);
      invariant(servers[1]);
      expect(servers[1]._disposed).toBe(false);
    });
  });

  it('enforces a memory limit', () => {
    waitsForPromise(async () => {
      const server = await serverManager.getClangServer('test.cpp', '', []);
      invariant(server);
      spyOn(server, 'getMemoryUsage').andReturn(Promise.resolve(1e99));

      // We're still over the limit, but keep the last one alive.
      const server2 = await serverManager.getClangServer('test2.cpp', '', []);
      invariant(server2);
      spyOn(server2, 'getMemoryUsage').andReturn(Promise.resolve(1e99));

      await serverManager._checkMemoryUsage();
      expect(server._disposed).toBe(true);
      expect(server2._disposed).toBe(false);

      // It should be disposed once the next server gets created.
      const server3 = await serverManager.getClangServer('test3.cpp', '', []);
      invariant(server3);
      spyOn(server3, 'getMemoryUsage').andReturn(Promise.resolve(1));

      await serverManager._checkMemoryUsage();
      expect(server2._disposed).toBe(true);
      expect(server3._disposed).toBe(false);
    });
  });
});
