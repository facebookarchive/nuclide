'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = waitsForPromise;
function waitsForPromise(...args) {
  let shouldReject;
  let timeout;
  if (args.length > 1) {
    shouldReject = args[0].shouldReject;
    timeout = args[0].timeout;
  } else {
    shouldReject = false;
    timeout = 0;
  }

  let finished = false;

  runs(() => {
    const fn = args[args.length - 1];

    if (!(typeof fn === 'function')) {
      throw new Error('Invariant violation: "typeof fn === \'function\'"');
    }

    const promise = fn();
    if (shouldReject) {
      promise.then(() => {
        jasmine.getEnv().currentSpec.fail('Expected promise to be rejected, but it was resolved');
      }, () => {
        // Do nothing, it's expected.
      }).then(() => {
        finished = true;
      });
    } else {
      promise.then(() => {
        // Do nothing, it's expected.
      }, error => {
        const text = error ? error.stack || error.toString() : 'undefined';
        jasmine.getEnv().currentSpec.fail(`Expected promise to be resolved, but it was rejected with ${text}`);
      }).then(() => {
        finished = true;
      });
    }
  });

  waitsFor(timeout, () => finished);
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */