'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Button = exports.ButtonTypes = exports.ButtonSizes = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _reactForAtom = require('react-for-atom');

var _string;

function _load_string() {
  return _string = require('../commons-node/string');
}

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('./add-tooltip'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

const ButtonSizes = exports.ButtonSizes = Object.freeze({
  EXTRA_SMALL: 'EXTRA_SMALL',
  SMALL: 'SMALL',
  LARGE: 'LARGE'
});

const ButtonTypes = exports.ButtonTypes = Object.freeze({
  PRIMARY: 'PRIMARY',
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR'
});

const ButtonSizeClassnames = Object.freeze({
  EXTRA_SMALL: 'btn-xs',
  SMALL: 'btn-sm',
  LARGE: 'btn-lg'
});

const ButtonTypeClassnames = Object.freeze({
  PRIMARY: 'btn-primary',
  INFO: 'btn-info',
  SUCCESS: 'btn-success',
  WARNING: 'btn-warning',
  ERROR: 'btn-error'
});

/**
 * Generic Button wrapper.
 */
const Button = exports.Button = props => {
  const icon = props.icon;
  const buttonType = props.buttonType;
  const selected = props.selected;
  const size = props.size;
  const children = props.children;
  const className = props.className;
  const wrapperElement = props.wrapperElement;
  const tooltip = props.tooltip;

  const remainingProps = _objectWithoutProperties(props, ['icon', 'buttonType', 'selected', 'size', 'children', 'className', 'wrapperElement', 'tooltip']);

  const sizeClassname = size == null ? '' : ButtonSizeClassnames[size] || '';
  const buttonTypeClassname = buttonType == null ? '' : ButtonTypeClassnames[buttonType] || '';
  const ref = tooltip ? (0, (_addTooltip || _load_addTooltip()).default)(tooltip) : null;
  const newClassName = (0, (_classnames || _load_classnames()).default)(className, 'btn', {
    [`icon icon-${ (0, (_string || _load_string()).maybeToString)(icon) }`]: icon != null,
    [sizeClassname]: size != null,
    selected: selected,
    [buttonTypeClassname]: buttonType != null
  });
  const Wrapper = wrapperElement == null ? 'button' : wrapperElement;
  return _reactForAtom.React.createElement(
    Wrapper,
    _extends({ className: newClassName, ref: ref }, remainingProps),
    children
  );
};