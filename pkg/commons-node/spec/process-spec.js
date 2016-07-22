'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import child_process from 'child_process';
import invariant from 'assert';
import mockSpawn from 'mock-spawn';
import nuclideUri from '../../nuclide-remote-uri';

import {
  asyncExecute,
  checkOutput,
  createExecEnvironment,
  createProcessStream,
  getOutputStream,
  observeProcess,
  observeProcessExit,
  runCommand,
  safeSpawn,
  scriptSafeSpawn,
  __test__,
} from '../process';

describe('commons-node/process', () => {

  let origPlatform;

  beforeEach(() => {
    origPlatform = process.platform;
    // Use a fake platform so the platform's PATH is not used in case the test is run on a platform
    // that requires special handling (like OS X).
    Object.defineProperty(process, 'platform', {value: 'MockMock'});
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', {value: origPlatform});
  });

  describe('createExecEnvironment()', () => {
    it('don\'t overwrite the PATH if it\'s different than process.env.PATH', () => {
      waitsForPromise(async () => {
        expect(
          await createExecEnvironment({foo: 'bar', PATH: '/bin'}, ['/abc/def']),
        ).toEqual({foo: 'bar', PATH: '/bin'});
      });
    });

    it('combine the existing environment variables with the common paths passed', () => {
      waitsForPromise(async () => {
        const PATH = process.env.PATH;
        invariant(PATH != null);
        const delimitedPath = nuclideUri.splitPathList(PATH);
        expect(
          await createExecEnvironment({foo: 'bar', PATH}, ['/abc/def']),
        ).toEqual({foo: 'bar', PATH: nuclideUri.joinPathList([...delimitedPath, '/abc/def'])});
      });
    });

    // This is a regression test. Previously, we were doing simple string matching that would give
    // us false positives when checking if paths were in PATH.
    it('adds paths that are descendents of paths in PATH', () => {
      waitsForPromise(async () => {
        const oldPath = process.env.PATH;
        process.env.PATH = '/abc/def';
        let execEnv;
        try {
          execEnv = await createExecEnvironment(process.env, ['/abc']);
        } finally {
          process.env.PATH = oldPath;
        }
        expect(execEnv.PATH).toEqual(nuclideUri.joinPathList(['/abc/def', '/abc']));
      });
    });

  });

  describe('OS X path_helper regexp', () => {
    it('matches and captures valid PATH', () => {
      const matches = 'PATH="/usr/bin:/usr/local/bin"; export PATH; echo ""'
        .match(__test__.DARWIN_PATH_HELPER_REGEXP);
      invariant(matches);
      expect(matches[1]).toEqual('/usr/bin:/usr/local/bin');
    });
  });

  describe('checkOutput', () => {
    if (origPlatform !== 'win32') {
      it('returns stdout of the running process', () => {
        waitsForPromise(async () => {
          const val = await checkOutput('echo', ['-n', 'foo'], {env: process.env});
          expect(val.stdout).toEqual('foo');
        });
      });
      it('throws an error if the exit code !== 0', () => {
        waitsForPromise({shouldReject: true}, async () => {
          await checkOutput(process.execPath, ['-e', 'process.exit(1)']);
        });
      });
    }
  });

  describe('asyncExecute', () => {
    if (origPlatform !== 'win32') {
      it('asyncExecute returns an error if the process cannot be started', () => {
        waitsForPromise(async () => {
          const result = await asyncExecute('non_existing_command', /* args */ []);
          expect(result.errorCode).toBe('ENOENT');
        });
      });
      it('asyncExecute does not throw an error if the exit code !== 0', () => {
        waitsForPromise(async () => {
          const {exitCode} =
              await asyncExecute(process.execPath, ['-e', 'process.exit(1)']);
          expect(exitCode).toBe(1);
        });
      });
      it('supports stdin', () => {
        waitsForPromise(async () => {
          const result = await asyncExecute('cat', [], {stdin: 'test'});
          expect(result.stdout).toBe('test');
        });
      });
      it('supports a timeout', () => {
        waitsForPromise(async () => {
          jasmine.useRealClock();
          let result = await asyncExecute('sleep', ['5'], {timeout: 100});
          expect(result.errorCode).toBe('EUNKNOWN');

          result = await asyncExecute('sleep', ['0'], {timeout: 100});
          expect(result.exitCode).toBe(0);
        });
      });
    }
  });

  describe('process.safeSpawn', () => {
    it('should not crash the process on an error', () => {
      waitsForPromise(async () => {
        spyOn(console, 'error'); // suppress error printing
        const child = await safeSpawn('fakeCommand');
        expect(child).not.toBe(null);
        expect(child.listeners('error').length).toBeGreaterThan(0);
      });
    });
  });

  describe('process.scriptSafeSpawn', () => {
    it('should not crash the process on an error.', () => {
      waitsForPromise(async () => {
        const child = await scriptSafeSpawn('fakeCommand');
        expect(child).not.toBe(null);
        expect(child.listeners('error').length).toBeGreaterThan(0);
      });
    });
  });

  describe('process.observeProcessExit', () => {
    it('exitCode', () => {
      waitsForPromise(async () => {
        const child = () => safeSpawn(process.execPath, ['-e', 'process.exit(1)']);
        const exitCode = await observeProcessExit(child).toPromise();
        expect(exitCode).toBe(1);
      });
    });

    it('stdout exitCode', () => {
      waitsForPromise(async () => {
        const child = () => safeSpawn(process.execPath,
          ['-e', 'console.log("stdout1\\nstdout2\\n\\n\\n"); process.exit(1);']);
        const results = await observeProcess(child).toArray().toPromise();
        expect(results).toEqual([
          {kind: 'stdout', data: 'stdout1\n'},
          {kind: 'stdout', data: 'stdout2\n'},
          {kind: 'stdout', data: '\n'},
          {kind: 'stdout', data: '\n'},
          {kind: 'stdout', data: '\n'},
          {kind: 'exit', exitCode: 1}]);
      });
    });

    it('stderr exitCode', () => {
      waitsForPromise(async () => {
        const child = () => safeSpawn(process.execPath,
          ['-e', 'console.error("stderr"); process.exit(42);']);
        const results = await observeProcess(child).toArray().toPromise();
        expect(results).toEqual([{kind: 'stderr', data: 'stderr\n'},
          {kind: 'exit', exitCode: 42}]);
      });
    });

    it('stdout, stderr and exitCode', () => {
      waitsForPromise(async () => {
        const child = () => safeSpawn(process.execPath,
          ['-e', 'console.error("stderr"); console.log("std out"); process.exit(42);']);
        const results = await observeProcess(child).toArray().toPromise();
        expect(results).toEqual([
          {kind: 'stderr', data: 'stderr\n'},
          {kind: 'stdout', data: 'std out\n'},
          {kind: 'exit', exitCode: 42},
        ]);
      });
    });

    it("kills the process when it becomes ready if you unsubscribe before it's returned", () => {
      waitsForPromise(async () => {
        spyOn(console, 'log'); // suppress log printing

        // A process that lasts ten seconds.
        const process = mockSpawn(cb => {
          setTimeout(() => cb(0), 10000);
        })();
        spyOn(process, 'kill');
        const createProcess = async () => {
          // Take five seconds to "create" the process.
          await new Promise(resolve => { setTimeout(resolve, 5000); });
          return process;
        };
        const promise = createProcess();
        const subscription = observeProcess(() => promise).subscribe(() => {});

        // Unsubscribe before the process is "created".
        subscription.unsubscribe();

        // Make sure the process is killed when we get it.
        advanceClock(20000);
        await promise;
        expect(process.kill).toHaveBeenCalled();
      });
    });

  });

  describe('getOutputStream', () => {
    it('captures stdout, stderr and exitCode', () => {
      waitsForPromise(async () => {
        const promise = safeSpawn(process.execPath,
          ['-e', 'console.error("stderr"); console.log("std out"); process.exit(42);']);
        const child = await promise;
        const results = await getOutputStream(child).toArray().toPromise();
        expect(results).toEqual([
          {kind: 'stderr', data: 'stderr\n'},
          {kind: 'stdout', data: 'std out\n'},
          {kind: 'exit', exitCode: 42},
        ]);
      });
    });

    it('captures stdout, stderr and exitCode when passed a promise', () => {
      waitsForPromise(async () => {
        const promise = safeSpawn(process.execPath,
          ['-e', 'console.error("stderr"); console.log("std out"); process.exit(42);']);
        const results = await getOutputStream(promise).toArray().toPromise();
        expect(results).toEqual([
          {kind: 'stderr', data: 'stderr\n'},
          {kind: 'stdout', data: 'std out\n'},
          {kind: 'exit', exitCode: 42},
        ]);
      });
    });

  });

  describe('createProcessStream', () => {

    it('errors when the process does', () => {
      waitsForPromise(async () => {
        spyOn(console, 'error'); // suppress error printing
        const createProcess = () => safeSpawn('fakeCommand');
        const processStream = createProcessStream(createProcess);
        let error;
        try {
          await processStream.toPromise();
        } catch (err) {
          error = err;
        }
        expect(error).toBeDefined();
        invariant(error);
        expect(error.code).toBe('ENOENT');
      });
    });

    it('can be retried', () => {
      waitsForPromise(async () => {
        spyOn(console, 'error'); // suppress error printing
        const createProcess = jasmine.createSpy().andCallFake(
          () => safeSpawn('fakeCommand'),
        );
        try {
          await createProcessStream(createProcess)
            .retryWhen(errors => (
              errors.scan(
                (errorCount, err) => {
                  // If this is the third time the process has errored (i.e. the have already been
                  // two errors before), stop retrying. (We try 3 times because because Rx 3 and 4
                  // have bugs with retrying shared observables that would give false negatives for
                  // this test if we only tried twice.)
                  if (errorCount === 2) {
                    throw err;
                  }
                  return errorCount + 1;
                },
                0,
              )
            ))
            .toPromise();
        } catch (err) {}
        expect(createProcess.callCount).toEqual(3);
      });
    });

  });

  describe('scriptSafeSpawn', () => {
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

    describe('scriptSafeSpawn', () => {
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
            const child = await scriptSafeSpawn(bin, testCase.arguments);
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

  describe('observeProcess', () => {

    it('completes the stream if the process errors', () => {
      spyOn(console, 'error');
      // If the stream doesn't complete, this will timeout.
      waitsForPromise({timeout: 1000}, async () => {
        await observeProcess(() => safeSpawn('fakeCommand')).toArray().toPromise();
      });
    });

  });

  describe('runCommand', () => {
    beforeEach(() => {
      // Suppress console spew.
      spyOn(console, 'error');
    });

    if (origPlatform === 'win32') { return; }

    it('returns stdout of the running process', () => {
      waitsForPromise(async () => {
        const val = await runCommand('echo', ['-n', 'foo'], {env: process.env}).toPromise();
        expect(val).toEqual('foo');
      });
    });

    it("throws an error if the process can't be spawned", () => {
      waitsForPromise(async () => {
        let error;
        try {
          await runCommand('fakeCommand').toPromise();
        } catch (err) {
          error = err;
        }
        invariant(error != null);
        expect(error.name).toBe('ProcessSystemError');
      });
    });

    it('throws an error if the exit code !== 0', () => {
      waitsForPromise(async () => {
        let error;
        try {
          await runCommand(process.execPath, ['-e', 'process.exit(1)']).toPromise();
        } catch (err) {
          error = err;
        }
        invariant(error != null);
        expect(error.name).toBe('ProcessExitError');
        expect(error.code).toBe(1);
      });
    });

    it('accumulates the stdout if the process exits with a non-zero code', () => {
      waitsForPromise(async () => {
        let error;
        try {
          await runCommand(
            process.execPath,
            ['-e', 'process.stdout.write("hola"); process.exit(1)'],
          ).toPromise();
        } catch (err) {
          error = err;
        }
        invariant(error != null);
        expect(error.stdout).toBe('hola');
      });
    });

    it('accumulates the stderr if the process exits with a non-zero code', () => {
      waitsForPromise(async () => {
        let error;
        try {
          await runCommand(
            process.execPath,
            ['-e', 'process.stderr.write("oopsy"); process.exit(1)'],
          ).toPromise();
        } catch (err) {
          error = err;
        }
        invariant(error != null);
        expect(error.stderr).toBe('oopsy');
      });
    });

  });

});
