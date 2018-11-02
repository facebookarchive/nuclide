"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = processTimed;

function _performanceNow() {
  const data = _interopRequireDefault(require("./performanceNow"));

  _performanceNow = function () {
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
 *  strict-local
 * @format
 */

/**
 * Splits tasks that would normally block for a long time across several tasks
 * using `setTimeout`.
 * @param process        - A generator function that does work in chunks, after each
 *                         yield is called.
 * @param options.limit  - A budget limiting the time (in ms) that can be spent
 *                         synchronously processing chunks. Chunks are processed
 *                         until this limit is reached, after which a new task
 *                         will be scheduled asynchronously.
 * @param options.delay  - The time (in ms) between processing tasks.
 * @param options.signal - An `AbortSignal` that can be used to cancel processing.
 */
function processTimed(process, options) {
  var _options$signal;

  if ((_options$signal = options.signal) === null || _options$signal === void 0 ? void 0 : _options$signal.aborted) {
    return;
  } // Kick off the generator once and hand a stateful iterator to
  // `processTimedIterator`.
  // $FlowFixMe


  processTimedIterator(process(), options);
}

function processTimedIterator(processIterator, {
  limit,
  delay,
  signal
}) {
  if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
    return;
  }

  let done;
  const before = (0, _performanceNow().default)();

  do {
    ({
      done
    } = processIterator.next());
  } while (!done && (0, _performanceNow().default)() - before < limit); // Schedule another batch after `delay` if we're not done yet.


  if (!done) {
    setTimeout(() => {
      processTimedIterator(processIterator, {
        limit,
        delay,
        signal
      });
    }, delay);
  }
}