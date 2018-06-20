'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */

class PulseButton extends _react.Component {
  render() {
    const {
      ariaLabel,
      className,
      isSelected,
      size = 10,
      style,
      onClick,
      onMouseOver,
      onMouseLeave
    } = this.props;

    return _react.createElement(
      'a',
      {
        className: (0, (_classnames || _load_classnames()).default)({
          'nuclide-ui-pulse-button': true,
          selected: isSelected
        }, className),
        style: Object.assign({
          height: size,
          width: size
        }, style),
        href: '#',
        'aria-label': ariaLabel,
        onClick: onClick,
        onMouseOver: onMouseOver,
        onMouseLeave: onMouseLeave,
        role: 'button' },
      _react.createElement('div', { className: 'nuclide-ui-pulse-button--inner-circle' }),
      _react.createElement('div', { className: 'nuclide-ui-pulse-button--cover-circle' })
    );
  }
}
exports.default = PulseButton;