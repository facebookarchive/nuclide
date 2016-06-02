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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

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

/**
 * Renders an icon with optional text next to it.
 */
var Icon = function Icon(props) {
  var icon = props.icon;
  var children = props.children;
  var className = props.className;

  var remainingProps = _objectWithoutProperties(props, ['icon', 'children', 'className']);

  var newClassName = (0, (_classnames2 || _classnames()).default)(className, _defineProperty({}, 'icon icon-' + icon, icon != null));
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'span',
    _extends({ className: newClassName }, remainingProps),
    children
  );
};
exports.Icon = Icon;

/** Valid octicon icon name, without the `icon-` prefix. E.g. `'arrow-up'` */

/** Optional text content to render next to the icon. */