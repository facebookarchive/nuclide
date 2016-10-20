'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* NON-TRANSPILED FILE */
/* eslint comma-dangle: [1, always-multiline], prefer-object-spread/prefer-object-spread: 0 */

function isSemicolon(token) {
  return (token.type === 'Punctuator' && token.value === ';');
}

module.exports = function(context) {
  return {
    TypeAlias(node) {
      const lastToken = context.getLastToken(node);
      if (!isSemicolon(lastToken)) {
        context.report({
          node,
          message: 'Missing semicolon.',
          fix(fixer) {
            return fixer.insertTextAfter(lastToken, ';');
          },
        });
      }
    },
  };
};
