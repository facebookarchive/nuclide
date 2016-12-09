/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */


import type {Observable} from 'rxjs';

import type {ServerStatusType} from '..';
import type {FlowProcess as FlowProcessType} from '../lib/FlowProcess';

import os from 'os';

function resetModules() {
  for (const key in require.cache) {
    delete require.cache[key];
  }
}

describe('FlowProcess', () => {
  let fakeCheckOutput: () => Object = (null: any);

  // Mocked ChildProcess instance (not typed as such because the mock only implements a subset of
  // methods).
  let childSpy: any;

  let flowProcess: FlowProcessType = (null: any);

  let niceSpy: JasmineSpy = (null: any);
  let root: string;
  let binary: string;

  function execFlow(waitForServer = true) {
    return flowProcess.execFlow([], {}, waitForServer);
  }

  let FLOW_RETURN_CODES;
  let FlowProcess;
  let FlowExecInfoContainer;

  beforeEach(() => {
    resetModules();

    const processModule = require('../../commons-node/process');
    const checkOutput = processModule.checkOutput;

    spyOn(processModule, 'checkOutput')
      .andCallFake(async function(command, args, options) {
        if (args && args[0] === 'version' && args[1] === '--json') {
          return new Promise(resolve => resolve({
            stdout: JSON.stringify({binary}),
            stderr: '',
            exitCode: 0,
          }));
        }
        return checkOutput.call(this, command, args, options);
      });

    spyOn(processModule, 'asyncExecute')
      // We need this level of indirection to ensure that if fakeCheckOutput
      // is rebound, the new one gets executed.
      .andCallFake((...args) => fakeCheckOutput(...args));

    childSpy = {
      stdout: {on() {}},
      stderr: {on() {}},
      on() {},
      kill() {},
    };

    const niceModule = require('../../commons-node/nice');
    niceSpy = spyOn(niceModule, 'niceSafeSpawn')
      .andCallFake(() => {
        return childSpy;
      });

    const nuclideUri = require('../../commons-node/nuclideUri').default;
    root = nuclideUri.join(__dirname, 'fixtures/with-flow-bin');
    binary = nuclideUri.join(root, 'node_modules/.bin/flow');

    const FlowProcessModule = require('../lib/FlowProcess');
    FLOW_RETURN_CODES = FlowProcessModule.FLOW_RETURN_CODES;
    FlowProcess = FlowProcessModule.FlowProcess;

    const FlowExecInfoContainerModule = require('../lib/FlowExecInfoContainer');
    FlowExecInfoContainer = FlowExecInfoContainerModule.FlowExecInfoContainer;

    fakeCheckOutput = jasmine.createSpy().andReturn({exitCode: FLOW_RETURN_CODES.ok});

    flowProcess = new FlowProcess(root, new FlowExecInfoContainer());
  });

  afterEach(() => {
    resetModules();
  });

  describe('Server startup and teardown', () => {
    beforeEach(() => {
      let called = false;
      // we want asyncExecute to error the first time, to mimic Flow not
      // runinng. Then, it will spawn a new flow process, and we want that to be
      // successful
      fakeCheckOutput = () => {
        if (called) {
          return {exitCode: FLOW_RETURN_CODES.ok};
        } else {
          called = true;
          return {
            exitCode: FLOW_RETURN_CODES.noServerRunning,
            stderr: 'There is no flow server running\n\'/path/to/flow/root\'',
          };
        }
      };

      spyOn(childSpy, 'kill');
      spyOn(childSpy, 'on');

      waitsForPromise(async () => { await execFlow(); });
    });

    describe('execFlow', () => {
      it('should spawn a new Flow server', () => {
        const expectedWorkers = os.cpus().length - 2;
        const args: Array<any> = niceSpy.mostRecentCall.args;
        expect(args[0]).toEqual(binary);
        expect(args[1]).toEqual(
          [
            'server',
            '--from', 'nuclide',
            '--max-workers', expectedWorkers.toString(),
            root,
          ],
        );
        expect(args[2].cwd).toEqual(root);
        expect(args[2].env.OCAMLRUNPARAM).toEqual('b');
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
        waitsForPromise(async () => {
          expect(event).toBe('exit');
          expect(await execFlow()).toBeNull();
        });
      });

      it('should allow the server to restart if allowServerRestart is called', () => {
        waitsForPromise(async () => {
          expect(event).toBe('exit');

          flowProcess.allowServerRestart();

          expect(await execFlow()).not.toBeNull();
        });
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
    let subscription: rxjs$ISubscription = (null: any);
    let statusUpdates: Observable<ServerStatusType> = (null: any);

    beforeEach(() => {
      currentStatus = (null: any);
      statusUpdates = flowProcess.getServerStatusUpdates();
      subscription = statusUpdates.subscribe(status => {
        currentStatus = status;
      });
    });

    afterEach(() => {
      subscription.unsubscribe();
    });

    it('should start as unknown', () => {
      expect(currentStatus).toEqual('unknown');
    });

    resetModules();
    FLOW_RETURN_CODES = require('../lib/FlowProcess').FLOW_RETURN_CODES;

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
          fakeCheckOutput = () => ({exitCode});
          await execFlow(/* waitForServer */ false).catch(e => {
            expect(e.exitCode).toBe(exitCode);
          });
          expect(currentStatus).toEqual(status);
        });
      });
    });

    it('should ping the server after it is started', () => {
      waitsForPromise(async () => {
        jasmine.useRealClock();
        const states = statusUpdates.take(4).toArray().toPromise();
        fakeCheckOutput = () => {
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
        await execFlow(/* waitForServer */ false).catch(e => {
          expect(e.exitCode).toBe(FLOW_RETURN_CODES.noServerRunning);
        });
        expect(await states).toEqual(['unknown', 'not running', 'init', 'ready']);
      });
    });
  });

  describe('execFlowClient', () => {
    it('should call asyncExecute', () => {
      waitsForPromise(async () => {
        await FlowProcess.execFlowClient(['arg'], null, new FlowExecInfoContainer());
        const [asyncExecuteArgs] = fakeCheckOutput.argsForCall;
        expect(asyncExecuteArgs[0]).toEqual(binary);
        expect(asyncExecuteArgs[1]).toEqual(['arg', '--from', 'nuclide']);
      });
    });
  });
});
