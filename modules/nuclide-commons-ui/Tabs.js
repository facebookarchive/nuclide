"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _Icon() {
  const data = require("./Icon");

  _Icon = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
class Tabs extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._handleTabChange = selectedTabName => {
      if (typeof this.props.onActiveTabChange === 'function') {
        this.props.onActiveTabChange((0, _nullthrows().default)(this.props.tabs.find(tab => tab.name === selectedTabName)));
      }
    }, this._renderTabMenu = () => {
      const closeButton = this.props.closeable ? React.createElement("div", {
        className: "close-icon",
        onClick: this.props.onClose
      }) : null;
      const tabs = this.props.tabs.map(tab => {
        const icon = tab.icon == null ? null : React.createElement(_Icon().Icon, {
          icon: tab.icon
        });
        const handler = {};
        handler[this.props.triggeringEvent] = this._handleTabChange.bind(this, tab.name);
        return React.createElement("li", Object.assign({
          className: (0, _classnames().default)({
            tab: true,
            active: this.props.activeTabName === tab.name,
            growable: this.props.growable
          }),
          key: tab.name,
          title: tab.name
        }, handler), React.createElement("div", {
          className: "title"
        }, icon, tab.tabContent), closeButton);
      });
      return React.createElement("ul", {
        className: "tab-bar list-inline inset-panel"
      }, tabs);
    }, _temp;
  }

  render() {
    return React.createElement("div", {
      className: "nuclide-tabs"
    }, this._renderTabMenu());
  }

}

exports.default = Tabs;
Tabs.defaultProps = {
  closeable: false,
  triggeringEvent: 'onClick',
  growable: false
};