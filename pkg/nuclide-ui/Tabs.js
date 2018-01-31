'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
}

var _react = _interopRequireWildcard(require('react'));

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class Tabs extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._handleTabChange = selectedTabName => {
      if (typeof this.props.onActiveTabChange === 'function') {
        this.props.onActiveTabChange((0, (_nullthrows || _load_nullthrows()).default)(this.props.tabs.find(tab => tab.name === selectedTabName)));
      }
    }, this._renderTabMenu = () => {
      const closeButton = this.props.closeable ? _react.createElement('div', { className: 'close-icon', onClick: this.props.onClose }) : null;
      const tabs = this.props.tabs.map(tab => {
        const icon = tab.icon == null ? null : _react.createElement((_Icon || _load_Icon()).Icon, { icon: tab.icon });
        const handler = {};
        handler[this.props.triggeringEvent] = this._handleTabChange.bind(this, tab.name);
        return _react.createElement(
          'li',
          Object.assign({
            className: (0, (_classnames || _load_classnames()).default)({
              tab: true,
              active: this.props.activeTabName === tab.name
            }),
            key: tab.name
          }, handler),
          _react.createElement(
            'div',
            { className: 'title' },
            icon,
            tab.tabContent
          ),
          closeButton
        );
      });
      return _react.createElement(
        'ul',
        { className: 'tab-bar list-inline inset-panel' },
        tabs
      );
    }, _temp;
  }

  render() {
    return _react.createElement(
      'div',
      { className: 'nuclide-tabs' },
      this._renderTabMenu()
    );
  }
}
exports.default = Tabs; /**
                         * Copyright (c) 2015-present, Facebook, Inc.
                         * All rights reserved.
                         *
                         * This source code is licensed under the license found in the LICENSE file in
                         * the root directory of this source tree.
                         *
                         * 
                         * @format
                         */

Tabs.defaultProps = {
  closeable: false,
  triggeringEvent: 'onClick'
};