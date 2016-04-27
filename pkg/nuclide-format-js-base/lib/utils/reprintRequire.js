var _templateObject = _taggedTemplateLiteral(['', ''], ['', '']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('./StringUtils');

var compareStrings = _require.compareStrings;

var jscs = require('jscodeshift');
var oneLineObjectPattern = require('./oneLineObjectPattern');
var reprintComment = require('./reprintComment');

var statement = jscs.template.statement;

/**
 * Thin wrapper to reprint requires, it's wrapped in a new function in order to
 * easily attach comments to the node.
 */
function reprintRequire(node) {
  var comments = node.comments;
  var newNode = reprintRequireHelper(node);
  if (comments) {
    newNode.comments = comments.map(function (comment) {
      return reprintComment(comment);
    });
  }
  return newNode;
}

/**
 * This takes in a require node and reprints it. This should remove whitespace
 * and allow us to have a consistent formatting of all requires.
 */
function reprintRequireHelper(node) {
  if (jscs.ExpressionStatement.check(node)) {
    return statement(_templateObject, node.expression);
  }

  if (jscs.VariableDeclaration.check(node)) {
    var kind = node.kind || 'const';
    var declaration = node.declarations[0];
    if (jscs.Identifier.check(declaration.id)) {
      return jscs.variableDeclaration(kind, [jscs.variableDeclarator(declaration.id, declaration.init)]);
    } else if (jscs.ObjectPattern.check(declaration.id)) {
      declaration.id.properties.sort(function (prop1, prop2) {
        return compareStrings(prop1.key.name, prop2.key.name);
      });
      return jscs.variableDeclaration(kind, [jscs.variableDeclarator(oneLineObjectPattern(declaration.id), declaration.init)]);
    } else if (jscs.ArrayPattern.check(declaration.id)) {
      return jscs.variableDeclaration(kind, [jscs.variableDeclarator(declaration.id, declaration.init)]);
    }
  }

  if (jscs.ImportDeclaration.check(node) && node.importKind === 'type') {
    // Sort the specifiers.
    node.specifiers.sort(function (one, two) {
      return compareStrings(one.local.name, two.local.name);
    });
    // TODO: Properly remove new lines from the node.
    return node;
  }

  return node;
}

module.exports = reprintRequire;