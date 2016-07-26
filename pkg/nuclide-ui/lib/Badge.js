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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _commonsNodeString2;

function _commonsNodeString() {
  return _commonsNodeString2 = require('../../commons-node/string');
}

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
  var _ref;

  var className = props.className;
  var color = props.color;
  var icon = props.icon;
  var size = props.size;
  var value = props.value;

  var sizeClassName = size == null ? '' : BadgeSizeClassNames[size] || '';
  var colorClassName = color == null ? '' : BadgeColorClassNames[color] || '';
  var newClassName = (0, (_classnames2 || _classnames()).default)(className, 'badge', (_ref = {}, _defineProperty(_ref, sizeClassName, size != null), _defineProperty(_ref, colorClassName, color != null), _defineProperty(_ref, 'icon icon-' + (0, (_commonsNodeString2 || _commonsNodeString()).maybeToString)(icon), icon != null), _ref));
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'span',
    { className: newClassName },
    value
  );
};
exports.Badge = Badge;

/** Octicon icon name, without the `icon-` prefix. E.g. `'arrow-up'` */

/** The value displayed inside the badge. */