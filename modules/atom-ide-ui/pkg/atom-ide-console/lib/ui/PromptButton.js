"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

var _electron = _interopRequireDefault(require("electron"));

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
const {
  remote
} = _electron.default;

if (!(remote != null)) {
  throw new Error("Invariant violation: \"remote != null\"");
}

class PromptButton extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._handleClick = event => {
      const menu = new remote.Menu(); // TODO: Sort alphabetically by label

      this.props.options.forEach(option => {
        menu.append(new remote.MenuItem({
          type: 'checkbox',
          checked: this.props.value === option.id,
          label: option.label,
          click: () => this.props.onChange(option.id)
        }));
      });
      menu.popup({
        x: event.clientX,
        y: event.clientY,
        async: true
      });
      this._menu = menu;
    }, _temp;
  }

  componentWillUnmount() {
    if (this._menu != null) {
      this._menu.closePopup();
    }
  }

  render() {
    return React.createElement("span", {
      className: "console-prompt-wrapper",
      onClick: this._handleClick
    }, React.createElement("span", {
      className: "console-prompt-label"
    }, this.props.children), React.createElement("span", {
      className: "icon icon-chevron-right"
    }));
  }

}

exports.default = PromptButton;