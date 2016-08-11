'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import typeof niceType from '../nice';

import {uncachedRequire, spyOnDefault} from '../../nuclide-test-helpers';

describe('nice', () => {
  let nice: niceType = (null: any);
  let whichSpy: JasmineSpy = (null: any);
  let safeSpawnSpy: JasmineSpy = (null: any);
  let shouldFindNiceCommand: boolean = (null: any);
  // All we need here is a unique value to make sure that `nice` returns whatever `safeSpawn`
  // returns
  const fakeSafeSpawnReturn: child_process$ChildProcess = ({}: any);

  beforeEach(() => {
    shouldFindNiceCommand = true;
    whichSpy = spyOnDefault(require.resolve('../which')).andCallFake(command => {
      if (shouldFindNiceCommand) {
        return command;
      } else {
        return null;
      }
    });
    safeSpawnSpy = spyOn(require('../process'), 'safeSpawn').andReturn(fakeSafeSpawnReturn);
    nice = (uncachedRequire(require, '../nice'): any);
  });

  it('should spawn `nice` and return whatever safeSpawn returns', () => {
    waitsForPromise(async () => {
      const execOptions = {};
      const result = await nice('echo', ['hi'], execOptions);
      expect(safeSpawnSpy).toHaveBeenCalledWith('nice', ['echo', 'hi'], execOptions);
      expect(result).toBe(fakeSafeSpawnReturn);
    });
  });

  it('should spawn the command normally if nice cannot be found', () => {
    waitsForPromise(async () => {
      shouldFindNiceCommand = false;
      const execOptions = {};
      const result = await nice('echo', ['hi'], execOptions);
      expect(safeSpawnSpy).toHaveBeenCalledWith('echo', ['hi'], execOptions);
      expect(result).toBe(fakeSafeSpawnReturn);
    });
  });

  it('should call which only once and cache the result', () => {
    waitsForPromise(async () => {
      await nice('echo', []);
      await nice('echo', []);
      expect(whichSpy).toHaveBeenCalledWith('nice');
      expect(whichSpy.callCount).toBe(1);
    });
  });
});
