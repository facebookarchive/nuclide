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
import mockSpawn from 'mock-spawn';
import processLib from '../lib/process';

import child_process from 'child_process';

describe('nuclide-commons/process', () => {
  let mySpawn = null;
  let realSpawn = null;
  let realPlatform = null;

  beforeEach(() => {
    mySpawn = mockSpawn();
    realSpawn = child_process.spawn;
    child_process.spawn = mySpawn;
    realPlatform = process.platform;
    Object.defineProperty(process, 'platform', {value: 'linux'});
  });

  afterEach(() => {
    invariant(realSpawn != null);
    child_process.spawn = realSpawn;
    invariant(realPlatform != null);
    Object.defineProperty(process, 'platform', {value: realPlatform});
  });

  describe('process.scriptSafeSpawn', () => {
    const arg = '--arg1 --arg2';
    const bin = '/usr/bin/fakebinary';
    const testCases = [
      {arguments: [arg], expectedCmd: `${bin} '${arg}'`},
      {arguments: arg.split(' '), expectedCmd: `${bin} ${arg}`},
    ];
    for (const testCase of testCases) {
      it('should quote arguments', () => {
        expect(process.platform).toEqual('linux', 'Platform was not properly mocked.');
        waitsForPromise(async () => {
          const child = await processLib.scriptSafeSpawn(bin, testCase.arguments);
          expect(child).not.toBeNull();
          await new Promise((resolve, reject) => {
            child.on('close', resolve);
          });
          invariant(mySpawn != null);
          expect(mySpawn.calls.length).toBe(1);
          const args = mySpawn.calls[0].args;
          expect(args.length).toBeGreaterThan(0);
          expect(args[args.length - 1]).toBe(testCase.expectedCmd);
        });
      });
    }
  });
});
