/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {ProcessExitMessage} from '../process-rpc-types';

import {sleep} from '../promise';
import child_process from 'child_process';
import invariant from 'assert';
import mockSpawn from 'mock-spawn';

import {
  asyncExecute,
  checkOutput,
  createProcessStream,
  getOutputStream,
  killProcess,
  killUnixProcessTree,
  observeProcess,
  observeProcessRaw,
  observeProcessExit,
  parsePsOutput,
  runCommand,
  safeFork,
  safeSpawn,
  scriptSafeSpawn,
  exitEventToMessage,
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
      it('enforces maxBuffer', () => {
        waitsForPromise(async () => {
          const result = await asyncExecute('yes', [], {maxBuffer: 100});
          expect(result.errorMessage).toContain('maxBuffer');
        });
      });
    }
  });

  describe('process.safeFork', () => {
    it('should not crash the process on an error', () => {
      waitsForPromise(async () => {
        spyOn(console, 'error'); // suppress error printing
        spyOn(console, 'log'); // suppress log printing
        const child = await safeFork('fakeCommand');
        expect(child).not.toBe(null);
        expect(child.listeners('error').length).toBeGreaterThan(0);
      });
    });
  });

  describe('process.safeSpawn', () => {
    it('should not crash the process on an error', () => {
      waitsForPromise(async () => {
        spyOn(console, 'error'); // suppress error printing
        spyOn(console, 'log'); // suppress log printing
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

  describe('process.killProcess', () => {
    it('should only kill the process when `killTree` is false', () => {
      waitsForPromise(async () => {
        const proc = {
          kill: jasmine.createSpy(),
        };
        spyOn(console, 'error'); // suppress error printing
        spyOn(console, 'log'); // suppress log printing
        await killProcess((proc: any), false);
        expect(proc.kill).toHaveBeenCalled();
      });
    });

    it('should kill the process tree when `killTree` is true', () => {
      waitsForPromise(async () => {
        jasmine.useRealClock();
        // Create a tree that's more than level child deep.
        const proc = child_process.spawn('bash', ['-c', '( (sleep 1000)& sleep 1000 )& wait']);
        spyOn(console, 'error'); // suppress error printing
        spyOn(console, 'log'); // suppress log printing
        spyOn(process, 'kill').andCallThrough();
        await sleep(250); // Give some time for the processes to spawn.
        await killUnixProcessTree(proc);
        expect(process.kill.callCount).toBeGreaterThan(2);
      });
    });

    it('should kill the process tree on windows when `killTree` is true', () => {
      waitsForPromise(async () => {
        const proc = {
          pid: 123,
        };
        spyOn(console, 'error'); // suppress error printing
        spyOn(console, 'log'); // suppress log printing
        Object.defineProperty(process, 'platform', {value: 'win32'});
        spyOn(child_process, 'exec');
        await killProcess((proc: any), true);
        expect(child_process.exec.calls.length).toBe(1);
        expect(child_process.exec.calls[0].args[0]).toBe(`taskkill /pid ${proc.pid} /T /F`);
      });
    });
  });

  describe('process.parsePsOutput', () => {
    it('parse `ps` unix output', () => {
      const unixPsOut = ' PPID   PID COMM\n'
        + '    0     1  /sbin/launchd\n'
        + '    1    42  command with spaces';
      const processList = parsePsOutput(unixPsOut);
      expect(processList).toEqual([
        {command: '/sbin/launchd', pid: 1, parentPid: 0},
        {command: 'command with spaces', pid: 42, parentPid: 1},
      ]);
    });

    it('parse `ps` windows output', () => {
      const windowsProcessOut = 'ParentProcessId   ProcessId   Name\r\n'
        + '           0                4     System Process\r\n'
        + '           4                228   smss.exe';

      const processList = parsePsOutput(windowsProcessOut);
      expect(processList).toEqual([
        {command: 'System Process', pid: 4, parentPid: 0},
        {command: 'smss.exe', pid: 228, parentPid: 4},
      ]);
    });
  });

  describe('process.observeProcessExit', () => {
    it('exitCode', () => {
      waitsForPromise(async () => {
        const child = () => safeSpawn(process.execPath, ['-e', 'process.exit(1)']);
        const exitMessage = await observeProcessExit(child).toPromise();
        expect(exitMessage).toEqual(makeExitMessage(1));
      });
    });

    it('exit via signal', () => {
      waitsForPromise(async () => {
        const child =
          () => safeSpawn(process.execPath, ['-e', 'process.kill(process.pid, "SIGTERM")']);
        const exitMessage = await observeProcessExit(child).toPromise();
        expect(exitMessage).toEqual({kind: 'exit', exitCode: null, signal: 'SIGTERM'});
      });
    });

    it('stdout exitCode', () => {
      waitsForPromise(async () => {
        const results = await observeProcess(
          process.execPath,
          ['-e', 'console.log("stdout1\\nstdout2\\n\\n\\n"); process.exit(1);'],
        )
          .toArray()
          .toPromise();
        expect(results).toEqual([
          {kind: 'stdout', data: 'stdout1\n'},
          {kind: 'stdout', data: 'stdout2\n'},
          {kind: 'stdout', data: '\n'},
          {kind: 'stdout', data: '\n'},
          {kind: 'stdout', data: '\n'},
          {kind: 'exit', exitCode: 1, signal: null}]);
      });
    });

    it('stderr exitCode', () => {
      waitsForPromise(async () => {
        const results = await observeProcess(
          process.execPath,
          ['-e', 'console.error("stderr"); process.exit(42);'],
        )
          .toArray()
          .toPromise();
        expect(results).toEqual([{kind: 'stderr', data: 'stderr\n'},
          {kind: 'exit', exitCode: 42, signal: null}]);
      });
    });

    it('stdout, stderr and exitCode', () => {
      waitsForPromise(async () => {
        const results = await observeProcess(
          process.execPath,
          ['-e', 'console.error("stderr"); console.log("std out"); process.exit(42);'],
        )
          .toArray()
          .toPromise();
        expect(results).toEqual([
          {kind: 'stderr', data: 'stderr\n'},
          {kind: 'stdout', data: 'std out\n'},
          {kind: 'exit', exitCode: 42, signal: null},
        ]);
      });
    });
  });

  describe('getOutputStream', () => {
    it('captures stdout, stderr and exitCode', () => {
      waitsForPromise(async () => {
        const child = safeSpawn(process.execPath,
          ['-e', 'console.error("stderr"); console.log("std out"); process.exit(42);']);
        const results = await getOutputStream(child).toArray().toPromise();
        expect(results).toEqual([
          {kind: 'stderr', data: 'stderr\n'},
          {kind: 'stdout', data: 'std out\n'},
          {kind: 'exit', exitCode: 42, signal: null},
        ]);
      });
    });

    it('captures stdout, stderr and exitCode when passed a promise', () => {
      waitsForPromise(async () => {
        const child = safeSpawn(process.execPath,
          ['-e', 'console.error("stderr"); console.log("std out"); process.exit(42);']);
        const results = await getOutputStream(child).toArray().toPromise();
        expect(results).toEqual([
          {kind: 'stderr', data: 'stderr\n'},
          {kind: 'stdout', data: 'std out\n'},
          {kind: 'exit', exitCode: 42, signal: null},
        ]);
      });
    });
  });

  describe('createProcessStream', () => {
    it('errors when the process does', () => {
      waitsForPromise(async () => {
        spyOn(console, 'error'); // suppress error printing
        spyOn(console, 'log'); // suppress log printing
        const processStream = createProcessStream('fakeCommand');
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
        spyOn(console, 'log'); // suppress log printing
        spyOn(child_process, 'spawn');
        try {
          await createProcessStream('fakeCommand')
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
        expect(child_process.spawn.callCount).toBe(3);
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
            const child = scriptSafeSpawn(bin, testCase.arguments);
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
      spyOn(console, 'log'); // suppress log printing
      // If the stream doesn't complete, this will timeout.
      waitsForPromise({timeout: 1000}, async () => {
        await observeProcess('fakeCommand').toArray().toPromise();
      });
    });
  });

  describe('observeProcessRaw', () => {
    it("doesn't split on line breaks", () => {
      spyOn(console, 'error');
      spyOn(console, 'log'); // suppress log printing
      waitsForPromise({timeout: 1000}, async () => {
        const event = await observeProcessRaw(
          process.execPath,
          ['-e', 'process.stdout.write("stdout1\\nstdout2\\n"); process.exit(1)'],
        )
          .take(1)
          .toPromise();
        invariant(event.kind === 'stdout');
        expect(event.data).toBe('stdout1\nstdout2\n');
      });
    });
  });

  describe('runCommand', () => {
    beforeEach(() => {
      // Suppress console spew.
      spyOn(console, 'error');
      spyOn(console, 'log'); // suppress log printing
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
        expect(error.exitMessage).toEqual(makeExitMessage(1));
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

    // Previously we had a bug where we mutated the seed and subsequent subscriptions would use the
    // mutated value.
    it("doesn't share a mutable seed (regression test)", () => {
      waitsForPromise(async () => {
        const observable = runCommand(
          process.execPath,
          ['-e', 'process.stdout.write("hello"); process.exit(0)'],
        );
        await observable.toPromise();
        expect(await observable.toPromise()).toBe('hello');
      });
    });
  });

  describe('exitEventToMessage', () => {
    it('exitCode', () => {
      expect(exitEventToMessage(makeExitMessage(1))).toBe('exit code 1');
    });

    it('signal', () => {
      expect(exitEventToMessage({kind: 'exit', exitCode: null, signal: 'SIGTERM'}))
        .toBe('signal SIGTERM');
    });
  });
});

function makeExitMessage(exitCode: number): ProcessExitMessage {
  return {
    kind: 'exit',
    exitCode,
    signal: null,
  };
}
