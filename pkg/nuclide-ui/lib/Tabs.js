Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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

var _Icon2;

function _Icon() {
  return _Icon2 = require('./Icon');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _nullthrows2;

function _nullthrows() {
  return _nullthrows2 = _interopRequireDefault(require('nullthrows'));
}

var Tabs = (function (_React$Component) {
  _inherits(Tabs, _React$Component);

  _createClass(Tabs, null, [{
    key: 'defaultProps',
    value: {
      closeable: false,
      triggeringEvent: 'onClick'
    },
    enumerable: true
  }]);

  function Tabs(props) {
    _classCallCheck(this, Tabs);

    _get(Object.getPrototypeOf(Tabs.prototype), 'constructor', this).call(this, props);

    this._handleTabChange = this._handleTabChange.bind(this);
    this._renderTabMenu = this._renderTabMenu.bind(this);
  }

  _createClass(Tabs, [{
    key: '_handleTabChange',
    value: function _handleTabChange(selectedTabName) {
      if (typeof this.props.onActiveTabChange === 'function') {
        this.props.onActiveTabChange((0, (_nullthrows2 || _nullthrows()).default)(this.props.tabs.find(function (tab) {
          return tab.name === selectedTabName;
        })));
      }
    }
  }, {
    key: '_renderTabMenu',
    value: function _renderTabMenu() {
      var _this = this;

      var closeButton = this.props.closeable ? (_reactForAtom2 || _reactForAtom()).React.createElement('div', { className: 'close-icon', onClick: this.props.onClose }) : null;
      var tabs = this.props.tabs.map(function (tab) {
        var icon = tab.icon == null ? null : (_reactForAtom2 || _reactForAtom()).React.createElement((_Icon2 || _Icon()).Icon, { icon: tab.icon });
        var handler = {};
        handler[_this.props.triggeringEvent] = _this._handleTabChange.bind(_this, tab.name);
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          'li',
          _extends({
            className: (0, (_classnames2 || _classnames()).default)({
              tab: true,
              active: _this.props.activeTabName === tab.name
            }),
            key: tab.name
          }, handler),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'title' },
            icon,
            tab.tabContent
          ),
          closeButton
        );
      });
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'ul',
        { className: 'tab-bar list-inline inset-panel' },
        tabs
      );
    }
  }, {
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-tabs' },
        this._renderTabMenu()
      );
    }
  }]);

  return Tabs;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = Tabs;
module.exports = exports.default;