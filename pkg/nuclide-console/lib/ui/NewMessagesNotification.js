'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class NewMessagesNotification extends _react.Component {
  render() {
    const className = (0, (_classnames || _load_classnames()).default)('nuclide-console-new-messages-notification', 'badge', 'badge-info', {
      visible: this.props.visible
    });
    return _react.createElement(
      'div',
      { className: className, onClick: this.props.onClick },
      _react.createElement('span', { className: 'nuclide-console-new-messages-notification-icon icon icon-nuclicon-arrow-down' }),
      'New Messages'
    );
  }
}
exports.default = NewMessagesNotification;