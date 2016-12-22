/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import typeof {
  niceSafeSpawn as niceSafeSpawnType,
  niceCheckOutput as niceCheckOutputType,
  niceAsyncExecute as niceAsyncExecuteType,
} from '../nice';

import type {AsyncExecuteReturn} from '../process';

import {uncachedRequire} from '../../nuclide-test-helpers';

describe('nice', () => {
  let niceSafeSpawn: niceSafeSpawnType = (null: any);
  let niceCheckOutput: niceCheckOutputType = (null: any);
  let niceAsyncExecute: niceAsyncExecuteType = (null: any);

  let whichSpy: JasmineSpy = (null: any);
  let safeSpawnSpy: JasmineSpy = (null: any);
  let checkOutputSpy: JasmineSpy = (null: any);
  let asyncExecuteSpy: JasmineSpy = (null: any);
  let shouldFindNiceCommand: boolean = (null: any);
  let shouldFindIoniceCommand: boolean = (null: any);
  // All we need here is a unique value to make sure that `nice` returns whatever `safeSpawn`
  // returns
  const fakeSafeSpawnReturn: child_process$ChildProcess = ({}: any);
  const fakeCheckOutputReturn: AsyncExecuteReturn = ({}: any);
  const fakeAsyncExecuteReturn: AsyncExecuteReturn = ({}: any);

  beforeEach(() => {
    shouldFindNiceCommand = true;
    shouldFindIoniceCommand = true;
    whichSpy = spyOn(require('../which'), 'default').andCallFake(command => {
      if (
        (shouldFindNiceCommand && command === 'nice') ||
        (shouldFindIoniceCommand && command === 'ionice')
      ) {
        return command;
      } else {
        return null;
      }
    });
    safeSpawnSpy = spyOn(require('../process'), 'safeSpawn').andReturn(fakeSafeSpawnReturn);
    checkOutputSpy = spyOn(require('../process'), 'checkOutput').andReturn(fakeCheckOutputReturn);
    asyncExecuteSpy =
      spyOn(require('../process'), 'asyncExecute').andReturn(fakeAsyncExecuteReturn);
    ({niceSafeSpawn, niceAsyncExecute, niceCheckOutput} =
      (uncachedRequire(require, '../nice'): any));
  });

  it('should spawn `nice` and return whatever safeSpawn returns', () => {
    waitsForPromise(async () => {
      const execOptions = {};
      const result = await niceSafeSpawn('echo', ['hi'], execOptions);
      expect(safeSpawnSpy).toHaveBeenCalledWith(
        'ionice', ['-n', '7', 'nice', 'echo', 'hi'], execOptions,
      );
      expect(result).toBe(fakeSafeSpawnReturn);
    });
  });

  it('should spawn the command normally if nice and ionice cannot be found', () => {
    waitsForPromise(async () => {
      shouldFindNiceCommand = false;
      shouldFindIoniceCommand = false;
      const execOptions = {};
      const result = await niceSafeSpawn('echo', ['hi'], execOptions);
      expect(safeSpawnSpy).toHaveBeenCalledWith('echo', ['hi'], execOptions);
      expect(result).toBe(fakeSafeSpawnReturn);
    });
  });

  it('should spawn with only nice if ionice cannot be found', () => {
    waitsForPromise(async () => {
      shouldFindIoniceCommand = false;
      const execOptions = {};
      const result = await niceSafeSpawn('echo', ['hi'], execOptions);
      expect(safeSpawnSpy).toHaveBeenCalledWith('nice', ['echo', 'hi'], execOptions);
      expect(result).toBe(fakeSafeSpawnReturn);
    });
  });

  it('should spawn with only ionice if nice cannot be found', () => {
    waitsForPromise(async () => {
      // I don't know when we would have ionice but not nice, but we may as well support this case.
      shouldFindNiceCommand = false;
      const execOptions = {};
      const result = await niceSafeSpawn('echo', ['hi'], execOptions);
      expect(safeSpawnSpy).toHaveBeenCalledWith('ionice', ['-n', '7', 'echo', 'hi'], execOptions);
      expect(result).toBe(fakeSafeSpawnReturn);
    });
  });

  it('should call which only once per command and cache the result', () => {
    waitsForPromise(async () => {
      await niceSafeSpawn('echo', []);
      await niceSafeSpawn('echo', []);
      expect(whichSpy).toHaveBeenCalledWith('nice');
      expect(whichSpy).toHaveBeenCalledWith('ionice');
      expect(whichSpy.callCount).toBe(2);
    });
  });

  it('should call checkOutput when the niceCheckOutput variant is used', () => {
    waitsForPromise(async () => {
      const execOptions = {};
      const result = await niceCheckOutput('echo', ['hi'], execOptions);
      expect(checkOutputSpy).toHaveBeenCalledWith(
        'ionice', ['-n', '7', 'nice', 'echo', 'hi'], execOptions,
      );
      expect(result).toBe(fakeCheckOutputReturn);
    });
  });

  it('should call asyncExecute when the niceAsyncExecute variant is used', () => {
    waitsForPromise(async () => {
      const execOptions = {};
      const result = await niceAsyncExecute('echo', ['hi'], execOptions);
      expect(asyncExecuteSpy).toHaveBeenCalledWith(
        'ionice', ['-n', '7', 'nice', 'echo', 'hi'], execOptions,
      );
      expect(result).toBe(fakeAsyncExecuteReturn);
    });
  });
});
