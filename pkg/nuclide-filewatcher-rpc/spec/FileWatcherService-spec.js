'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {WatchResult} from '..';
import {Emitter} from 'event-kit';
import fsPromise from '../../commons-node/fsPromise';
import * as watchmanHelpers from '../../nuclide-watchman-helpers';
import * as logging from '../../nuclide-logging';
import {watchFile, watchDirectory, watchDirectoryRecursive} from '../lib/FileWatcherService';

const TEST_FILE = '/path/to/file';
const TEST_DIR = '/path/to';

describe('FileWatcherService', () => {
  let emitter;
  let statMock;
  let realpathMock;
  beforeEach(() => {
    const mockWatchmanClient = {
      hasSubscription: () => false,
      watchDirectoryRecursive() {
        emitter = new Emitter();
        // $FlowIgnore
        emitter.root = TEST_DIR;
        return Promise.resolve(emitter);
      },
    };

    spyOn(watchmanHelpers, 'WatchmanClient')
      .andReturn(mockWatchmanClient);

    statMock = spyOn(fsPromise, 'stat')
      .andCallFake(path => ({
        isFile: () => path === TEST_FILE,
      }));

    realpathMock = spyOn(fsPromise, 'realpath')
      .andCallFake(x => x);
  });

  it('watches changes to files', () => {
    const watchReady = jasmine.createSpy('ready');
    runs(() => {
      watchDirectoryRecursive(TEST_DIR).refCount()
        .subscribe({next: watchReady});
    });

    waitsFor(() => watchReady.wasCalled);

    const nextMock: (result: WatchResult) => mixed = jasmine.createSpy('next');
    const parentNextMock = jasmine.createSpy('parentNext');
    const completeMock: () => mixed = jasmine.createSpy('complete');
    runs(() => {
      expect(watchReady).toHaveBeenCalledWith('SUCCESS');
      watchFile(TEST_FILE).refCount()
        .subscribe({next: nextMock, complete: completeMock});
      watchDirectory(TEST_DIR).refCount()
        .subscribe({next: parentNextMock});
    });

    // Hacky: there's no good way of checking if the inner observables are ready.
    // For now, we know it subscribes after realpath resolves.
    waitsFor(() => realpathMock.callCount === 2);

    // Simulate a file creation.
    runs(() => {
      emitter.emit('change', [
        {
          name: 'file',
          new: true,
          exists: true,
          mode: 0,
        },
      ]);
    });

    waitsFor(() => nextMock.wasCalled && parentNextMock.wasCalled);

    runs(() => {
      expect(nextMock).toHaveBeenCalledWith({
        path: TEST_FILE,
        type: 'change',
      });

      // The parent dir should change.
      expect(parentNextMock).toHaveBeenCalledWith({
        path: TEST_DIR,
        type: 'change',
      });

      // Simulate a regular file change.
      emitter.emit('change', [
        {
          name: 'file',
          new: false,
          exists: true,
          mode: 0,
        },
      ]);
    });

    waitsFor(() => nextMock.callCount === 2);

    runs(() => {
      // Regular changes don't affect parent directories.
      expect(parentNextMock.callCount).toBe(1);

      // Simulate a file deletion.
      emitter.emit('change', [
        {
          name: 'file',
          new: false,
          exists: false,
          mode: 0,
        },
      ]);
    });

    // Watch should complete after a delete.
    waitsFor(() => completeMock.wasCalled);

    runs(() => {
      expect(nextMock).toHaveBeenCalledWith({
        path: TEST_FILE,
        type: 'delete',
      });

      // The parent dir should change again.
      expect(parentNextMock.callCount).toBe(2);
    });

    // Test that rewatching produces a new observer.
    const completeMock2 = jasmine.createSpy('completeMock2');
    runs(() => {
      watchFile(TEST_FILE).refCount()
        .subscribe({complete: completeMock2});
    });

    // Use the same hack again..
    waitsFor(() => realpathMock.callCount === 3);

    runs(() => {
      // Delete the file again.
      emitter.emit('change', [
        {
          name: 'file',
          new: false,
          exists: false,
          mode: 0,
        },
      ]);
    });

    waitsFor(() => completeMock2.wasCalled);
  });

  it('errors for missing files', () => {
    statMock.andCallFake(() => {
      throw new Error();
    });

    const errorMock = jasmine.createSpy('errorMock');
    runs(() => {
      watchFile(TEST_FILE).refCount().subscribe({error: errorMock});
    });

    waitsFor(() => errorMock.wasCalled);
  });

  it('warns when you try to watch the wrong entity type', () => {
    const warnSpy = jasmine.createSpy('warn');
    spyOn(logging, 'getLogger').andReturn({warn: warnSpy});

    watchFile(TEST_DIR).refCount();
    waitsFor(() => warnSpy.wasCalled);

    watchDirectory(TEST_FILE).refCount();
    waitsFor(() => warnSpy.callCount === 2);
  });
});
