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
exports.ButtonToolbar = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _reactForAtom = require('react-for-atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Visually groups Buttons passed in as children.
 */
const ButtonToolbar = exports.ButtonToolbar = props => {
  const children = props.children,
        className = props.className;

  return _reactForAtom.React.createElement(
    'div',
    { className: (0, (_classnames || _load_classnames()).default)('btn-toolbar', className) },
    children
  );
};