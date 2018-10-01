"use strict";

var _os = _interopRequireDefault(require("os"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
describe('FlowProcess', () => {
  let fakeRunCommandDetailed = null; // Mocked ChildProcess instance (not typed as such because the mock only implements a subset of
  // methods).

  let childSpy;
  let flowProcess = null;
  let niceSpy;
  let root;
  let binary;

  function execFlow(waitForServer = true) {
    return flowProcess.execFlow([], {}, waitForServer);
  }

  let FLOW_RETURN_CODES;
  let FlowProcess;
  let FlowExecInfoContainer;
  beforeEach(() => {
    jest.resetModules();

    const processModule = require("../../../modules/nuclide-commons/process");

    const runCommand = processModule.runCommand;
    jest.spyOn(processModule, 'runCommand').mockImplementation((command, args, options) => {
      if (args && args[0] === 'version' && args[1] === '--json') {
        return new _RxMin.Observable.of(JSON.stringify({
          binary
        }));
      }

      return runCommand.call(void 0, command, args, options);
    });
    jest.spyOn(processModule, 'runCommandDetailed') // We need this level of indirection to ensure that if fakeRunCommandDetailed
    // is rebound, the new one gets executed.
    .mockImplementation((...args) => fakeRunCommandDetailed(...args));
    childSpy = {
      stdout: {
        on() {}

      },
      stderr: {
        on() {}

      },

      on() {},

      kill() {}

    };

    const niceModule = require("../../../modules/nuclide-commons/nice");

    niceSpy = jest.spyOn(niceModule, 'niceSafeSpawn').mockImplementation(() => {
      return childSpy;
    });

    const nuclideUri = require("../../../modules/nuclide-commons/nuclideUri").default;

    root = nuclideUri.join(__dirname, 'fixtures/with-flow-bin');
    binary = nuclideUri.join(root, 'node_modules/.bin/flow');

    const FlowProcessModule = require("../lib/FlowProcess");

    FLOW_RETURN_CODES = FlowProcessModule.FLOW_RETURN_CODES;
    FlowProcess = FlowProcessModule.FlowProcess;

    const FlowExecInfoContainerModule = require("../lib/FlowExecInfoContainer");

    FlowExecInfoContainer = FlowExecInfoContainerModule.FlowExecInfoContainer;
    fakeRunCommandDetailed = jest.fn().mockReturnValue(_RxMin.Observable.of({
      exitCode: FLOW_RETURN_CODES.ok
    }));
    flowProcess = new FlowProcess(root, new FlowExecInfoContainer(), null);
  }
  /* File Cache */
  );
  describe('Server startup and teardown', () => {
    beforeEach(async () => {
      let called = false; // we want runCommandDetailed to error the first time, to mimic Flow not
      // runinng. Then, it will spawn a new flow process, and we want that to be
      // successful

      fakeRunCommandDetailed = () => {
        if (called) {
          return _RxMin.Observable.of({
            exitCode: FLOW_RETURN_CODES.ok
          });
        } else {
          called = true;
          return _RxMin.Observable.throw({
            exitCode: FLOW_RETURN_CODES.noServerRunning,
            stderr: "There is no flow server running\n'/path/to/flow/root'"
          });
        }
      };

      jest.spyOn(childSpy, 'kill').mockImplementation(() => {});
      jest.spyOn(childSpy, 'on').mockImplementation(() => {});
      await execFlow();
    });
    describe('execFlow', () => {
      it('should spawn a new Flow server', () => {
        const cpus = _os.default.cpus();

        const expectedWorkers = cpus ? cpus.length - 2 : 1;
        const args = niceSpy.mock.calls[niceSpy.mock.calls.length - 1];
        expect(args[0]).toEqual(binary);
        expect(args[1]).toEqual(['server', '--from', 'nuclide', '--max-workers', expectedWorkers.toString(), root]);
        expect(args[2].cwd).toEqual(root);
        expect(args[2].env.OCAMLRUNPARAM).toEqual('b');
      });
    });
    describe('crashing Flow', () => {
      let event;
      let handler;
      beforeEach(() => {
        [event, handler] = childSpy.on.mock.calls[childSpy.on.mock.calls.length - 1]; // simulate a Flow crash

        handler(2, null);
      });
      it('should blacklist the root', async () => {
        expect(event).toBe('exit');
        expect((await execFlow())).toBeNull();
      });
      it('should allow the server to restart if allowServerRestart is called', async () => {
        expect(event).toBe('exit');
        flowProcess.allowServerRestart();
        expect((await execFlow())).not.toBeNull();
      });
    });
    describe('dispose', () => {
      it('should kill flow server', async () => {
        flowProcess.dispose();
        expect(childSpy.kill).toHaveBeenCalledWith('SIGKILL');
      });
    });
  });
  describe('server state updates', () => {
    let currentStatus = null;
    let subscription = null;
    let statusUpdates = null;
    beforeEach(() => {
      currentStatus = null;
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
    jest.resetModules();
    FLOW_RETURN_CODES = require("../lib/FlowProcess").FLOW_RETURN_CODES;
    const exitCodeStatusPairs = [[FLOW_RETURN_CODES.ok, 'ready'], [FLOW_RETURN_CODES.typeError, 'ready'], [FLOW_RETURN_CODES.serverInitializing, 'init'], [FLOW_RETURN_CODES.noServerRunning, 'not running'], [FLOW_RETURN_CODES.outOfRetries, 'busy'], // server/client version mismatch -- this kills the server
    [FLOW_RETURN_CODES.buildIdMismatch, 'not running']];
    exitCodeStatusPairs.forEach(([exitCode, status]) => {
      it(`should be ${status} when Flow returns ${exitCode}`, async () => {
        fakeRunCommandDetailed = () => _RxMin.Observable.of({
          exitCode
        });

        await execFlow(
        /* waitForServer */
        false).catch(e => {
          expect(e.exitCode).toBe(exitCode);
        });
        expect(currentStatus).toEqual(status);
      });
    });
    it('should ping the server after it is started', async () => {
      const states = statusUpdates.take(4).toArray().toPromise();

      fakeRunCommandDetailed = () => {
        switch (currentStatus) {
          case 'unknown':
            return _RxMin.Observable.of({
              exitCode: FLOW_RETURN_CODES.noServerRunning
            });

          case 'not running':
            return _RxMin.Observable.of({
              exitCode: FLOW_RETURN_CODES.serverInitializing
            });

          case 'init':
            return _RxMin.Observable.of({
              exitCode: FLOW_RETURN_CODES.ok
            });

          default:
            throw new Error('should not happen');
        }
      };

      await execFlow(
      /* waitForServer */
      false).catch(e => {
        expect(e.exitCode).toBe(FLOW_RETURN_CODES.noServerRunning);
      });
      expect((await states)).toEqual(['unknown', 'not running', 'init', 'ready']);
    });
  });
  describe('execFlowClient', () => {
    it('should call runCommandDetailed', async () => {
      await FlowProcess.execFlowClient(['arg'], null, new FlowExecInfoContainer());
      expect(fakeRunCommandDetailed.mock.calls[0][0]).toEqual(binary);
      expect(fakeRunCommandDetailed.mock.calls[0][1]).toEqual(['arg', '--from', 'nuclide']);
    });
  });
});