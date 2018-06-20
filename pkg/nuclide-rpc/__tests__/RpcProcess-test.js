'use strict';

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('../../../modules/nuclide-commons/process');
}

var _RpcProcess;

function _load_RpcProcess() {
  return _RpcProcess = require('../lib/RpcProcess');
}

var _nuclideRpc;

function _load_nuclideRpc() {
  return _nuclideRpc = require('../../nuclide-rpc');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _waits_for;

function _load_waits_for() {
  return _waits_for = _interopRequireDefault(require('../../../jest/waits_for'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('RpcProcess', () => {
  let server;

  beforeEach(() => {
    const PROCESS_PATH = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/fixtures/dummy-service/dummyioserver.py');
    const OPTS = {
      cwd: (_nuclideUri || _load_nuclideUri()).default.dirname(PROCESS_PATH),
      stdio: 'pipe',
      detached: false
    };

    const serviceRegistry = new (_nuclideRpc || _load_nuclideRpc()).ServiceRegistry([], [{
      name: 'dummy',
      definition: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/fixtures/dummy-service/DummyService.js'),
      implementation: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/fixtures/dummy-service/DummyService.js'),
      preserveFunctionNames: true
    }]);

    const processStream = (0, (_process || _load_process()).spawn)('python', [PROCESS_PATH], OPTS)
    // For the sake of our tests, simulate creating the process asynchronously.
    .subscribeOn(_rxjsBundlesRxMinJs.Scheduler.async);
    server = new (_RpcProcess || _load_RpcProcess()).RpcProcess('Dummy IO Server', serviceRegistry, processStream);
  });

  afterEach(() => {
    if (!(server != null)) {
      throw new Error('Invariant violation: "server != null"');
    }

    server.dispose();
  });

  function getService() {
    return server.getService('dummy');
  }

  it('should be able to complete calls', async () => {
    await (async () => {
      // All methods except 'kill' and 'error' return the same result in our
      // dummy server.
      const response = await (await getService()).binarysystems();
      expect(response).toEqual({
        hello: 'Hello World'
      });
    })();
  });

  it('should be able to handle multiple calls', async () => {
    await (async () => {
      const service = await getService();
      const responses = await Promise.all([service.a(), service.b(), service.c(), service.d()]);
      expect(responses.length).toBe(4);
      expect(responses).toEqual([{ hello: 'Hello World' }, { hello: 'Hello World' }, { hello: 'Hello World' }, { hello: 'Hello World' }]);
    })();
  });

  it('should reject pending calls upon error', async () => {
    await (async () => {
      try {
        await (await getService()).error();

        if (!false) {
          throw new Error('Fail - expected promise to reject');
        }
      } catch (e) {
        expect(e).toEqual('Command to error received');
      }
    })();
  });

  it('should reject pending calls upon the child process exiting', async () => {
    await (async () => {
      const message = server.observeExitMessage().take(1).toPromise();
      try {
        await (await getService()).kill();

        if (!false) {
          throw new Error('Fail - expected promise to reject');
        }
      } catch (e) {
        expect(e.message.startsWith('Remote Error: Connection Closed processing message')).toBeTruthy();
      }
      expect((await message).exitCode).toBe(0);
    })();
  });

  it('should recover gracefully after the child process exits', async () => {
    await (async () => {
      try {
        await (await getService()).kill();

        if (!false) {
          throw new Error('Fail - expected promise to reject');
        }
      } catch (e) {}
      // Ignore.


      // Subsequent request should process successfully, meaning the killed
      // child process has been restarted.
      const response = await (await getService()).polarbears();
      expect(response).toEqual({
        hello: 'Hello World'
      });
      expect(server.isDisposed()).toBe(false);
    })();
  });

  it('dispose should kill the process', async () => {
    await (async () => {
      await getService();
      const process = server._process;

      if (!(process != null)) {
        throw new Error('Invariant violation: "process != null"');
      }

      const spy = jasmine.createSpy();
      process.on('exit', spy);
      server.dispose();
      (0, (_waits_for || _load_waits_for()).default)(() => spy.wasCalled);

      const exitSpy = jasmine.createSpy();
      server.observeExitMessage().subscribe(() => exitSpy());
      // Manual dispose should not trigger any side effects.
      expect(exitSpy).not.toHaveBeenCalled();
    })();
  });

  it('should respond to dispose immediately if the process is created asynchronously', async () => {
    await (async () => {
      const service = getService();
      server.dispose();
      try {
        await service;
      } catch (e) {
        return;
      }
      throw new Error('should have thrown');
    })();
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     *  strict-local
     * @format
     */