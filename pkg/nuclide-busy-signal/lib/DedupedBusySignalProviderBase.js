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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _BusySignalProviderBase2;

function _BusySignalProviderBase() {
  return _BusySignalProviderBase2 = require('./BusySignalProviderBase');
}

var DedupedBusySignalProviderBase = (function (_BusySignalProviderBase3) {
  _inherits(DedupedBusySignalProviderBase, _BusySignalProviderBase3);

  function DedupedBusySignalProviderBase() {
    _classCallCheck(this, DedupedBusySignalProviderBase);

    _get(Object.getPrototypeOf(DedupedBusySignalProviderBase.prototype), 'constructor', this).call(this);
    this._messageRecords = new Map();
  }

  _createClass(DedupedBusySignalProviderBase, [{
    key: 'displayMessage',
    value: function displayMessage(message, options) {
      var _this = this;

      this._incrementCount(message, options);
      return new (_atom2 || _atom()).Disposable(function () {
        _this._decrementCount(message, options);
      });
    }
  }, {
    key: '_incrementCount',
    value: function _incrementCount(message, options) {
      var key = this._getKey(message, options);
      var record = this._messageRecords.get(key);
      if (record == null) {
        record = {
          disposable: _get(Object.getPrototypeOf(DedupedBusySignalProviderBase.prototype), 'displayMessage', this).call(this, message, options),
          count: 1
        };
        this._messageRecords.set(key, record);
      } else {
        record.count++;
      }
    }
  }, {
    key: '_decrementCount',
    value: function _decrementCount(message, options) {
      var key = this._getKey(message, options);
      var record = this._messageRecords.get(key);
      (0, (_assert2 || _assert()).default)(record != null);
      (0, (_assert2 || _assert()).default)(record.count > 0);
      if (record.count === 1) {
        record.disposable.dispose();
        this._messageRecords.delete(key);
      } else {
        record.count--;
      }
    }
  }, {
    key: '_getKey',
    value: function _getKey(message, options) {
      return JSON.stringify({
        message: message,
        options: options
      });
    }
  }]);

  return DedupedBusySignalProviderBase;
})((_BusySignalProviderBase2 || _BusySignalProviderBase()).BusySignalProviderBase);

exports.DedupedBusySignalProviderBase = DedupedBusySignalProviderBase;

// The disposable to call to remove the message

// The number of messages outstanding

// Invariant: All contained MessageRecords must have a count greater than or equal to one.