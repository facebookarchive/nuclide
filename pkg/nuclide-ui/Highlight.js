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
exports.Highlight = exports.HighlightColors = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _reactForAtom = require('react-for-atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

const HighlightColors = exports.HighlightColors = Object.freeze({
  default: 'default',
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error'
});

const HighlightColorClassNames = Object.freeze({
  default: 'highlight',
  info: 'highlight-info',
  success: 'highlight-success',
  warning: 'highlight-warning',
  error: 'highlight-error'
});

const Highlight = exports.Highlight = props => {
  const className = props.className,
        color = props.color,
        children = props.children,
        remainingProps = _objectWithoutProperties(props, ['className', 'color', 'children']);

  const colorClassName = HighlightColorClassNames[color == null ? 'default' : color];
  const newClassName = (0, (_classnames || _load_classnames()).default)(colorClassName, className);
  return _reactForAtom.React.createElement(
    'span',
    Object.assign({ className: newClassName }, remainingProps),
    children
  );
};