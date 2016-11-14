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
exports.TextRenderer = TextRenderer;

var _reactForAtom = require('react-for-atom');

function TextRenderer(evaluationResult) {
  const type = evaluationResult.type,
        value = evaluationResult.value;

  if (type === 'text') {
    return _reactForAtom.React.createElement(
      'span',
      null,
      value
    );
  } else {
    return null;
  }
}