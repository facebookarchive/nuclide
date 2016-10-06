Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/**
 * Like a CompositeDisposable, but in addition to Disposable instances it can
 * also accept plain functions and Rx subscriptions.
 */

var UniversalDisposable = (function () {
  function UniversalDisposable() {
    _classCallCheck(this, UniversalDisposable);

    for (var _len = arguments.length, tearDowns = Array(_len), _key = 0; _key < _len; _key++) {
      tearDowns[_key] = arguments[_key];
    }

    this._tearDowns = new Set(tearDowns);
    this.wasDisposed = false;
  }

  _createClass(UniversalDisposable, [{
    key: 'add',
    value: function add() {
      var _this = this;

      if (this.wasDisposed) {
        return;
      }

      for (var _len2 = arguments.length, tearDowns = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        tearDowns[_key2] = arguments[_key2];
      }

      tearDowns.forEach(function (td) {
        return _this._tearDowns.add(td);
      });
    }
  }, {
    key: 'remove',
    value: function remove() {
      var _this2 = this;

      if (this.wasDisposed) {
        return;
      }

      for (var _len3 = arguments.length, tearDowns = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        tearDowns[_key3] = arguments[_key3];
      }

      tearDowns.forEach(function (td) {
        return _this2._tearDowns.delete(td);
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this.wasDisposed) {
        return;
      }

      this._tearDowns.forEach(function (t) {
        if (typeof t === 'function') {
          t();
        } else if (typeof t.dispose === 'function') {
          t.dispose();
        } else if (typeof t.unsubscribe === 'function') {
          t.unsubscribe();
        }
      });
      this._tearDowns.clear();
      this.wasDisposed = true;
    }
  }, {
    key: 'unsubscribe',
    value: function unsubscribe() {
      this.dispose();
    }
  }, {
    key: 'clear',
    value: function clear() {
      if (this.wasDisposed) {
        return;
      }

      this._tearDowns.clear();
    }
  }]);

  return UniversalDisposable;
})();

exports.default = UniversalDisposable;
module.exports = exports.default;