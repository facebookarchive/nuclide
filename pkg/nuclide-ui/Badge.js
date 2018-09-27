"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Badge = exports.BadgeColors = exports.BadgeSizes = void 0;

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _string() {
  const data = require("../../modules/nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const BadgeSizes = Object.freeze({
  medium: 'medium',
  small: 'small',
  large: 'large'
});
exports.BadgeSizes = BadgeSizes;
const BadgeColors = Object.freeze({
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error'
});
exports.BadgeColors = BadgeColors;
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

const Badge = props => {
  const {
    className,
    color,
    icon,
    size,
    value
  } = props;
  const sizeClassName = size == null ? '' : BadgeSizeClassNames[size] || '';
  const colorClassName = color == null ? '' : BadgeColorClassNames[color] || '';
  const newClassName = (0, _classnames().default)(className, 'badge', {
    [sizeClassName]: size != null,
    [colorClassName]: color != null,
    [`icon icon-${(0, _string().maybeToString)(icon)}`]: icon != null
  });
  return React.createElement("span", {
    className: newClassName
  }, value);
};

exports.Badge = Badge;