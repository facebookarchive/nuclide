'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function waitsForPromise(...args): any {
  if (args.length > 1) {
    var {shouldReject, timeout} = args[0];
  } else {
    var [shouldReject, timeout] = [false, 0];
  }

  var finished = false;

  runs(() => {
    var promise = args[args.length - 1]();
    if (shouldReject) {
      promise.then(() => {
        jasmine.getEnv().currentSpec.fail(
          'Expected promise to be rejected, but it was resolved');
      }, () => {
        // Do nothing, it's expected.
      }).then(() => {
        finished = true;
      });
    } else {
      promise.then(() => {
        // Do nothing, it's expected.
      }, (error) => {
        jasmine.getEnv().currentSpec.fail(
          'Expected promise to be resolved, but it was rejected with' + jasmine.pp(error));
      }).then(() => {
        finished = true;
      });
    }
  });

  waitsFor(timeout, () => finished);
}

module.exports = waitsForPromise;
