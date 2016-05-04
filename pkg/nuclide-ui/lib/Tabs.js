Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom = require('react-for-atom');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var Tabs = _reactForAtom.React.createClass({
  displayName: 'Tabs',

  propTypes: {
    tabs: _reactForAtom.React.PropTypes.arrayOf(_reactForAtom.React.PropTypes.shape({
      name: _reactForAtom.React.PropTypes.string.isRequired,
      tabContent: _reactForAtom.React.PropTypes.node.isRequired
    })).isRequired,
    activeTabName: _reactForAtom.React.PropTypes.string.isRequired,
    onActiveTabChange: _reactForAtom.React.PropTypes.func.isRequired,
    triggeringEvent: _reactForAtom.React.PropTypes.string.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      triggeringEvent: 'onClick'
    };
  },

  _handleTabChange: function _handleTabChange(selectedTabName) {
    if (typeof this.props.onActiveTabChange === 'function') {
      this.props.onActiveTabChange(this.props.tabs.find(function (tab) {
        return tab.name === selectedTabName;
      }));
    }
  },

  _renderTabMenu: function _renderTabMenu() {
    var _this = this;

    var tabs = this.props.tabs.map(function (tab) {
      var handler = {};
      handler[_this.props.triggeringEvent] = _this._handleTabChange.bind(_this, tab.name);
      return _reactForAtom.React.createElement(
        'li',
        _extends({
          className: (0, _classnames2.default)({
            tab: true,
            active: _this.props.activeTabName === tab.name
          }),
          key: tab.name
        }, handler),
        _reactForAtom.React.createElement(
          'div',
          { className: 'title' },
          tab.tabContent
        )
      );
    });
    return _reactForAtom.React.createElement(
      'ul',
      { className: 'tab-bar list-inline inset-panel' },
      tabs
    );
  },

  render: function render() {
    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-tabs' },
      this._renderTabMenu()
    );
  }
});
exports.Tabs = Tabs;