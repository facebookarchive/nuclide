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

var BuckIcon = (function (_React$Component) {
  _inherits(BuckIcon, _React$Component);

  function BuckIcon() {
    _classCallCheck(this, BuckIcon);

    _get(Object.getPrototypeOf(BuckIcon.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(BuckIcon, [{
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'svg',
        {
          version: '1.1',
          x: '0px',
          y: '0px',
          viewBox: '0 0 459.3 399.5',
          height: '100%' },
        (_reactForAtom2 || _reactForAtom()).React.createElement('path', {
          className: 'icon-path-fill',
          d: 'M349.1,203.1l-36-36l41.3-41.3l0-94l-33.8,0l0,79.9l-31.4,31.4l-31-31l0-80.3l-33.8,' + '0l0,94.3l77,77l-47.9,0L130.1,79.8 l0-79.8L96.2,0l0,93.8l41.5,41.6l-48.4,0L33.8,' + '79.8l0-79.8L0,0l0,93.8l75.4,75.4l96.2,0l33.9,33.9l-96.2,0l79.6,79.6L72.1,399.5' + ' l47.9,0l116.8-116.8L191,236.9l234.4,0l0,16.9l-104,62.2l-83.9,83.5l47.6,' + '0l55.5-55.6l118.7-70.9l0-70L349.1,203.1z M259.1,258.8 l23.9,23.9l23.9-23.9L259.1,' + '258.8z'
        })
      );
    }
  }]);

  return BuckIcon;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.BuckIcon = BuckIcon;