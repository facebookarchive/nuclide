'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.onceEvent = onceEvent;
exports.onceEventOrError = onceEventOrError;
exports.onceEventArray = onceEventArray;

var _promise;

function _load_promise() {
  return _promise = require('../../../nuclide-commons/promise');
}

/**
 * Creates a promise to await a single firing of `event` from `emitter`. This function only returns
 * the first argument from the event.
 */
function onceEvent(emitter, event) {
  return new Promise(resolve => {
    emitter.once(event, resolve);
  });
}

/**
 * Creates a promise to await a single firing of `event` from `emitter`. This function only returns
 * the first argument from the event.
 */
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
 */

function onceEventOrError(emitter, event) {
  const { promise, resolve, reject } = new (_promise || _load_promise()).Deferred();
  emitter.once(event, resolve);
  emitter.once('error', reject);
  return (0, (_promise || _load_promise()).lastly)(promise, () => {
    emitter.removeListener(event, resolve);
    emitter.removeListener('error', reject);
  });
}

/**
 * Creates a promise to await a single firing of `event` from `emitter`. This function returns an
 * array of all arguments from the event.
 */
function onceEventArray(emitter, event) {
  return new Promise(resolve => {
    emitter.once(event, (...args) => resolve(args));
  });
}