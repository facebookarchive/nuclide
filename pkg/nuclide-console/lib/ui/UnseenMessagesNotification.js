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

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _reactForAtom = require('react-for-atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let NewMessagesNotification = class NewMessagesNotification extends _reactForAtom.React.Component {

  render() {
    const className = (0, (_classnames || _load_classnames()).default)('nuclide-console-new-messages-notification', 'badge', 'badge-info', {
      visible: this.props.visible
    });
    return _reactForAtom.React.createElement(
      'div',
      {
        className: className,
        onClick: this.props.onClick },
      _reactForAtom.React.createElement('span', { className: 'nuclide-console-new-messages-notification-icon icon icon-arrow-down' }),
      'New Messages'
    );
  }

};
exports.default = NewMessagesNotification;
module.exports = exports['default'];