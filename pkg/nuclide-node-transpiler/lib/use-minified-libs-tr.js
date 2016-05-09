'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const MINIFIED_LIBS = new Map([
  ['rxjs', 'rxjs/bundles/Rx.umd.min.js'],
]);

function replaceModuleId(node) {
  const id = node.value;
  for (const minifiedLib of MINIFIED_LIBS) {
    const name = minifiedLib[0];
    const replacement = minifiedLib[1];
    if (id === name) {
      node.value = replacement;
    } else if (id.startsWith(name + '/')) {
      throw this.errorWithNode(`Only importing "${name}" is supported.`);
    }
  }
}

module.exports = function useMinifiedLibs(babel) {
  return new babel.Plugin('use-minified-libs', {
    visitor: {
      CallExpression(node, parent, scope, state) {
        // "require.resolve" is not checked.
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'require' &&
          node.arguments[0] &&
          node.arguments[0].type === 'Literal'
        ) {
          replaceModuleId.call(this, node.arguments[0]);
        }
      },
      ImportDeclaration(node, parent, scope, state) {
        if (node.importKind !== 'type') {
          replaceModuleId.call(this, node.source);
        }
      },
      'ExportAllDeclaration|ExportNamedDeclaration'(node, parent, scope, state) {
        if (node.exportKind !== 'type' && node.source !== null) {
          replaceModuleId.call(this, node.source);
        }
      },
    },
  });
};
