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

var ButtonSizes = Object.freeze({
  EXTRA_SMALL: 'EXTRA_SMALL',
  SMALL: 'SMALL',
  LARGE: 'LARGE'
});

exports.ButtonSizes = ButtonSizes;
var ButtonTypes = Object.freeze({
  PRIMARY: 'PRIMARY',
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR'
});

exports.ButtonTypes = ButtonTypes;
var ButtonSizeClassnames = Object.freeze({
  EXTRA_SMALL: 'btn-xs',
  SMALL: 'btn-sm',
  LARGE: 'btn-lg'
});

var ButtonTypeClassnames = Object.freeze({
  PRIMARY: 'btn-primary',
  INFO: 'btn-info',
  SUCCESS: 'btn-success',
  WARNING: 'btn-warning',
  ERROR: 'btn-error'
});

/**
 * Generic Button wrapper.
 */
var Button = function Button(props) {
  var _ref;

  var icon = props.icon;
  var buttonType = props.buttonType;
  var selected = props.selected;
  var size = props.size;
  var children = props.children;
  var className = props.className;
  var wrapperElement = props.wrapperElement;

  var remainingProps = _objectWithoutProperties(props, ['icon', 'buttonType', 'selected', 'size', 'children', 'className', 'wrapperElement']);

  var sizeClassname = size == null ? '' : ButtonSizeClassnames[size] || '';
  var buttonTypeClassname = buttonType == null ? '' : ButtonTypeClassnames[buttonType] || '';
  var newClassName = (0, (_classnames2 || _classnames()).default)(className, 'btn', (_ref = {}, _defineProperty(_ref, 'icon icon-' + icon, icon != null), _defineProperty(_ref, sizeClassname, size != null), _defineProperty(_ref, 'selected', selected), _defineProperty(_ref, buttonTypeClassname, buttonType != null), _ref));
  var Wrapper = wrapperElement == null ? 'button' : wrapperElement;
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    Wrapper,
    _extends({ className: newClassName }, remainingProps),
    children
  );
};
exports.Button = Button;

/** Octicon icon name, without the `icon-` prefix. E.g. `'arrow-up'` */

/** Optional specifier for special buttons, e.g. primary, info, success or error buttons. */

/**  */

/** The button's content; generally a string. */

/** Allows specifying an element other than `button` to be used as the wrapper node. */