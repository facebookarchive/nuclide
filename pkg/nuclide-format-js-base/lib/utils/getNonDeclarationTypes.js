

var jscs = require('jscodeshift');

/**
 * This will get a list of all types that are not from a declaration.
 *
 * NOTE: this can get types that are declared, if you want access to
 * types that are used but undeclared see getUndeclaredTypes
 */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function getNonDeclarationTypes(root) {
  var ids = new Set();

  // Pull out the logic to handle a generic type annotation, we have to iterate
  // down the qualified types to handle things like: `<Immutable.List<Foo>>`
  function handleGenericType(node) {
    if (jscs.Identifier.check(node.id)) {
      ids.add(node.id.name);
    }
    if (jscs.QualifiedTypeIdentifier.check(node.id)) {
      var currPos = node.id;
      while (currPos && !jscs.Identifier.check(currPos)) {
        currPos = currPos.qualification;
      }
      if (jscs.Identifier.check(currPos)) {
        ids.add(currPos.name);
      }
    }
  }

  // Ideally this would be the only find in here, but it's not because of a
  // jscodeshift bug, so we have to manually search for a specific kind of
  // GenericTypeAnnotations on class super types
  root.find(jscs.GenericTypeAnnotation).forEach(function (path) {
    return handleGenericType(path.node);
  });

  // TODO: Delete this after https://github.com/facebook/jscodeshift/issues/34
  root.find(jscs.ClassDeclaration).filter(function (path) {
    return path.node.superTypeParameters && Array.isArray(path.node.superTypeParameters.params);
  }).forEach(function (path) {
    jscs(path.node.superTypeParameters).find(jscs.GenericTypeAnnotation).forEach(function (subPath) {
      return handleGenericType(subPath.node);
    });
  });

  return ids;
}

module.exports = getNonDeclarationTypes;