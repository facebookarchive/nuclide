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

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

// A Cache mapping keys to values which creates entries as they are requested.

var Cache = (function () {
  function Cache(factory) {
    var disposeValue = arguments.length <= 1 || arguments[1] === undefined ? function (value) {} : arguments[1];

    _classCallCheck(this, Cache);

    this._values = new Map();
    this._factory = factory;
    this._disposeValue = disposeValue;
    this._entriesSubject = new (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Subject();
  }

  // Useful for optional second parameter to Cache constructor.

  _createClass(Cache, [{
    key: 'has',
    value: function has(key) {
      return this._values.has(key);
    }
  }, {
    key: 'get',
    value: function get(key) {
      if (!this._values.has(key)) {
        var newValue = this._factory(key);
        this._values.set(key, newValue);
        this._entriesSubject.next([key, newValue]);
        return newValue;
      } else {
        // Cannot use invariant as ValueType may include null/undefined.
        return this._values.get(key);
      }
    }
  }, {
    key: 'values',
    value: function values() {
      return this._values.values();
    }
  }, {
    key: 'observeValues',
    value: function observeValues() {
      return this.observeEntries().map(function (entry) {
        return entry[1];
      });
    }
  }, {
    key: 'observeEntries',
    value: function observeEntries() {
      return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.concat((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.from(this._values.entries()), this._entriesSubject);
    }
  }, {
    key: 'observeKeys',
    value: function observeKeys() {
      return this.observeEntries().map(function (entry) {
        return entry[0];
      });
    }
  }, {
    key: 'delete',
    value: function _delete(key) {
      if (this.has(key)) {
        var _value = this.get(key);
        this._values.delete(key);
        this._disposeValue(_value);
        return true;
      } else {
        return false;
      }
    }
  }, {
    key: 'clear',
    value: function clear() {
      // Defend against a dispose call removing elements from the Cache.
      var values = this._values;
      this._values = new Map();
      for (var _value2 of values.values()) {
        this._disposeValue(_value2);
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.clear();
      this._entriesSubject.complete();
    }
  }]);

  return Cache;
})();

exports.Cache = Cache;
var DISPOSE_VALUE = function DISPOSE_VALUE(value) {
  value.dispose;
};
exports.DISPOSE_VALUE = DISPOSE_VALUE;