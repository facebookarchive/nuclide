'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ContextViewPanel = undefined;

var _reactForAtom = require('react-for-atom');

var _Icon;

function _load_Icon() {
  return _Icon = require('../../nuclide-ui/Icon');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const ContextViewPanel = exports.ContextViewPanel = props => {
  return _reactForAtom.React.createElement(
    'div',
    { className: 'nuclide-context-view-content padded' },
    _reactForAtom.React.createElement(
      'p',
      null,
      props.locked ? _reactForAtom.React.createElement((_Icon || _load_Icon()).Icon, { icon: 'lock' }) : null,
      'Click on a symbol to see more information about it.'
    ),
    props.children
  );
};