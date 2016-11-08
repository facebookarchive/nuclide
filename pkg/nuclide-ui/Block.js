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
exports.Block = undefined;

var _reactForAtom = require('react-for-atom');

/** A Block. */
const Block = exports.Block = props => _reactForAtom.React.createElement(
  'div',
  { className: 'block' },
  props.children
);