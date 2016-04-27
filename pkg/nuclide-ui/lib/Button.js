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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _classnames2 = require('classnames');

var _classnames3 = _interopRequireDefault(_classnames2);

var _reactForAtom = require('react-for-atom');

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
  var _classnames;

  var icon = props.icon;
  var buttonType = props.buttonType;
  var selected = props.selected;
  var size = props.size;
  var children = props.children;
  var className = props.className;

  var remainingProps = _objectWithoutProperties(props, ['icon', 'buttonType', 'selected', 'size', 'children', 'className']);

  var sizeClassname = size == null ? '' : ButtonSizeClassnames[size] || '';
  var buttonTypeClassname = buttonType == null ? '' : ButtonTypeClassnames[buttonType] || '';
  var newClassName = (0, _classnames3['default'])(className, 'btn', (_classnames = {}, _defineProperty(_classnames, 'icon icon-' + icon, icon != null), _defineProperty(_classnames, sizeClassname, size != null), _defineProperty(_classnames, 'selected', selected), _defineProperty(_classnames, buttonTypeClassname, buttonType != null), _classnames));
  return _reactForAtom.React.createElement(
    'div',
    _extends({ className: newClassName }, remainingProps),
    children
  );
};
exports.Button = Button;

/** Octicon icon name, without the `icon-` prefix. E.g. `'arrow-up'` */

/** Optional specifier for special buttons, e.g. primary, info, success or error buttons. */

/**  */

/** The button's content; generally a string. */