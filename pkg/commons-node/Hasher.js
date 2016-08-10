Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Get a hash for the provider object. Hashes are unique per-hasher, so if you have two different
 * hashers, there is no guarantee that they will give the same hash for the same object.
 *
 * One use case for this is with lists of React elements. Just create a hasher and use the hash as
 * a key:
 *
 *    class MyComponent extends React.Component {
 *      constructor(props) {
 *        super(props);
 *        this._hasher = new Hasher();
 *      }
 *      render() {
 *        return this.props.items.map(item => (
 *          <ItemView key={this._hasher.getHash(item)} model={item} />
 *        ));
 *      }
 *    }
 */

var Hasher = (function () {
  function Hasher() {
    _classCallCheck(this, Hasher);

    this._hashes = new WeakMap();
    this._objectCount = 0;
  }

  _createClass(Hasher, [{
    key: 'getHash',
    value: function getHash(item) {
      if (item === null) {
        return 'null';
      }
      var type = typeof item;
      switch (typeof item) {
        case 'object':
          {
            var hash = this._hashes.get(item);
            if (hash == null) {
              hash = type + ':' + this._objectCount;
              this._hashes.set(item, hash);
              this._objectCount = this._objectCount + 1 === Number.MAX_SAFE_INTEGER ? Number.MIN_SAFE_INTEGER : this._objectCount + 1;
            }
            return hash;
          }
        case 'undefined':
          return 'undefined';
        case 'string':
        case 'boolean':
          return type + ':' + item.toString();
        case 'number':
          return item;
        default:
          throw new Error('Unhashable object');
      }
    }
  }]);

  return Hasher;
})();

exports.default = Hasher;
module.exports = exports.default;