"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.waitsForAsync = exports.default = void 0;

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

/*
 * Async implementation of Jasmine's waitsFor()
 */
const waitsFor = async (fn, message, timeout = global[Symbol.for('WAITS_FOR_TIMEOUT')] || 4500) => {
  const startTime = Date.now();
  let returnValue; // eslint-disable-next-line no-await-in-loop

  while (!Boolean(returnValue = await fn())) {
    if (Date.now() - startTime > timeout) {
      throw new Error(message != null ? typeof message === 'function' ? message() : message : 'Expected the function to start returning "true" but it never did.');
    } // eslint-disable-next-line no-await-in-loop


    await new Promise(resolve => setTimeout(resolve, 40));
  }

  if (returnValue == null) {
    throw new Error('value must be present');
  }

  return returnValue;
};

var _default = waitsFor; // Same function but flow compatible with returning a promise from
// the passed fn

exports.default = _default;

const waitsForAsync = async (fn, message, timeout) => {
  const result = await waitsFor(fn, message, timeout);
  return result;
};

exports.waitsForAsync = waitsForAsync;