'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// This rule is here because of a babel 5 bug, where "export type" is treated
// as a value export. This results in the types file getting required. In most
// cases, the types file gets transpiled to a mostly empty file (because types
// get removed), so there's only a small perf cost. However, there is some flow
// syntax that is not supported by babel 5 (e.g. "export interface") that
// results in the transpiler throwing at runtime.

// import foo from './foo';         <- will get required
// export type {foo};               <- will get exported

// export type bar = {};            <- will NOT get exported

// import type bar from './bar';    <- will NOT get required

// export type {bar};               <- will get exported
// export type {baz} from './baz';  <- will get required and exported

const assert = require('assert');

module.exports = function(context) {
  const aliasTypeExport = [];
  const namedTypeExports = [];
  const valueExports = [];

  // TODO(asuarez): Write tests for "includeTypeAlias" mode and turn it on.
  // const includeTypeAlias = context.options.indexOf('includeTypeAlias') !== -1;
  const includeTypeAlias = false;

  function isImportType(name, moduleScope) {
    assert(moduleScope.type === 'module');
    for (const variable of moduleScope.variables) {
      if (variable.name === name) {
        for (const def of variable.defs) {
          if (def.type === 'ImportBinding' &&
            (
              def.parent.importKind === 'type' ||
              def.parent.importKind === 'typeof'
            )
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

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

    'Program:exit'(node) {
      if (valueExports.length === 0) {
        // This is probably a types file...
        return;
      }

      if (includeTypeAlias) {
        for (const typeExport of [aliasTypeExport, namedTypeExports]) {
          for (const typeNode of typeExport) {
            context.report({
              node: typeNode,
              message: 'Unexpected type exporting.',
            });
          }
        }
        return;
      }

      for (const typeNode of namedTypeExports) {
        // export type … from …;
        if (typeNode.source !== null) {
          context.report({
            node: typeNode,
            message: 'Unexpected type re-exporting. ' +
                     'Import the type where it\'s used instead.',
          });
        }

        // export type …;
        const moduleScope = context.getScope().childScopes[0];
        for (const specifier of typeNode.specifiers) {
          if (isImportType(specifier.local.name, moduleScope)) {
            context.report({
              node: specifier,
              message: 'Unexpected type re-exporting. ' +
                       'Import the type where it\'s used instead.',
            });
          }
        }
      }

    },
  };
};

module.exports.schema = [
  {
    enum: ['includeTypeAlias'],
  },
];
