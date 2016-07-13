var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _immutable2;

function _immutable() {
  return _immutable2 = _interopRequireDefault(require('immutable'));
}

var OptionsRecord = (_immutable2 || _immutable()).default.Record({

  // Line length settings.

  /**
   * This is the length with which reprint will try to keep each line within.
   *
   * Note: It's not guaranteed to keep lines within this length, but it will
   * do its best.
   */
  maxLineLength: 80,

  // Tab Settings.

  /**
   * The width of a tab. If using spaces this is how many spaces will be
   * inserted. If using tab charcters this is how many spaces a single tab
   * is expected to be displayed as.
   */
  tabWidth: 2,
  /**
   * If true spaces will be used for indentation, otherwise tabs will be used.
   */
  useSpaces: true

});

/**
 * Set up a class to get strong type checking.
 */

var Options = (function (_OptionsRecord) {
  _inherits(Options, _OptionsRecord);

  function Options(init) {
    _classCallCheck(this, Options);

    _get(Object.getPrototypeOf(Options.prototype), 'constructor', this).call(this, init);
  }

  return Options;
})(OptionsRecord);

module.exports = Options;