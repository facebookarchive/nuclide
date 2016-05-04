function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _jscodeshift = require('jscodeshift');

var _jscodeshift2 = _interopRequireDefault(_jscodeshift);

/**
 * This module helps support a hack to easily introduce new lines into the AST.
 */
var NewLine = Object.defineProperties({
  literal: '$$newline$$',
  replace: function replace(input) {
    /**
     * This regex functions by matching:
     *
     *   - contiguous new lines
     *   - non new line characters
     *   - the string "$$newline$$" and surrounding characters
     *   - non new line characters
     *   - contiguous new lines
     *
     * This way it only removes extra new lines around the explicit new lines
     * we have added in the file. It does not remove arbitrary extra new lines.
     */
    return input.replace(/(\n*[^\n]*\$\$newline\$\$[^\n]*\n*){1,}/g, '\n\n');
  }
}, {
  statement: {
    get: function get() {
      return _jscodeshift2.default.expressionStatement(_jscodeshift2.default.literal(NewLine.literal));
    },
    configurable: true,
    enumerable: true
  }
});

module.exports = NewLine;