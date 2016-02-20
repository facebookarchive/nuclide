'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

module.exports = function(context) {
  function requireComma(node) {
    const tokens = context.getSourceCode().getTokens(node);
    const lastToken = tokens[tokens.length - 1];
    if (lastToken.type === 'Punctuator') {
      if (lastToken.value === ',') {
        context.report({
          message: 'Prefer semicolons to commas in object and class types',
          node: lastToken,
          fix: function(fixer) {
            return fixer.replaceText(lastToken, ';');
          },
        });
      }
    }
  }

  return {
    ObjectTypeProperty: requireComma,
  };
};
