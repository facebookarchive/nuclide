Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = memoizeUntilChanged;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _collection2;

function _collection() {
  return _collection2 = require('./collection');
}

var _Hasher2;

function _Hasher() {
  return _Hasher2 = _interopRequireDefault(require('./Hasher'));
}

var NOTHING = Symbol('nothing');

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

function memoizeUntilChanged(func, keySelector_) {
  var compareKeys = arguments.length <= 2 || arguments[2] === undefined ? (_collection2 || _collection()).arrayEqual : arguments[2];

  var prevArgKeys = undefined;
  var prevResult = NOTHING;
  var keySelector = keySelector_ || createKeySelector();
  // $FlowIssue: Flow can't express that we want the args to be the same type as the input func's.
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var argKeys = args.map(keySelector);
    if (prevResult === NOTHING || !compareKeys(argKeys, prevArgKeys)) {
      prevArgKeys = argKeys;
      prevResult = func.apply(this, args);
    }
    return prevResult;
  };
}

function createKeySelector() {
  var hasher = new (_Hasher2 || _Hasher()).default();
  return function (x) {
    return hasher.getHash(x);
  };
}
module.exports = exports.default;