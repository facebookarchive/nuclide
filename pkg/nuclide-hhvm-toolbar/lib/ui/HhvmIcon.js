Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var HhvmIcon = (function (_React$Component) {
  _inherits(HhvmIcon, _React$Component);

  function HhvmIcon() {
    _classCallCheck(this, HhvmIcon);

    _get(Object.getPrototypeOf(HhvmIcon.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(HhvmIcon, [{
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'svg',
        { className: 'hhvm-icon',
          version: '1.1',
          x: '0px',
          y: '0px',
          width: this.props.width,
          viewBox: '0 0 13.4 19.6' },
        (_reactForAtom2 || _reactForAtom()).React.createElement('polygon', { points: '7,6.6 7,12.6 13,6.6' }),
        (_reactForAtom2 || _reactForAtom()).React.createElement('polygon', { points: '13.4,6 13.4,0 7.4,6' }),
        (_reactForAtom2 || _reactForAtom()).React.createElement('polygon', { points: '7,13.4 7,19.6 13.4,13.2 13.4,7' }),
        (_reactForAtom2 || _reactForAtom()).React.createElement('polygon', { points: '0,12.6 6.4,6.2 6.4,0 0,6.4' }),
        (_reactForAtom2 || _reactForAtom()).React.createElement('polygon', { points: '6.4,13 6.4,7 0.4,13' }),
        (_reactForAtom2 || _reactForAtom()).React.createElement('polygon', { points: '0,13.6 0,19.6 6,13.6' })
      );
    }
  }], [{
    key: 'defaultProps',
    value: {
      width: '16px'
    },
    enumerable: true
  }]);

  return HhvmIcon;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = HhvmIcon;
module.exports = exports.default;