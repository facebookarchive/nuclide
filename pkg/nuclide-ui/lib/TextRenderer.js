Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.TextRenderer = TextRenderer;

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

function TextRenderer(evaluationResult) {
  var type = evaluationResult.type;
  var value = evaluationResult.value;

  if (type === 'text') {
    return (_reactForAtom2 || _reactForAtom()).React.createElement(
      'span',
      null,
      value
    );
  } else {
    return null;
  }
}