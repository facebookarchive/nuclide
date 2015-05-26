'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
module.exports = {

  /**
   * Returns a value derived asynchronously from an element in the items array.
   * The test function is applied sequentially to each element in items until
   * one returns a Promise that resolves to a non-null value. When this happens,
   * the Promise returned by this method will resolve to that non-null value. If
   * no such Promise is produced, then the Promise returned by this function
   * will resolve to null.
   *
   * @param items Array of elements that will be passed to test, one at a time.
   * @param test Will be called with each item and must return either:
   *     (1) A "thenable" (i.e, a Promise or promise-like object) that resolves
   *         to a derived value (that will be returned) or null.
   *     (2) null.
   *     In both cases where null is returned, test will be applied to the next
   *     item in the array.
   * @param thisArg Receiver that will be used when test is called.
   * @return Promise that resolves to an asynchronously derived value or null.
   */
  asyncFind(items: array, test, thisArg): Promise {
    return new Promise((resolve, reject) => {
      // Create a local copy of items to defend against the caller modifying the
      // array before this Promise is resolved.
      items = items.slice();
      var numItems = items.length;

      var next = async function(index) {
        if (index === numItems) {
          resolve(null);
          return;
        }

        var item = items[index];
        var result = await test.call(thisArg, item);
        if (result !== null) {
          resolve(result);
        } else {
          next(index + 1);
        }
      };

      next(0);
    });
  },
};
