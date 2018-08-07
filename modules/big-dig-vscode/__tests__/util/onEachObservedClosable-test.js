"use strict";

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _globals() {
  const data = require("../../../nuclide-jest/globals");

  _globals = function () {
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
(0, _globals().describe)('onEachObservedClosable', () => {
  let obs;

  const onDisposed = _globals().jest.fn();

  const handler = _globals().jest.fn();

  beforeEach(() => {
    obs = new _RxMin.Subject();
    onDisposed.mockReset();
    handler.mockReset();
  });
  (0, _globals().it)('empty', () => {
    const sub = (0, _onEachObservedClosable().default)(obs, handler, onDisposed);
    sub.dispose();
    (0, _globals().expect)(handler).toHaveBeenCalledTimes(0);
    (0, _globals().expect)(onDisposed).toHaveBeenCalledTimes(0);
    (0, _globals().expect)(obs.observers.length).toBe(0); // Once sub has been disposed, the handler should not be called.

    obs.next(0);
    (0, _globals().expect)(handler).toHaveBeenCalledTimes(0);
  });
  (0, _globals().it)('once', () => {
    const teardown = _globals().jest.fn();

    const teardownOnClose = _globals().jest.fn();

    handler.mockReturnValueOnce(teardown);
    onDisposed.mockReturnValueOnce(teardownOnClose);
    const sub = (0, _onEachObservedClosable().default)(obs, handler, onDisposed);
    obs.next(5);
    (0, _globals().expect)(handler).toHaveBeenCalledTimes(1);
    (0, _globals().expect)(handler).toHaveBeenCalledWith(5);
    (0, _globals().expect)(onDisposed).toHaveBeenCalledTimes(1);
    (0, _globals().expect)(teardown).toHaveBeenCalledTimes(0);
    (0, _globals().expect)(teardownOnClose).toHaveBeenCalledTimes(0);
    (0, _globals().expect)(onDisposed.mock.calls[0][0]).toBe(5); // Close it.

    onDisposed.mock.calls[0][1]();
    (0, _globals().expect)(handler).toHaveBeenCalledTimes(1);
    (0, _globals().expect)(onDisposed).toHaveBeenCalledTimes(1);
    (0, _globals().expect)(teardown).toHaveBeenCalledTimes(1);
    (0, _globals().expect)(teardownOnClose).toHaveBeenCalledTimes(1);
    sub.dispose(); // Should not call the handler.

    obs.next(4);
    (0, _globals().expect)(handler).toHaveBeenCalledTimes(1);
  });
  (0, _globals().it)('teardown: Promise', async () => {
    const teardown = _globals().jest.fn();

    const teardownOnClose = _globals().jest.fn();

    handler.mockResolvedValue(teardown);
    onDisposed.mockReturnValueOnce(teardownOnClose);
    (0, _onEachObservedClosable().default)(obs, handler, onDisposed);
    obs.next(5); // Close it.

    onDisposed.mock.calls[0][1]();
    await (0, _promise().nextTick)();
    (0, _globals().expect)(teardownOnClose).toHaveBeenCalledTimes(1);
    (0, _globals().expect)(teardown).toHaveBeenCalledTimes(1);
  });
  (0, _globals().it)('teardown: null', async () => {
    const teardownOnClose = _globals().jest.fn();

    handler.mockResolvedValue(null);
    onDisposed.mockReturnValueOnce(teardownOnClose);
    (0, _onEachObservedClosable().default)(obs, handler, onDisposed);
    obs.next(5); // Close it.

    onDisposed.mock.calls[0][1]();
    await (0, _promise().nextTick)();
    (0, _globals().expect)(teardownOnClose).toHaveBeenCalledTimes(1);
  });
  (0, _globals().it)('teardown: Promise null', async () => {
    const teardownOnClose = _globals().jest.fn();

    handler.mockResolvedValue(null);
    onDisposed.mockReturnValueOnce(teardownOnClose);
    (0, _onEachObservedClosable().default)(obs, handler, onDisposed);
    obs.next(5); // Close it.

    onDisposed.mock.calls[0][1]();
    await (0, _promise().nextTick)();
    (0, _globals().expect)(teardownOnClose).toHaveBeenCalledTimes(1);
  });
  (0, _globals().it)('teardown: Promise, late', async () => {
    const deferredTeardown = new (_promise().Deferred)();

    const teardown = _globals().jest.fn();

    const teardownOnClose = _globals().jest.fn();

    handler.mockReturnValueOnce(deferredTeardown.promise);
    onDisposed.mockReturnValueOnce(teardownOnClose);
    (0, _onEachObservedClosable().default)(obs, handler, onDisposed);
    obs.next(5); // Close it.

    onDisposed.mock.calls[0][1]();
    (0, _globals().expect)(teardownOnClose).toHaveBeenCalledTimes(1);
    deferredTeardown.resolve(teardown);
    await (0, _promise().nextTick)();
    (0, _globals().expect)(teardown).toHaveBeenCalledTimes(1);
  });
  (0, _globals().it)('disposeHandlersOnUnsubscribe: false', () => {
    const teardown = _globals().jest.fn();

    const teardownOnClose = _globals().jest.fn();

    handler.mockReturnValueOnce(teardown);
    onDisposed.mockReturnValueOnce(teardownOnClose);
    const sub = (0, _onEachObservedClosable().default)(obs, handler, onDisposed, {
      disposeHandlersOnUnsubscribe: false
    });
    obs.next(5);
    (0, _globals().expect)(teardown).toHaveBeenCalledTimes(0);
    (0, _globals().expect)(teardownOnClose).toHaveBeenCalledTimes(0); // Should NOT call teardown.

    sub.dispose();
    (0, _globals().expect)(teardown).toHaveBeenCalledTimes(0);
    (0, _globals().expect)(teardownOnClose).toHaveBeenCalledTimes(0);
  });
  (0, _globals().it)('disposeHandlersOnUnsubscribe: true', () => {
    const teardown = _globals().jest.fn();

    const teardownOnClose = _globals().jest.fn();

    handler.mockReturnValueOnce(teardown);
    onDisposed.mockReturnValueOnce(teardownOnClose);
    const sub = (0, _onEachObservedClosable().default)(obs, handler, onDisposed, {
      disposeHandlersOnUnsubscribe: true
    });
    obs.next(5); // Should also call teardown.

    sub.dispose();
    (0, _globals().expect)(teardown).toHaveBeenCalledTimes(1);
    (0, _globals().expect)(teardownOnClose).toHaveBeenCalledTimes(1);
  });
  (0, _globals().it)('disposeHandlerOnNext: false', () => {
    const teardown1 = _globals().jest.fn();

    const teardownOnClose1 = _globals().jest.fn();

    const teardown2 = _globals().jest.fn();

    const teardownOnClose2 = _globals().jest.fn();

    handler.mockReturnValueOnce(teardown1).mockReturnValueOnce(teardown2);
    onDisposed.mockReturnValueOnce(teardownOnClose1).mockReturnValueOnce(teardownOnClose2);
    (0, _onEachObservedClosable().default)(obs, handler, onDisposed, {
      disposeHandlerOnNext: false
    });
    obs.next(4); // Should not dispose the first handler.

    obs.next(5);
    (0, _globals().expect)(handler).toHaveBeenCalledTimes(2);
    (0, _globals().expect)(onDisposed).toHaveBeenCalledTimes(2);
    (0, _globals().expect)(teardown1).toHaveBeenCalledTimes(0);
    (0, _globals().expect)(teardownOnClose1).toHaveBeenCalledTimes(0);
    (0, _globals().expect)(teardown2).toHaveBeenCalledTimes(0);
    (0, _globals().expect)(teardownOnClose2).toHaveBeenCalledTimes(0); // Close the second.

    onDisposed.mock.calls[1][1]();
    (0, _globals().expect)(teardown1).toHaveBeenCalledTimes(0);
    (0, _globals().expect)(teardownOnClose1).toHaveBeenCalledTimes(0);
    (0, _globals().expect)(teardown2).toHaveBeenCalledTimes(1);
    (0, _globals().expect)(teardownOnClose2).toHaveBeenCalledTimes(1); // Close the first.

    onDisposed.mock.calls[0][1]();
    (0, _globals().expect)(teardown1).toHaveBeenCalledTimes(1);
    (0, _globals().expect)(teardownOnClose1).toHaveBeenCalledTimes(1);
    (0, _globals().expect)(teardown2).toHaveBeenCalledTimes(1);
    (0, _globals().expect)(teardownOnClose2).toHaveBeenCalledTimes(1);
  });
  (0, _globals().it)('disposeHandlerOnNext: true', () => {
    const teardown1 = _globals().jest.fn();

    const teardownOnClose1 = _globals().jest.fn();

    const teardown2 = _globals().jest.fn();

    const teardownOnClose2 = _globals().jest.fn();

    handler.mockReturnValueOnce(teardown1).mockImplementationOnce(() => {
      // The first handler should be disposed before the second handler is
      // called.
      (0, _globals().expect)(teardown1).toHaveBeenCalledTimes(1);
      return teardown2;
    });
    onDisposed.mockReturnValueOnce(teardownOnClose1).mockReturnValueOnce(teardownOnClose2);
    (0, _onEachObservedClosable().default)(obs, handler, onDisposed, {
      disposeHandlerOnNext: true
    });
    obs.next(4); // Should close the first handler.

    obs.next(5);
    (0, _globals().expect)(handler).toHaveBeenCalledTimes(2);
    (0, _globals().expect)(onDisposed).toHaveBeenCalledTimes(2); // The first is closed.

    (0, _globals().expect)(teardown1).toHaveBeenCalledTimes(1);
    (0, _globals().expect)(teardownOnClose1).toHaveBeenCalledTimes(1); // Close the second.

    onDisposed.mock.calls[1][1](); // The second is closed.

    (0, _globals().expect)(teardown2).toHaveBeenCalledTimes(1);
    (0, _globals().expect)(teardownOnClose2).toHaveBeenCalledTimes(1);
  });
});