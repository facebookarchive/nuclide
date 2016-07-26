Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var NO_DEFINITION_MESSAGE = 'No definition selected.';
exports.NO_DEFINITION_MESSAGE = NO_DEFINITION_MESSAGE;
var LOADING_MESSAGE = 'Loading...';

exports.LOADING_MESSAGE = LOADING_MESSAGE;

/** A message view to be shown in Context View. */
var ContextViewMessage = function ContextViewMessage(props) {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    { className: 'padded' },
    props.message
  );
};
exports.ContextViewMessage = ContextViewMessage;