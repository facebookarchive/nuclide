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

var _nuclideUiPanelComponent2;

function _nuclideUiPanelComponent() {
  return _nuclideUiPanelComponent2 = require('../../../nuclide-ui/PanelComponent');
}

var _nuclideUiView2;

function _nuclideUiView() {
  return _nuclideUiView2 = require('../../../nuclide-ui/View');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var Panel = (function (_React$Component) {
  _inherits(Panel, _React$Component);

  function Panel() {
    _classCallCheck(this, Panel);

    _get(Object.getPrototypeOf(Panel.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Panel, [{
    key: '_getInitialSize',
    value: function _getInitialSize() {
      if (this.props.initialSize != null) {
        return this.props.initialSize;
      }

      var item = this.props.item;

      if (item == null) {
        return null;
      }
      switch (this.props.position) {
        case 'top':
        case 'bottom':
          return typeof item.getPreferredInitialHeight === 'function' ? item.getPreferredInitialHeight() : null;
        case 'left':
        case 'right':
          return typeof item.getPreferredInitialWidth === 'function' ? item.getPreferredInitialWidth() : null;
        default:
          throw new Error('Invalid position: ' + this.props.position);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      if (this.props.item == null) {
        return null;
      }
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_nuclideUiPanelComponent2 || _nuclideUiPanelComponent()).PanelComponent,
        {
          initialLength: this._getInitialSize() || undefined,
          noScroll: true,
          onResize: this.props.onResize,
          dock: this.props.position },
        (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiView2 || _nuclideUiView()).View, { item: this.props.item })
      );
    }
  }]);

  return Panel;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.Panel = Panel;