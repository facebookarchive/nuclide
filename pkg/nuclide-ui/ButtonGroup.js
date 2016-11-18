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
exports.ButtonGroup = exports.ButtonGroupSizes = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _reactForAtom = require('react-for-atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ButtonGroupSizes = exports.ButtonGroupSizes = Object.freeze({
  EXTRA_SMALL: 'EXTRA_SMALL',
  SMALL: 'SMALL',
  LARGE: 'LARGE'
});

const ButtonGroupSizeClassnames = Object.freeze({
  EXTRA_SMALL: 'btn-group-xs',
  SMALL: 'btn-group-sm',
  LARGE: 'btn-group-lg'
});

/**
 * Visually groups Buttons passed in as children.
 */
const ButtonGroup = exports.ButtonGroup = props => {
  const size = props.size,
        children = props.children,
        className = props.className;

  const sizeClassName = size == null ? '' : ButtonGroupSizeClassnames[size] || '';
  const newClassName = (0, (_classnames || _load_classnames()).default)(className, 'btn-group', 'nuclide-btn-group', {
    [sizeClassName]: size != null
  });
  return _reactForAtom.React.createElement(
    'div',
    { className: newClassName },
    children
  );
};