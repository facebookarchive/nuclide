'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = memoizeUntilChanged;

var _collection;

function _load_collection() {
  return _collection = require('./collection');
}

var _Hasher;

function _load_Hasher() {
  return _Hasher = _interopRequireDefault(require('./Hasher'));
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
 * 
 * @format
 */

const NOTHING = Symbol('nothing');

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
 */
function memoizeUntilChanged(func, keySelector_, compareKeys = (_collection || _load_collection()).arrayEqual) {
  let prevArgKeys;
  let prevResult = NOTHING;
  const keySelector = keySelector_ || createKeySelector();
  // $FlowIssue: Flow can't express that we want the args to be the same type as the input func's.
  return function (...args) {
    const argKeys = args.map(keySelector);
    if (prevResult === NOTHING || !compareKeys(argKeys, prevArgKeys)) {
      prevArgKeys = argKeys;
      prevResult = func.apply(this, args);
    }
    return prevResult;
  };
}

function createKeySelector() {
  const hasher = new (_Hasher || _load_Hasher()).default();
  return x => hasher.getHash(x);
}