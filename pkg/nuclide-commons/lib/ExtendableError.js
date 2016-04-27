Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Define your own error by extending this class. Note we use Error.captureStackTrace
 * to get stacktrace which is v8-engine only.
 */

var ExtendableError = (function (_Error) {
  _inherits(ExtendableError, _Error);

  function ExtendableError(message) {
    _classCallCheck(this, ExtendableError);

    _get(Object.getPrototypeOf(ExtendableError.prototype), 'constructor', this).call(this, message);
    this.name = this.constructor.name;
    this.message = message;
    /* $FlowFixMe */
    Error.captureStackTrace(this, this.constructor.name);
  }

  return ExtendableError;
})(Error);

exports['default'] = ExtendableError;
module.exports = exports['default'];