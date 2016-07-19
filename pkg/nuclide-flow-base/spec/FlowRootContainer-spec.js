'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FlowRootContainer as FlowRootContainerType} from '../lib/FlowRootContainer';

import invariant from 'assert';

import {FlowExecInfoContainer} from '../lib/FlowExecInfoContainer';
import {FlowRootContainer} from '../lib/FlowRootContainer';

describe('FlowRootContainer', () => {
  let flowRootContainer: FlowRootContainerType = (null: any);
  let configDirPath: ?string = null;

  beforeEach(() => {
    waitsForPromise(async () => {
      configDirPath = '/definitely/a/legit/path/';

      const execInfoContainer = new FlowExecInfoContainer();
      spyOn(execInfoContainer, 'findFlowConfigDir')
        .andCallFake(async () => configDirPath);

      flowRootContainer = new FlowRootContainer(execInfoContainer);
    });
  });

  it('should return a new root', () => {
    waitsForPromise(async () => {
      const root = await flowRootContainer.getRootForPath('foo');
      expect(root).not.toBeNull();
    });
  });

  describe('runWithRoot', () => {
    it('should run a command with the proper root', () => {
      waitsForPromise(async () => {
        const result = await flowRootContainer.runWithRoot('foo', async flowRoot => {
          expect(flowRoot).not.toBeNull();
          return 42;
        });
        expect(result).toBe(42);
      });
    });

    it('should not run if no root is found', () => {
      waitsForPromise(async () => {
        configDirPath = null;
        const callback = jasmine.createSpy().andReturn(Promise.resolve(42));
        const result = await flowRootContainer.runWithRoot('foo', callback);
        expect(result).toBeNull();
        expect(callback).not.toHaveBeenCalled();
      });
    });
  });

  describe('runWithOptionalRoot', () => {
    it('should run a command with the proper root', () => {
      waitsForPromise(async () => {
        const callback = jasmine.createSpy().andReturn(Promise.resolve(42));
        const result = await flowRootContainer.runWithOptionalRoot('foo', callback);
        expect(result).toBe(42);
        expect(callback).toHaveBeenCalled();
        expect(callback.mostRecentCall.args[0]).not.toBeNull();
      });
    });
    it('should run a command even without a root', () => {
      waitsForPromise(async () => {
        configDirPath = null;
        const callback = jasmine.createSpy().andReturn(Promise.resolve(42));
        const result = await flowRootContainer.runWithOptionalRoot('foo', callback);
        expect(result).toBe(42);
        expect(callback).toHaveBeenCalled();
        expect(callback.mostRecentCall.args[0]).toBeNull();
      });
    });
  });

  it('should return all roots', () => {
    waitsForPromise(async () => {
      expect(Array.from(flowRootContainer.getAllRoots())).toEqual([]);
      const flowRoot = await flowRootContainer.getRootForPath('foo');
      expect(Array.from(flowRootContainer.getAllRoots())).toEqual([flowRoot]);
    });
  });

  it('should return server status updates', () => {
    waitsForPromise(async () => {
      const resultsPromise = flowRootContainer
        .getServerStatusUpdates()
        .take(2)
        .toArray()
        .toPromise();

      const flowRoot = await flowRootContainer.getRootForPath('foo');
      invariant(flowRoot != null);
      flowRoot._process._serverStatus.next('failed');

      expect(await resultsPromise).toEqual([
        {
          pathToRoot: '/definitely/a/legit/path/',
          status: 'unknown',
        },
        {
          pathToRoot: '/definitely/a/legit/path/',
          status: 'failed',
        },
      ]);
    });
  });
});
