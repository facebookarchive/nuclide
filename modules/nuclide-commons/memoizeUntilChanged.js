'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _collection;

function _load_collection() {
  return _collection = require('./collection');
}

/**
 * Create a memoized version of the provided function that caches only the latest result. This is
 * especially useful for optimizing React component methods without having to worry about
 * maintaining state explicitly. For example:
 *
 *     class MyComponent extends React.Component {
 *       constructor(props) {
 *         super(props);
 *         this._computeSomethingExpensive = memoizeUntilChanged(this._computeSomethingExpensive);
 *       }
 *       _computeSomethingExpensive(x) { ... }
 *       render() {
 *         const thingToRender = this._computeSomethingExpensive(this.props.value);
 *         return <div>{thingToRender}</div>;
 *       }
 *     }
 *
 * Sometimes, you need to customize how the arguments are compared. In this case you can pass a
 * key selector function (which derives a single value from the arguments), and an equality function
 * (which compares keys). For example:
 *
 *     class MyComponent extends React.Component {
 *       constructor(props) {
 *         super(props);
 *         this._computeSomethingExpensive = memoizeUntilChanged(
 *           this._computeSomethingExpensive,
 *           (x: Array<Object>, y: Array<Object>) => ({x, y}),
 *           (a, b) => arrayEqual(a.x, b.x) && arrayEqual(a.y, b.y),
 *         );
 *       }
 *       _computeSomethingExpensive(x: Array<Object>, y: Array<Object>) { ... }
 *       render() {
 *         const thingToRender = this._computeSomethingExpensive(this.props.value);
 *         return <div>{thingToRender}</div>;
 *       }
 *     }
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

exports.default = (func, keySelector_, compareKeys_) => {
  if (!!(keySelector_ == null && compareKeys_ != null)) {
    throw new Error("You can't provide a compare function without also providing a key selector.");
  }

  let prevKey = null;
  let prevResult;
  const keySelector = keySelector_ || DEFAULT_KEY_SELECTOR;
  const compareKeys = compareKeys_ || (_collection || _load_collection()).arrayEqual;
  // $FlowIssue: Flow can't express that we want the args to be the same type as the input func's.
  return function (...args) {
    const key = keySelector(...args);

    if (!(key != null)) {
      throw new Error('Key cannot be null');
    }
    // $FlowIssue: We can't tell Flow the relationship between keySelector and compareKeys


    if (prevKey == null || !compareKeys(key, prevKey)) {
      prevKey = key;
      prevResult = func.apply(this, args);
    }
    return prevResult;
  };
};

const DEFAULT_KEY_SELECTOR = (...args) => args;