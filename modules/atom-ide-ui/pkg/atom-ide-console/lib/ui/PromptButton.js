'use strict';Object.defineProperty(exports, "__esModule", { value: true });












var _react = _interopRequireWildcard(require('react'));
var _electron = _interopRequireDefault(require('electron'));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}

const { remote } = _electron.default; /**
                                       * Copyright (c) 2017-present, Facebook, Inc.
                                       * All rights reserved.
                                       *
                                       * This source code is licensed under the BSD-style license found in the
                                       * LICENSE file in the root directory of this source tree. An additional grant
                                       * of patent rights can be found in the PATENTS file in the same directory.
                                       *
                                       * 
                                       * @format
                                       */if (!(remote != null)) {throw new Error('Invariant violation: "remote != null"');}




class PromptButton extends _react.Component {constructor(...args) {var _temp;return _temp = super(...args), this.











    _handleClick = event => {
      const currentWindow = remote.getCurrentWindow();
      const menu = new remote.Menu();
      // TODO: Sort alphabetically by label
      this.props.options.forEach(option => {
        menu.append(
        new remote.MenuItem({
          type: 'checkbox',
          checked: this.props.value === option.id,
          label: option.label,
          click: () => this.props.onChange(option.id) }));


      });
      menu.popup(currentWindow, event.clientX, event.clientY);
    }, _temp;}render() {return _react.createElement('span', { className: 'console-prompt-wrapper', onClick: this._handleClick }, _react.createElement('span', { className: 'console-prompt-label' }, this.props.children), _react.createElement('span', { className: 'icon icon-chevron-right' }));}}exports.default = PromptButton;