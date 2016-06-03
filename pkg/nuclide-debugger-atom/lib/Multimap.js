var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// TODO: pull this into nuclide-commons.

var Multimap = (function () {
  function Multimap() {
    _classCallCheck(this, Multimap);

    this._storage = new Map();
  }

  _createClass(Multimap, [{
    key: 'has',
    value: function has(key) {
      return this._storage.has(key);
    }
  }, {
    key: 'hasEntry',
    value: function hasEntry(key, value) {
      var values = this._storage.get(key);
      if (values) {
        return values.has(value);
      }
      return false;
    }
  }, {
    key: 'get',
    value: function get(key) {
      var set = this._storage.get(key);
      return new Set(set) || new Set();
    }
  }, {
    key: 'delete',
    value: function _delete(key, value) {
      var set = this._storage.get(key);
      if (set) {
        var deleted = set.delete(value);
        if (set.size === 0) {
          this._storage.delete(key);
        }
        return deleted;
      }
      return false;
    }
  }, {
    key: 'deleteAll',
    value: function deleteAll(key) {
      return this._storage.delete(key);
    }
  }, {
    key: 'set',
    value: function set(key, value) {
      var set = this._storage.get(key);
      if (set) {
        set.add(value);
      } else {
        this._storage.set(key, new Set([value]));
      }
      return this;
    }
  }, {
    key: 'forEach',
    value: function forEach(callback) {
      var _this = this;

      this._storage.forEach(function (values, key) {
        return values.forEach(function (value) {
          return callback(value, key, _this);
        });
      });
    }
  }]);

  return Multimap;
})();

module.exports = Multimap;

/**
 * Invariant: the Set values are never empty.
 */