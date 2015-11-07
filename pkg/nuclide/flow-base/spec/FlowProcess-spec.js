'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FlowProcess as FlowProcessT} from '../lib/FlowProcess';
import {FLOW_RETURN_CODES} from '../lib/FlowProcess';

import {uncachedRequire} from 'nuclide-test-helpers';

const flowProcessPath = '../lib/FlowProcess';

describe('FlowProcess', () => {
  let fakeAsyncExec: () => Object = (null: any);

  // Mocked ChildProcess instance (not typed as such because the mock only implements a subset of
  // methods).
  let childSpy: any;

  let flowProcess: FlowProcessT = (null: any);

  const root = '/path/to/flow/root';

  function execFlow() {
    return flowProcess.execFlow([], {}, '/path/to/flow/root/file.js');
  }

  beforeEach(() => {
    // We need this level of indirection to ensure that if fakeAsyncExec is rebound, the new one
    // gets executed.
    const runFakeAsyncExec = () => fakeAsyncExec();
    spyOn(require('nuclide-commons'), 'asyncExecute').andCallFake(runFakeAsyncExec);

    childSpy = {
      stdout: { on() {} },
      stderr: { on() {} },
      on() {},
      kill() {},
    };

    spyOn(require('nuclide-commons'), 'safeSpawn').andReturn(childSpy);
    // we have to create another flow service here since we've mocked modules
    // we depend on since the outer beforeEach ran.
    const {FlowProcess} = (uncachedRequire(require, flowProcessPath): any);
    flowProcess = new FlowProcess(root);
    spyOn(flowProcess, '_getFlowExecOptions').andReturn(Promise.resolve({cwd: root}));
  });

  describe('Server startup and teardown', () => {
    beforeEach(() => {
      let called = false;
      // we want asyncExecute to throw the first time, to mimic Flow not
      // runinng. Then, it will spawn a new flow process, and we want that to be
      // successful
      fakeAsyncExec = () => {
        if (called) {
          return {exitCode: FLOW_RETURN_CODES.ok};
        } else {
          called = true;
          throw {
            exitCode: FLOW_RETURN_CODES.noServerRunning,
            stderr: 'There is no flow server running\n\'/path/to/flow/root\'',
          };
        }
      };

      spyOn(childSpy, 'kill');
      spyOn(childSpy, 'on');

      waitsForPromise(async () => { await execFlow(); });
    });

    afterEach(() => {
      global.unspy(require('nuclide-commons'), 'asyncExecute');
      global.unspy(require('nuclide-commons'), 'safeSpawn');
    });

    describe('execFlow', () => {
      it('should spawn a new Flow server', () => {
        expect(require('nuclide-commons').safeSpawn).toHaveBeenCalledWith(
          'flow',
          ['server', '/path/to/flow/root']
        );
      });
    });

    describe('crashing Flow', () => {
      let event;
      let handler;

      beforeEach(() => {
        [event, handler] = childSpy.on.mostRecentCall.args;
        // simulate a Flow crash
        handler(2, null);
      });

      it('should blacklist the root', () => {
        expect(event).toBe('exit');
        (require('nuclide-commons').safeSpawn: any).reset();
        waitsForPromise(async () => { await execFlow(); });
        expect(require('nuclide-commons').safeSpawn).not.toHaveBeenCalled();
      });
    });

    describe('dispose', () => {
      it('should kill flow server', () => {
        waitsForPromise(async () => {
          flowProcess.dispose();
          expect(childSpy.kill).toHaveBeenCalledWith('SIGKILL');
        });
      });
    });
  });

  describe('server state updates', () => {
    let currentStatus: string = (null: any);
    let subscription: atom$Disposable = (null: any);

    beforeEach(() => {
      currentStatus = (null: any);
      subscription = flowProcess._serverStatus.subscribe(status => {
        currentStatus = status;
      });
    });

    afterEach(() => {
      subscription.dispose();
    });

    it('should start as unknown', () => {
      expect(currentStatus).toEqual('unknown');
    });

    const exitCodeStatusPairs = [
      [FLOW_RETURN_CODES.ok, 'ready'],
      [FLOW_RETURN_CODES.typeError, 'ready'],
      [FLOW_RETURN_CODES.serverInitializing, 'init'],
      [FLOW_RETURN_CODES.noServerRunning, 'not running'],
      [FLOW_RETURN_CODES.outOfRetries, 'busy'],
      // server/client version mismatch -- this kills the server
      [FLOW_RETURN_CODES.buildIdMismatch, 'not running'],
    ];
    exitCodeStatusPairs.forEach(([exitCode, status]) => {
      it(`should be ${status} when Flow returns ${exitCode}`, () => {
        waitsForPromise(async () => {
          fakeAsyncExec = () => ({exitCode});
          await execFlow();
          expect(currentStatus).toEqual(status);
        });
      });
    });

    it('should ping the server after it is started', () => {
      waitsForPromise(async () => {
        const states = flowProcess._serverStatus.take(4).toArray().toPromise();
        fakeAsyncExec = () => {
          switch (currentStatus) {
            case 'unknown':
              return {exitCode: FLOW_RETURN_CODES.noServerRunning};
            case 'not running':
              return {exitCode: FLOW_RETURN_CODES.serverInitializing};
            case 'init':
              return {exitCode: FLOW_RETURN_CODES.ok};
            default:
              throw new Error('should not happen');
          }
        };
        await execFlow();
        expect(await states).toEqual(['unknown', 'not running', 'init', 'ready']);
      });
    });
  });
});
