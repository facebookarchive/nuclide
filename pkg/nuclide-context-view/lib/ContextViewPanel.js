'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ContextViewPanel = undefined;

var _react = _interopRequireWildcard(require('react'));

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
  return _react.createElement(
    'div',
    { className: 'nuclide-context-view-content padded' },
    _react.createElement(
      'p',
      null,
      props.locked ? _react.createElement((_Icon || _load_Icon()).Icon, { icon: 'lock' }) : null,
      'Click on a symbol (variable, function, type, etc) in an open file to see more information about it below.'
    ),
    props.children
  );
};