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

// The expected header for a "types-only module" is in `license-header.js` as
// `LICENSE_WITH_FLOW`. If your module gets mistaken for a "types-only" because
// it doesn't export any values, then add `export {};`. That's a value export
// of nothing (not to be confused for empty object).

const PREFIXES = ["'use babel'", '"use babel"', '/* @flow */', '/** @babel */'];
const PREFIX_LENGTH = Math.max(...PREFIXES.map(x => x.length));

function willCompile(bufferOrString) {
  const start = bufferOrString.slice(0, PREFIX_LENGTH).toString();
  return PREFIXES.some(prefix => start.startsWith(prefix));
}

module.exports = context => {
  const aliasTypeExport = [];
  const namedTypeExports = [];
  const valueExports = [];
  let hasModuleExports = false;

  return {
    ExportAllDeclaration(node) {
      // export * from …;
      valueExports.push(node);
    },

    ExportDefaultDeclaration(node) {
      // export default 1;
      // export default function () {};
      valueExports.push(node);
    },

    ExportNamedDeclaration(node) {
      if (node.exportKind === 'type') {
        if (node.declarations) {
          // export type … = …;
          aliasTypeExport.push(node);
        } else {
          // export type …;
          // export type … from …;
          namedTypeExports.push(node);
        }
      } else if (node.exportKind === 'value') {
        valueExports.push(node);
      }
    },

    MemberExpression(node) {
      if ((
        node.object.type === 'Identifier' &&
        node.object.name === 'module' &&
        node.property.type === 'Identifier' &&
        node.property.name === 'exports'
      ) || (
        node.object.type === 'Identifier' &&
        node.object.name === 'exports' &&
        node.property.type === 'Identifier'
      )) {
        hasModuleExports = true;
      }
    },

    'Program:exit'(node) {
      if (
        !hasModuleExports &&
        !valueExports.length &&
        (aliasTypeExport.length || namedTypeExports.length)
      ) {
        const sourceCode = context.getSourceCode();
        if (willCompile(sourceCode.text)) {
          context.report({
            node,
            message: 'types-only modules should use the types header',
          });
        }
      }
    },
  };
};
