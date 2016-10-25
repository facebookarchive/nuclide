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

var _electron = _interopRequireDefault(require('electron'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const remote = _electron.default.remote;

if (!(remote != null)) {
  throw new Error('Invariant violation: "remote != null"');
}

let PromptButton = class PromptButton extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleClick = this._handleClick.bind(this);
  }

  render() {
    return _reactForAtom.React.createElement(
      'span',
      { className: 'nuclide-console-prompt-wrapper', onClick: this._handleClick },
      _reactForAtom.React.createElement(
        'span',
        { className: 'nuclide-console-prompt-label' },
        this.props.children
      ),
      _reactForAtom.React.createElement('span', { className: 'icon icon-chevron-right' })
    );
  }

  _handleClick(event) {
    const currentWindow = remote.getCurrentWindow();
    const menu = new remote.Menu();
    // TODO: Sort alphabetically by label
    this.props.options.forEach(option => {
      menu.append(new remote.MenuItem({
        type: 'checkbox',
        checked: this.props.value === option.id,
        label: option.label,
        click: () => this.props.onChange(option.id)
      }));
    });
    menu.popup(currentWindow, event.clientX, event.clientY);
  }

};
exports.default = PromptButton;
module.exports = exports['default'];