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
exports.Icon = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _reactForAtom = require('react-for-atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/**
 * Renders an icon with optional text next to it.
 */
const Icon = exports.Icon = props => {
  const icon = props.icon;
  const children = props.children;
  const className = props.className;

  const remainingProps = _objectWithoutProperties(props, ['icon', 'children', 'className']);

  const newClassName = (0, (_classnames || _load_classnames()).default)(className, {
    [`icon icon-${ icon }`]: icon != null
  });
  return _reactForAtom.React.createElement(
    'span',
    _extends({ className: newClassName }, remainingProps),
    children
  );
};