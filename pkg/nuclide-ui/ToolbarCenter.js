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
exports.ToolbarCenter = undefined;

var _reactForAtom = require('react-for-atom');

const ToolbarCenter = exports.ToolbarCenter = props => {
  return _reactForAtom.React.createElement(
    'div',
    { className: 'nuclide-ui-toolbar__center' },
    props.children
  );
};