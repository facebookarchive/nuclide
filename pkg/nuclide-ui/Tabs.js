'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _class, _temp;

var _Icon;

function _load_Icon() {
  return _Icon = require('./Icon');
}

var _reactForAtom = require('react-for-atom');

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let Tabs = (_temp = _class = class Tabs extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);

    this._handleTabChange = this._handleTabChange.bind(this);
    this._renderTabMenu = this._renderTabMenu.bind(this);
  }

  _handleTabChange(selectedTabName) {
    if (typeof this.props.onActiveTabChange === 'function') {
      this.props.onActiveTabChange((0, (_nullthrows || _load_nullthrows()).default)(this.props.tabs.find(tab => tab.name === selectedTabName)));
    }
  }

  _renderTabMenu() {
    const closeButton = this.props.closeable ? _reactForAtom.React.createElement('div', { className: 'close-icon', onClick: this.props.onClose }) : null;
    const tabs = this.props.tabs.map(tab => {
      const icon = tab.icon == null ? null : _reactForAtom.React.createElement((_Icon || _load_Icon()).Icon, { icon: tab.icon });
      const handler = {};
      handler[this.props.triggeringEvent] = this._handleTabChange.bind(this, tab.name);
      return _reactForAtom.React.createElement(
        'li',
        Object.assign({
          className: (0, (_classnames || _load_classnames()).default)({
            tab: true,
            active: this.props.activeTabName === tab.name
          }),
          key: tab.name
        }, handler),
        _reactForAtom.React.createElement(
          'div',
          { className: 'title' },
          icon,
          tab.tabContent
        ),
        closeButton
      );
    });
    return _reactForAtom.React.createElement(
      'ul',
      { className: 'tab-bar list-inline inset-panel' },
      tabs
    );
  }

  render() {
    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-tabs' },
      this._renderTabMenu()
    );
  }
}, _class.defaultProps = {
  closeable: false,
  triggeringEvent: 'onClick'
}, _temp);
exports.default = Tabs;
module.exports = exports['default'];