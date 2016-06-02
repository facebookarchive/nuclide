'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import ClangServerManager from '../lib/ClangServerManager';

describe('ClangServerManager', () => {
  let serverManager;
  beforeEach(() => {
    serverManager = new ClangServerManager();
  });

  it('handles restartIfChanged', () => {
    waitsForPromise(async () => {
      const TEST_FILE = 'test.cpp';
      const server = serverManager.getClangServer(TEST_FILE, '', [], true);
      const server2 = serverManager.getClangServer(TEST_FILE, '', [], true);
      expect(server2).toBe(server);

      spyOn(serverManager._flagsManager, 'getFlagsChanged').andReturn(true);
      const server3 = serverManager.getClangServer(TEST_FILE, '', [], true);
      expect(server3).not.toBe(server);
    });
  });

  it('has a hard limit on server count', () => {
    waitsForPromise(async () => {
      const servers = [];
      for (let i = 0; i < 11; i++) {
        servers.push(serverManager.getClangServer(`test${i}.cpp`, ''));
      }
      expect(servers[0]._disposed).toBe(true);
      expect(servers[1]._disposed).toBe(false);
    });
  });

  it('enforces a memory limit', () => {
    waitsForPromise(async () => {
      const server = serverManager.getClangServer('test.cpp', '');
      spyOn(server, 'getMemoryUsage').andReturn(Promise.resolve(1e99));

      // We're still over the limit, but keep the last one alive.
      const server2 = serverManager.getClangServer('test2.cpp', '');
      spyOn(server2, 'getMemoryUsage').andReturn(Promise.resolve(1e99));

      await serverManager._checkMemoryUsage();
      expect(server._disposed).toBe(true);
      expect(server2._disposed).toBe(false);

      // It should be disposed once the next server gets created.
      const server3 = serverManager.getClangServer('test3.cpp', '');
      spyOn(server3, 'getMemoryUsage').andReturn(Promise.resolve(1));

      await serverManager._checkMemoryUsage();
      expect(server2._disposed).toBe(true);
      expect(server3._disposed).toBe(false);
    });
  });
});
