Object.defineProperty(exports, '__esModule', {
  value: true
});

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

var ButtonGroupSizes = Object.freeze({
  EXTRA_SMALL: 'EXTRA_SMALL',
  SMALL: 'SMALL',
  LARGE: 'LARGE'
});

exports.ButtonGroupSizes = ButtonGroupSizes;
var ButtonGroupSizeClassnames = Object.freeze({
  EXTRA_SMALL: 'btn-group-xs',
  SMALL: 'btn-group-sm',
  LARGE: 'btn-group-lg'
});

/**
 * Visually groups Buttons passed in as children.
 */
var ButtonGroup = function ButtonGroup(props) {
  var size = props.size;
  var children = props.children;
  var className = props.className;

  var sizeClassName = size == null ? '' : ButtonGroupSizeClassnames[size] || '';
  var newClassName = (0, (_classnames2 || _classnames()).default)(className, 'btn-group', 'nuclide-btn-group', _defineProperty({}, sizeClassName, size != null));
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    { className: newClassName },
    children
  );
};
exports.ButtonGroup = ButtonGroup;

/** The size of the buttons within the group. Overrides any `size` props on child buttons. */

/** The contents of the ButtonGroup; Generally, an instance of `Button`. */