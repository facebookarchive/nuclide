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

var _reactForAtom = require('react-for-atom');

var _Tabs;

function _load_Tabs() {
  return _Tabs = _interopRequireDefault(require('../../nuclide-ui/Tabs'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let SideBarPanelComponent = class SideBarPanelComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleTabChange = this._handleTabChange.bind(this);
  }

  focus() {
    _reactForAtom.ReactDOM.findDOMNode(this.refs.child).focus();
  }

  _handleTabChange(newTab) {
    const value = newTab.name;
    this.props.onSelectedViewMenuItemChange(value);
  }

  render() {
    var _props = this.props;
    const menuItems = _props.menuItems,
          selectedViewMenuItemValue = _props.selectedViewMenuItemValue;

    const tabs = menuItems.map(menuItem => ({
      name: menuItem.value,
      tabContent: _reactForAtom.React.createElement(
        'span',
        null,
        menuItem.label
      )
    }));
    const activeTabName = selectedViewMenuItemValue;
    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-side-bar-tab-container', tabIndex: 0 },
      _reactForAtom.React.createElement((_Tabs || _load_Tabs()).default, {
        activeTabName: activeTabName,
        tabs: tabs,
        onActiveTabChange: this._handleTabChange
      }),
      _reactForAtom.React.cloneElement(_reactForAtom.React.Children.only(this.props.children), { ref: 'child' })
    );
  }
};
exports.default = SideBarPanelComponent;
module.exports = exports['default'];