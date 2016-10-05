Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = scheduleIdleCallback;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * `scheduleIdleCallback` is a wrapper around `requestIdleCallback` that:
 *   - Returns a disposable.
 *   - Manages checking `timeRemaining`.
 *
 * `timeRemaining` is how much time the system thinks is available for your
 * work. `50` is the maximum allowed value. By choosing `49` for
 * `afterRemainingTime`, you're saying: "only invoke the callback when there
 * are 49ms available for me to do work". It was can take multiple loops around
 * `requestIdleCallback` for so much time to become available.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var requestIdleCallback = global.requestIdleCallback;
var cancelIdleCallback = global.cancelIdleCallback;

function scheduleIdleCallback(callback_) {
  var afterRemainingTime = arguments.length <= 1 || arguments[1] === undefined ? 49 : arguments[1];

  var callback = callback_;
  var id = undefined;
  function fn(deadline) {
    if (deadline.timeRemaining() >= afterRemainingTime) {
      (0, (_assert2 || _assert()).default)(callback != null);
      callback(deadline);
      id = callback = null;
    } else {
      id = requestIdleCallback(fn);
    }
  }
  id = requestIdleCallback(fn);
  return {
    dispose: function dispose() {
      if (id != null) {
        cancelIdleCallback(id);
        id = callback = null;
      }
    }
  };
}

module.exports = exports.default;