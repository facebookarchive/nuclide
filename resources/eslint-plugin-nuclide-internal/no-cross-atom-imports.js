'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const resolveFrom = require('resolve-from');
const path = require('path');
const fs = require('fs');

module.exports = function(context) {
  const filename = context.getFilename();
  const dirname = path.dirname(filename);
  const ownPackage = getPackage(filename);

  const whitelist =
    new Set(context.options[0] && context.options[0].whitelist || []);

  if (!ownPackage) {
    throw new Error(`"${filename}" does not have a package.json`);
  }

  function getCrossImportPackage(id) {
    const resolved = resolveFrom(dirname, id);
    // Exclude modules that are not found or not ours.
    if (resolved == null || resolved.includes('/node_modules/')) {
      return null;
    }
    const resolvedPackage = getPackage(resolved);
    // Requiring anything in our package is ok.
    if (resolvedPackage.__dirname === ownPackage.__dirname) {
      return null;
    }
    // Requiring non-Atom packages is ok.
    if (!(resolvedPackage.nuclide && resolvedPackage.nuclide.packageType === 'Atom')) {
      return null;
    }
    if (whitelist.has(resolvedPackage.name)) {
      return null;
    }

    return resolvedPackage;
  }

  return {
    CallExpression(node) {
      if (!isRequire(node)) {
        return;
      }
      // require("…")
      const id = node.arguments[0].value;
      const pkg = getCrossImportPackage(id);
      if (pkg) {
        context.report({
          node,
          message: `Atom package "${pkg.name}" is not requireable from other packages.`,
        });
      }
    },
    ExportNamedDeclaration(node) {
      if (node.source == null || node.exportKind === 'type') {
        return;
      }
      // export foo from "…"
      const id = node.source.value;
      const pkg = getCrossImportPackage(id);
      if (pkg) {
        context.report({
          node,
          message: `Atom package "${pkg.name}" is not exportable from other packages.`,
        });
      }
    },
    ExportAllDeclaration(node) {
      // export * from "…"
      const id = node.source.value;
      const pkg = getCrossImportPackage(id);
      if (pkg) {
        context.report({
          node,
          message: `Atom package "${pkg.name}" is not exportable from other packages.`,
        });
      }
    },
    ImportDeclaration(node) {
      if (node.importKind === 'type' || node.importKind === 'typeof') {
        return;
      }
      // import foo from "…"
      const id = node.source.value;
      const pkg = getCrossImportPackage(id);
      if (pkg) {
        context.report({
          node,
          message: `Atom package "${pkg.name}" is not importable from other packages.`,
        });
      }
    },
  };
};

function getPackage(start) {
  let current = path.resolve(start);
  for (;;) {
    const filename = path.join(current, 'package.json');
    try {
      const source = fs.readFileSync(filename, 'utf8');
      const json = JSON.parse(source);
      json.__filename = filename;
      json.__dirname = current;
      return json;
    } catch (err) {
      if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
        const next = path.join(current, '..');
        if (next === current) {
          return null;
        } else {
          current = next;
        }
      } else {
        throw err;
      }
    }
  }
}

function isRequire(node) {
  return (
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require' &&
    node.arguments[0] &&
    node.arguments[0].type === 'Literal'
  );
}
