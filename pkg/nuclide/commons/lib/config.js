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

  getConfigValueAsync(key): () => Promise {
    return (function() {
      var observedValue;
      var promiseThatResolvesToValue = new Promise((resolve, reject) => {
        // Note that this creates an observer for the key that will never be
        // disabled: the key will continue to be observed for the lifetime of
        // the app.
        atom.config.observe(key, value => {
          // TODO(mbolin): Figure out why this is called with undefined sometimes.
          if (value !== undefined) {
            observedValue = value;
            promiseThatResolvesToValue = undefined;
            resolve(value);
          }
        });
      });

      return function() {
        return observedValue ? Promise.resolve(observedValue) :
            promiseThatResolvesToValue;
      };
    })();
  },
};
