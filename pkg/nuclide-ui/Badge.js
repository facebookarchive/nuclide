'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Badge = exports.BadgeColors = exports.BadgeSizes = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _react = _interopRequireWildcard(require('react'));

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

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

const BadgeSizes = exports.BadgeSizes = Object.freeze({
  medium: 'medium',
  small: 'small',
  large: 'large'
});

const BadgeColors = exports.BadgeColors = Object.freeze({
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error'
});

const BadgeSizeClassNames = Object.freeze({
  small: 'badge-small',
  medium: 'badge-medium',
  large: 'badge-large'
});

const BadgeColorClassNames = Object.freeze({
  info: 'badge-info',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error'
});

const Badge = exports.Badge = props => {
  const { className, color, icon, size, value } = props;
  const sizeClassName = size == null ? '' : BadgeSizeClassNames[size] || '';
  const colorClassName = color == null ? '' : BadgeColorClassNames[color] || '';
  const newClassName = (0, (_classnames || _load_classnames()).default)(className, 'badge', {
    [sizeClassName]: size != null,
    [colorClassName]: color != null,
    [`icon icon-${(0, (_string || _load_string()).maybeToString)(icon)}`]: icon != null
  });
  return _react.createElement(
    'span',
    { className: newClassName },
    value
  );
};