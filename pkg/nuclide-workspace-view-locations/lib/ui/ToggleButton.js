'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToggleButton = undefined;

var _Icon;

function _load_Icon() {
  return _Icon = require('../../../nuclide-ui/Icon');
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _react = _interopRequireDefault(require('react'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class ToggleButton extends _react.default.Component {

  render() {
    const className = (0, (_classnames || _load_classnames()).default)('nuclide-workspace-views-toggle-button', this.props.position, {
      'nuclide-workspace-views-toggle-button-visible': this.props.visible
    });
    return _react.default.createElement(
      'div',
      { className: className },
      _react.default.createElement(
        'div',
        {
          className: `nuclide-workspace-views-toggle-button-inner ${this.props.position}`,
          onClick: this.props.toggle,
          onDragEnter: this.props.onDragEnter },
        _react.default.createElement((_Icon || _load_Icon()).Icon, { icon: getIconName(this.props.position, this.props.open) })
      )
    );
  }
}

exports.ToggleButton = ToggleButton;
function getIconName(position, open) {
  switch (position) {
    case 'top':
      return open ? 'chevron-up' : 'chevron-down';
    case 'right':
      return open ? 'chevron-right' : 'chevron-left';
    case 'bottom':
      return open ? 'chevron-down' : 'chevron-up';
    case 'left':
      return open ? 'chevron-left' : 'chevron-right';
    default:
      throw new Error(`Invalid position: ${position}`);
  }
}