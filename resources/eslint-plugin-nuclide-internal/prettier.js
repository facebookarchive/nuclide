/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @noflow
 */
'use strict';

/* eslint comma-dangle: [1, always-multiline], prefer-object-spread/prefer-object-spread: 0 */


const message =
  'This file has the @format directive in a docblock ' +
  'indicating that it should be formatted with prettier, but ' +
  'the contents do not appear to be formatted. Re-run cmd-shift-c in ' +
  'Nuclide to format the file, or apply the auto lint fix.';

// Should be kept in sync with
//   fbobjc/Tools/Nuclide/pkg/fb-prettier/lib/main.js
//   (https://fburl.com/a5j7l85o)
// or we'll be formatting our code different from different entry points
const options = {
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: false,
  jsxBracketSameLine: true,
  parser: 'flow',
};

function format(source) {
  return require('prettier').format(source, options);
}

module.exports = function rule(context) {
  return {
    'Program:exit'(node) {
      const firstComment = node.comments[0];
      if (
        !firstComment ||
        firstComment.start !== 0 ||
        !firstComment.value.includes('* @format')
      ) {
        return;
      }

      const source = context.getSource();
      const prettierSource = format(source);
      if (source !== prettierSource) {
        context.report({
          node,
          message,
          fix: fixer => {
            // We can't replace the node's text because the Program node doesn't
            // include the docBlock, so calling
            // `fixer.replaceText(node, prettierSource)` ends up leaving the
            // existing docBlock intact and adding the new one right below.
            //
            // Will update if we figure out something better than just
            // replacing 1 billion lines (https://fburl.com/9bbttx0h)
            return fixer.replaceTextRange([0, 1e9], prettierSource);
          },
        });
      }
    },
  };
};
