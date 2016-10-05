Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var HighlightColors = Object.freeze({
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error'
});

exports.HighlightColors = HighlightColors;
var HighlightColorClassNames = Object.freeze({
  'default': 'highlight',
  info: 'highlight-info',
  success: 'highlight-success',
  warning: 'highlight-warning',
  error: 'highlight-error'
});

var Highlight = function Highlight(props) {
  var className = props.className;
  var color = props.color;
  var children = props.children;

  var remainingProps = _objectWithoutProperties(props, ['className', 'color', 'children']);

  var colorClassName = color == null ? 'highlight' : HighlightColorClassNames[color];
  var newClassName = (0, (_classnames2 || _classnames()).default)(colorClassName, className);
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'span',
    _extends({ className: newClassName }, remainingProps),
    children
  );
};
exports.Highlight = Highlight;