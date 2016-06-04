'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Based on https://github.com/eslint/eslint/blob/v2.11.1/lib/rules/comma-dangle.js

function last(arr) {
  return arr.length !== 0 ? arr[arr.length - 1] : undefined;
}

module.exports = function(context) {
  function isMultiline(node) {
    const lastItem = last(node.params);

    if (!lastItem) {
      return false;
    }

    const sourceCode = context.getSourceCode();
    let penultimateToken = sourceCode.getLastToken(lastItem);
    let lastToken = sourceCode.getTokenAfter(penultimateToken);

    if (lastToken.value === ',') {
      penultimateToken = lastToken;
      lastToken = sourceCode.getTokenAfter(lastToken);
    }
    return lastToken.loc.end.line !== penultimateToken.loc.end.line;
  }

  function checkForTrailingComma(node) {
    const lastItem = last(node.params);

    if (!lastItem) {
      return;
    }

    // `function f(...a,) {}` is invalid syntax
    if (lastItem.type === 'RestElement') {
      return;
    }

    const sourceCode = context.getSourceCode();
    const trailingToken = sourceCode.getTokenAfter(lastItem);

    if (isMultiline(node)) {
      // force trailing comma
      if (trailingToken.value !== ',') {
        context.report({
          node: lastItem,
          loc: lastItem.loc.end,
          message: 'Missing trailing comma.',
          fix(fixer) {
            return fixer.insertTextAfter(lastItem, ',');
          },
        });
      }
    } else {
      // forbid trailing comma
      if (trailingToken.value === ',') {
        context.report({
          node: lastItem,
          loc: trailingToken.loc.start,
          message: 'Unexpected trailing comma.',
          fix(fixer) {
            return fixer.remove(trailingToken);
          },
        });
      }
    }
  }

  return {
    ArrowFunctionExpression: checkForTrailingComma,
    FunctionDeclaration: checkForTrailingComma,
    FunctionExpression: checkForTrailingComma,
  };
};

module.exports.meta = {
  fixable: 'code',
};
