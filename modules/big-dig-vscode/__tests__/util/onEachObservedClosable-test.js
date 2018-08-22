"use strict";

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _jest_mock_utils() {
  const data = require("../../../../jest/jest_mock_utils");

  _jest_mock_utils = function () {
    return data;
  };

  return data;
}

function _onEachObservedClosable() {
  const data = _interopRequireDefault(require("../../src/util/onEachObservedClosable"));

  _onEachObservedClosable = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
describe('onEachObservedClosable', () => {
  let obs;
  const onDisposed = jest.fn();
  const handler = jest.fn();
  beforeEach(() => {
    obs = new _RxMin.Subject();
    onDisposed.mockReset();
    handler.mockReset();
  });
  it('empty', () => {
    const sub = (0, _onEachObservedClosable().default)(obs, handler, onDisposed);
    sub.dispose();
    expect(handler).toHaveBeenCalledTimes(0);
    expect(onDisposed).toHaveBeenCalledTimes(0);
    expect(obs.observers.length).toBe(0); // Once sub has been disposed, the handler should not be called.

    obs.next(0);
    expect(handler).toHaveBeenCalledTimes(0);
  });
  it('once', () => {
    const teardown = jest.fn();
    const teardownOnClose = jest.fn();
    handler.mockReturnValueOnce(teardown);
    onDisposed.mockReturnValueOnce(teardownOnClose);
    const sub = (0, _onEachObservedClosable().default)(obs, handler, onDisposed);
    obs.next(5);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(5);
    expect(onDisposed).toHaveBeenCalledTimes(1);
    expect(teardown).toHaveBeenCalledTimes(0);
    expect(teardownOnClose).toHaveBeenCalledTimes(0);
    expect(onDisposed.mock.calls[0][0]).toBe(5); // Close it.

    onDisposed.mock.calls[0][1]();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(onDisposed).toHaveBeenCalledTimes(1);
    expect(teardown).toHaveBeenCalledTimes(1);
    expect(teardownOnClose).toHaveBeenCalledTimes(1);
    sub.dispose(); // Should not call the handler.

    obs.next(4);
    expect(handler).toHaveBeenCalledTimes(1);
  });
  it('teardown: Promise', async () => {
    const teardown = jest.fn();
    const teardownOnClose = jest.fn(); // $FlowFixMe

    (0, _jest_mock_utils().getMock)(handler).mockResolvedValue(teardown);
    onDisposed.mockReturnValueOnce(teardownOnClose);
    (0, _onEachObservedClosable().default)(obs, handler, onDisposed);
    obs.next(5); // Close it.

    onDisposed.mock.calls[0][1]();
    await (0, _promise().nextTick)();
    expect(teardownOnClose).toHaveBeenCalledTimes(1);
    expect(teardown).toHaveBeenCalledTimes(1);
  });
  it('teardown: null', async () => {
    const teardownOnClose = jest.fn();
    handler.mockResolvedValue(null);
    onDisposed.mockReturnValueOnce(teardownOnClose);
    (0, _onEachObservedClosable().default)(obs, handler, onDisposed);
    obs.next(5); // Close it.

    onDisposed.mock.calls[0][1]();
    await (0, _promise().nextTick)();
    expect(teardownOnClose).toHaveBeenCalledTimes(1);
  });
  it('teardown: Promise null', async () => {
    const teardownOnClose = jest.fn();
    handler.mockResolvedValue(null);
    onDisposed.mockReturnValueOnce(teardownOnClose);
    (0, _onEachObservedClosable().default)(obs, handler, onDisposed);
    obs.next(5); // Close it.

    onDisposed.mock.calls[0][1]();
    await (0, _promise().nextTick)();
    expect(teardownOnClose).toHaveBeenCalledTimes(1);
  });
  it('teardown: Promise, late', async () => {
    const deferredTeardown = new (_promise().Deferred)();
    const teardown = jest.fn();
    const teardownOnClose = jest.fn();
    handler.mockReturnValueOnce(deferredTeardown.promise);
    onDisposed.mockReturnValueOnce(teardownOnClose);
    (0, _onEachObservedClosable().default)(obs, handler, onDisposed);
    obs.next(5); // Close it.

    onDisposed.mock.calls[0][1]();
    expect(teardownOnClose).toHaveBeenCalledTimes(1);
    deferredTeardown.resolve(teardown);
    await (0, _promise().nextTick)();
    expect(teardown).toHaveBeenCalledTimes(1);
  });
  it('disposeHandlersOnUnsubscribe: false', () => {
    const teardown = jest.fn();
    const teardownOnClose = jest.fn();
    handler.mockReturnValueOnce(teardown);
    onDisposed.mockReturnValueOnce(teardownOnClose);
    const sub = (0, _onEachObservedClosable().default)(obs, handler, onDisposed, {
      disposeHandlersOnUnsubscribe: false
    });
    obs.next(5);
    expect(teardown).toHaveBeenCalledTimes(0);
    expect(teardownOnClose).toHaveBeenCalledTimes(0); // Should NOT call teardown.

    sub.dispose();
    expect(teardown).toHaveBeenCalledTimes(0);
    expect(teardownOnClose).toHaveBeenCalledTimes(0);
  });
  it('disposeHandlersOnUnsubscribe: true', () => {
    const teardown = jest.fn();
    const teardownOnClose = jest.fn();
    handler.mockReturnValueOnce(teardown);
    onDisposed.mockReturnValueOnce(teardownOnClose);
    const sub = (0, _onEachObservedClosable().default)(obs, handler, onDisposed, {
      disposeHandlersOnUnsubscribe: true
    });
    obs.next(5); // Should also call teardown.

    sub.dispose();
    expect(teardown).toHaveBeenCalledTimes(1);
    expect(teardownOnClose).toHaveBeenCalledTimes(1);
  });
  it('disposeHandlerOnNext: false', () => {
    const teardown1 = jest.fn();
    const teardownOnClose1 = jest.fn();
    const teardown2 = jest.fn();
    const teardownOnClose2 = jest.fn();
    handler.mockReturnValueOnce(teardown1).mockReturnValueOnce(teardown2);
    onDisposed.mockReturnValueOnce(teardownOnClose1).mockReturnValueOnce(teardownOnClose2);
    (0, _onEachObservedClosable().default)(obs, handler, onDisposed, {
      disposeHandlerOnNext: false
    });
    obs.next(4); // Should not dispose the first handler.

    obs.next(5);
    expect(handler).toHaveBeenCalledTimes(2);
    expect(onDisposed).toHaveBeenCalledTimes(2);
    expect(teardown1).toHaveBeenCalledTimes(0);
    expect(teardownOnClose1).toHaveBeenCalledTimes(0);
    expect(teardown2).toHaveBeenCalledTimes(0);
    expect(teardownOnClose2).toHaveBeenCalledTimes(0); // Close the second.

    onDisposed.mock.calls[1][1]();
    expect(teardown1).toHaveBeenCalledTimes(0);
    expect(teardownOnClose1).toHaveBeenCalledTimes(0);
    expect(teardown2).toHaveBeenCalledTimes(1);
    expect(teardownOnClose2).toHaveBeenCalledTimes(1); // Close the first.

    onDisposed.mock.calls[0][1]();
    expect(teardown1).toHaveBeenCalledTimes(1);
    expect(teardownOnClose1).toHaveBeenCalledTimes(1);
    expect(teardown2).toHaveBeenCalledTimes(1);
    expect(teardownOnClose2).toHaveBeenCalledTimes(1);
  });
  it('disposeHandlerOnNext: true', () => {
    const teardown1 = jest.fn();
    const teardownOnClose1 = jest.fn();
    const teardown2 = jest.fn();
    const teardownOnClose2 = jest.fn();
    handler.mockReturnValueOnce(teardown1).mockImplementationOnce(() => {
      // The first handler should be disposed before the second handler is
      // called.
      expect(teardown1).toHaveBeenCalledTimes(1);
      return teardown2;
    });
    onDisposed.mockReturnValueOnce(teardownOnClose1).mockReturnValueOnce(teardownOnClose2);
    (0, _onEachObservedClosable().default)(obs, handler, onDisposed, {
      disposeHandlerOnNext: true
    });
    obs.next(4); // Should close the first handler.

    obs.next(5);
    expect(handler).toHaveBeenCalledTimes(2);
    expect(onDisposed).toHaveBeenCalledTimes(2); // The first is closed.

    expect(teardown1).toHaveBeenCalledTimes(1);
    expect(teardownOnClose1).toHaveBeenCalledTimes(1); // Close the second.

    onDisposed.mock.calls[1][1](); // The second is closed.

    expect(teardown2).toHaveBeenCalledTimes(1);
    expect(teardownOnClose2).toHaveBeenCalledTimes(1);
  });
});