'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Some source will transpile such that the "use babel" will still be the first
// in the file. This causes Atom to transpile those files twice in production
// releases.

module.exports = function removeUseBabel(babel) {
  return new babel.Plugin('remove-use-babel', {
    visitor: {
      Program(node, parent, scope, state) {
        // Covers: 'use babel' and "use babel"
        if (isUseBabel(node.body[0])) {
          this.get('body')[0].dangerouslyRemove();
          return;
        }
        // Covers: /** @babel */
        if (isUseBabel(parent.comments[0])) {
          // This won't remove the comment, it'll leave an empty comment block.
          // Like this: /**/
          parent.comments[0].value = '';
          return;
        }
      },
    },
  });
};

function isUseBabel(node) {
  return (
    // Covers: 'use babel' and "use babel"
    node &&
    node.type === 'ExpressionStatement' &&
    node.expression.type === 'Literal' &&
    node.expression.value === 'use babel'
  ) || (
    // Covers: /** @babel */
    node &&
    node.type === 'CommentBlock' &&
    node.value === '* @babel ' // with the leading "*" and the trailing space.
  );
}
