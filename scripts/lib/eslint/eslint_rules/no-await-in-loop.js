'use babel';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Node types which are considered loops.
var loopTypes = new Set([
  'ForStatement',
  'ForOfStatement',
  'ForInStatement',
  'WhileStatement',
  'DoWhileStatement',
]);

// Node types at which we should stop looking for loops. For example, if is fine to declare an async
// function within a loop, and use await inside of that.
var boundaryTypes = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
]);

module.exports = function(context) {
  return {
    // babel-eslint transpiles AwaitExpressions to YieldExpressions, but the actual node kind is
    // still available in _babelType.
    YieldExpression: function(node) {
      if (node._babelType === 'AwaitExpression') {
        var ancestors = context.getAncestors();
        // Reverse so that we can traverse from the deepest node upwards.
        ancestors.reverse();
        // Create a set of all the ancestors plus this node so that we can check
        // if this use of await appears in the body of the loop as opposed to
        // the right-hand side of a for...of, for example.
        var ancestorSet = new Set(ancestors).add(node);
        for (var ancestor of ancestors) {
          if (boundaryTypes.has(ancestor.type)) {
            // Short-circuit out if we encounter a boundary type. Loops above
            // this do not matter.
            return;
          }
          if (loopTypes.has(ancestor.type)) {
            // Only report if we are actually in the body
            if (ancestorSet.has(ancestor.body)) {
              context.report(
                node,
                'Avoid using await inside a loop. Consider refactoring to use Promise.all. If ' +
                'you are sure you want to do this, add `// eslint-disable-line no-await-in-loop` ' +
                ' at the end of this line.'
              );
              return;
            }
          }
        }
      }
    },
  };
}
