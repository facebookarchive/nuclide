'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

/**
 * This class creates and caches observables by key.
 *
 * The factory is only called once the wrapper observable gets subscribed to,
 * and multiple subscribers to the same key share the same observable.
 *
 * Once all subscribers to a key have unsubscribed, the cached observable is cleared.
 */
class SharedObservableCache {

  constructor(factory) {
    this._factory = factory;
    this._cache = new Map();
  }

  get(key) {
    return _rxjsBundlesRxMinJs.Observable.create(observer => {
      let cached = this._cache.get(key);
      if (cached == null) {
        cached = {
          refCount: 1,
          observable: this._factory(key)
        };
      } else {
        cached.refCount++;
      }
      // Store this in a const to convince Flow this is non-nullable.
      const data = cached;
      this._cache.set(key, cached);
      const subscription = data.observable.subscribe(observer);
      return () => {
        if (--data.refCount === 0) {
          this._cache.delete(key);
        }
        subscription.unsubscribe();
      };
    });
  }
}
exports.default = SharedObservableCache; /**
                                          * Copyright (c) 2015-present, Facebook, Inc.
                                          * All rights reserved.
                                          *
                                          * This source code is licensed under the license found in the LICENSE file in
                                          * the root directory of this source tree.
                                          *
                                          * 
                                          * @format
                                          */