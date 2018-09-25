"use strict";

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _RpcProcess() {
  const data = require("../lib/RpcProcess");

  _RpcProcess = function () {
    return data;
  };

  return data;
}

function _nuclideRpc() {
  const data = require("../../nuclide-rpc");

  _nuclideRpc = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _waits_for() {
  const data = _interopRequireDefault(require("../../../jest/waits_for"));

  _waits_for = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
describe('RpcProcess', () => {
  let server;
  beforeEach(() => {
    const PROCESS_PATH = _nuclideUri().default.join(__dirname, '../__mocks__/fixtures/dummy-service/dummyioserver.py');

    const OPTS = {
      cwd: _nuclideUri().default.dirname(PROCESS_PATH),
      stdio: 'pipe',
      detached: false
    };
    const serviceRegistry = new (_nuclideRpc().ServiceRegistry)([], [{
      name: 'dummy',
      definition: _nuclideUri().default.join(__dirname, '../__mocks__/fixtures/dummy-service/DummyService.js'),
      implementation: _nuclideUri().default.join(__dirname, '../__mocks__/fixtures/dummy-service/DummyService.js'),
      preserveFunctionNames: true
    }]);
    const processStream = (0, _process().spawn)('python', [PROCESS_PATH], OPTS) // For the sake of our tests, simulate creating the process asynchronously.
    .subscribeOn(_RxMin.Scheduler.async);
    server = new (_RpcProcess().RpcProcess)('Dummy IO Server', serviceRegistry, processStream);
  });
  afterEach(() => {
    if (!(server != null)) {
      throw new Error("Invariant violation: \"server != null\"");
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
    const service = await getService();
    const responses = await Promise.all([service.a(), service.b(), service.c(), service.d()]);
    expect(responses.length).toBe(4);
    expect(responses).toEqual([{
      hello: 'Hello World'
    }, {
      hello: 'Hello World'
    }, {
      hello: 'Hello World'
    }, {
      hello: 'Hello World'
    }]);
  });
  it('should reject pending calls upon error', async () => {
    try {
      await (await getService()).error();

      if (!false) {
        throw new Error('Fail - expected promise to reject');
      }
    } catch (e) {
      expect(e).toEqual('Command to error received');
    }
  });
  it('should reject pending calls upon the child process exiting', async () => {
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
  });
  it('should recover gracefully after the child process exits', async () => {
    try {
      await (await getService()).kill();

      if (!false) {
        throw new Error('Fail - expected promise to reject');
      }
    } catch (e) {} // Ignore.
    // Subsequent request should process successfully, meaning the killed
    // child process has been restarted.


    const response = await (await getService()).polarbears();
    expect(response).toEqual({
      hello: 'Hello World'
    });
    expect(server.isDisposed()).toBe(false);
  });
  it('dispose should kill the process', async () => {
    await getService();
    const process = server._process;

    if (!(process != null)) {
      throw new Error("Invariant violation: \"process != null\"");
    }

    const spy = jest.fn();
    process.on('exit', spy);
    server.dispose();
    await (0, _waits_for().default)(() => spy.mock.calls.length > 0);
    const exitSpy = jest.fn();
    server.observeExitMessage().subscribe(() => exitSpy()); // Manual dispose should not trigger any side effects.

    expect(exitSpy).not.toHaveBeenCalled();
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
});