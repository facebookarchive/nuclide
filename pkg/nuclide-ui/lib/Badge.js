Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _classnames2 = require('classnames');

var _classnames3 = _interopRequireDefault(_classnames2);

var _reactForAtom = require('react-for-atom');

var BadgeSizes = Object.freeze({
  medium: 'medium',
  small: 'small',
  large: 'large'
});

exports.BadgeSizes = BadgeSizes;
var BadgeColors = Object.freeze({
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error'
});

exports.BadgeColors = BadgeColors;
var BadgeSizeClassNames = Object.freeze({
  small: 'badge-small',
  medium: 'badge-medium',
  large: 'badge-large'
});

var BadgeColorClassNames = Object.freeze({
  info: 'badge-info',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error'
});

var Badge = function Badge(props) {
  var _classnames;

  var className = props.className;
  var color = props.color;
  var icon = props.icon;
  var size = props.size;
  var value = props.value;

  var sizeClassName = size == null ? '' : BadgeSizeClassNames[size] || '';
  var colorClassName = color == null ? '' : BadgeColorClassNames[color] || '';
  var newClassName = (0, _classnames3['default'])(className, 'badge', (_classnames = {}, _defineProperty(_classnames, sizeClassName, size != null), _defineProperty(_classnames, colorClassName, color != null), _defineProperty(_classnames, 'icon icon-' + icon, icon != null), _classnames));
  return _reactForAtom.React.createElement(
    'span',
    { className: newClassName },
    value
  );
};
exports.Badge = Badge;

/** Octicon icon name, without the `icon-` prefix. E.g. `'arrow-up'` */

/** The value displayed inside the badge. */