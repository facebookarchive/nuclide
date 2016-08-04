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

/*
 * The Swift logo is a registered trademark of Apple Inc.
 */

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var SwiftIcon = (function (_React$Component) {
  _inherits(SwiftIcon, _React$Component);

  function SwiftIcon() {
    _classCallCheck(this, SwiftIcon);

    _get(Object.getPrototypeOf(SwiftIcon.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(SwiftIcon, [{
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
          d: 'M300.985547,344.301182c-47.003498,27.152653 -111.63205,' + '29.942447 -176.653388,2.074721c-52.646537,-22.398924 -96.329475,' + '-61.607114 -124.332159,-106.404962c13.441369,11.199462 29.12263,' + '20.163061 45.923838,27.998656c67.14843,31.473309 134.28276,' + '29.318017 181.527974,0.080572c-0.030214,-0.030214 -0.050357,' + '-0.050357 -0.0705,-0.080572c-67.206845,-51.525583 -124.332159,' + '-118.732428 -166.894144,-173.611807c-8.964605,' + '-8.961584 -15.68529,-20.163061 -22.405974,-30.243584c51.524576,' + '47.043784 133.295757,106.404962 162.412345,' + '123.214227c-61.597042,-64.970981 -116.486493,' + '-145.613152 -114.250629,-143.377288c97.451436,' + '98.569367 188.185208,154.57675 188.185208,154.57675c3.001295,' + '1.692005 5.31773,3.102009 7.18095,4.360942c1.963934,' + '-4.995444 3.686154,-10.182245 5.136444,-15.560404c15.681261,' + '-57.125314 -2.235864,-122.096295 -41.444053,' + '-175.857742c90.723701,54.884415 144.49522,157.930546 122.086224,' + '244.182519c-0.584145,2.326507 -1.218647,4.6228 -1.903506,' + '6.878806c0.261858,0.312215 0.523716,0.634502 0.785574,' + '0.96686c44.797849,56.007382 32.480455,115.368561 26.880724,' + '104.169099c-24.30243,-47.557429 -69.291637,-33.014242 -92.16392,' + '-23.365784l-0.001007,-0.001007z'
        })
      );
    }
  }]);

  return SwiftIcon;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.SwiftIcon = SwiftIcon;