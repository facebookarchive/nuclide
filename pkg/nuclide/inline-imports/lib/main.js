/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

module.exports = function inlineImports(babel) {
  var aliases = {};
  var t = babel.types;

  function requireExpression(moduleID) {
    return t.callExpression(t.identifier('require'), [t.literal(moduleID)]);
  }

  function memoizeExpression(expression, genUID) {
    var memoizedFunction = genUID();
    var memoizedID = genUID();
    return {
      nodes: [
        t.variableDeclaration('var', [t.variableDeclarator(memoizedID)]),
        t.functionDeclaration(memoizedFunction, [], t.blockStatement([
          t.returnStatement(t.assignmentExpression('=', memoizedID, expression)),
        ])),
      ],
      memoizedRef: t.logicalExpression('||', memoizedID, t.callExpression(memoizedFunction, [])),
    };
  }

  return new babel.Transformer('inline-imports', {
    ImportDeclaration: function(node, parent, scope, state) {
      var moduleID = node.source.value;

      if (!node.specifiers.length) {
        return requireExpression(moduleID);
      }

      var genUID = scope.generateUidIdentifierBasedOnNode.bind(scope, node);
      var nodesToRepalceWith;
      var requireExpressionWithHelper = function(helper) {
        return t.callExpression(this.hub.file.addHelper(helper), [requireExpression(moduleID)]);
      }.bind(this);
      node.specifiers.forEach(function(specifier) {
        scope.removeBinding(specifier.local.name);

        var ref;
        var result;
        if (t.isImportNamespaceSpecifier(specifier)) {
          result = memoizeExpression(
            requireExpressionWithHelper('interop-require-wildcard'),
            genUID
          );
          nodesToRepalceWith = result.nodes;
          ref = result.memoizedRef;
        } else if (t.isSpecifierDefault(specifier)) {
          result = memoizeExpression(
            t.memberExpression(
              requireExpressionWithHelper('interop-require-default'),
              t.identifier('default')
            ),
            genUID
          );
          nodesToRepalceWith = result.nodes;
          ref = result.memoizedRef;
        } else {
          ref = t.memberExpression(
            requireExpression(moduleID),
            t.identifier(specifier.imported.name)
          );
        }

        aliases[specifier.local.name] = ref;
      });

      if (nodesToRepalceWith) {
        return nodesToRepalceWith;
      }
      this.dangerouslyRemove();
    },

    Identifier: function(node, parent, scope, state) {
      if (
        !aliases.hasOwnProperty(node.name) ||
        scope.hasBinding(node.name, true /* noGlobals */)
      ) {
        return node;
      }

      if (
        t.isAssignmentExpression(parent) &&
        this.isBindingIdentifier() &&
        !scope.bindingIdentifierEquals(node.name, node)
      ) {
        throw new Error(
          'Cannot assign to imported alias, ' + node.name + ', on line: ' + node.loc.start.line
        );
      }

      return this.isReferenced() ? aliases[node.name] : node;
    },
  });
};
