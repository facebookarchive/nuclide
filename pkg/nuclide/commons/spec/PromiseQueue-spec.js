'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var PromiseQueue = require('../lib/PromiseQueue');

describe('PromiseQueue', () => {

  // Workarounds to enable setTimeout, as suggested by:
  // https://discuss.atom.io/t/solved-settimeout-not-working-firing-in-specs-tests/11427/17
  beforeEach(() => window.useRealClock());

  // This also does not work even though the docs say that it should:
  // https://discuss.atom.io/t/how-can-i-add-my-own-matchers-to-jasmine/12969/
  // beforeEach(() => {
  //   addMatchers({
  //     toBeLessThanOrEqualTo: () => {
  //       return {
  //         compare: (actual, expected) => {
  //           return {
  //             pass: actual < expected,
  //           };
  //         },
  //       };
  //     },
  //   });
  // });

  it('Run three async operations and make sure they do not overlap.', () => {
    var queue = new PromiseQueue();
    var res1Start, res1End;
    var res2Start, res2End;
    var res3Start, res3End;

    runs(() => {
      queue.submit((resolve, reject) => {
        res1Start = Date.now();
        setTimeout(() => { resolve(res1End = Date.now()); }, 100);
      });
      queue.submit((resolve, reject) => {
        res2Start = Date.now();
        setTimeout(() => { resolve(res2End = Date.now()); }, 200);
      });
      queue.submit((resolve, reject) => {
        res3Start = Date.now();
        setTimeout(() => { resolve(res3End = Date.now()); }, 300);
      });
    });

    waitsFor(() => res1End && res2End && res3End, 700);

    runs(() => {
      // There is no toBeLessThanOrEqualTo matcher, and as you can see from
      // above, attempting to define our own matcher has failed.

      // First, make sure that none of the executors overlapped.
      expect(res1Start <= res1End).toBe(true);
      expect(res1End <= res2Start).toBe(true);
      expect(res2Start <= res2End).toBe(true);
      expect(res2End <= res3Start).toBe(true);
      expect(res3Start <= res3End).toBe(true);

      // Make sure the executors took the expected duration.
      expect(res2End - res1End >= 200).toBe(true);
      expect(res3End - res2End >= 300).toBe(true);
      expect(res3End - res1End >= 500).toBe(true);
    });
  });

});
