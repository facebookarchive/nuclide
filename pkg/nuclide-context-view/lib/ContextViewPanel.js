'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ContextViewPanel = undefined;

var _react = _interopRequireDefault(require('react'));

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const ContextViewPanel = exports.ContextViewPanel = props => {
  return _react.default.createElement(
    'div',
    { className: 'nuclide-context-view-content padded' },
    _react.default.createElement(
      'p',
      null,
      props.locked ? _react.default.createElement((_Icon || _load_Icon()).Icon, { icon: 'lock' }) : null,
      'Click on a symbol (variable, function, type, etc) in an open file to see more information about it below.'
    ),
    props.children
  );
};