var _templateObject = _taggedTemplateLiteral(['', ''], ['', '']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _StringUtils2;

function _StringUtils() {
  return _StringUtils2 = require('./StringUtils');
}

var _jscodeshift2;

function _jscodeshift() {
  return _jscodeshift2 = _interopRequireDefault(require('jscodeshift'));
}

var _oneLineObjectPattern2;

function _oneLineObjectPattern() {
  return _oneLineObjectPattern2 = _interopRequireDefault(require('./oneLineObjectPattern'));
}

var _reprintComment2;

function _reprintComment() {
  return _reprintComment2 = _interopRequireDefault(require('./reprintComment'));
}

var statement = (_jscodeshift2 || _jscodeshift()).default.template.statement;

/**
 * Thin wrapper to reprint requires, it's wrapped in a new function in order to
 * easily attach comments to the node.
 */
function reprintRequire(node) {
  var comments = node.comments;
  var newNode = reprintRequireHelper(node);
  if (comments) {
    newNode.comments = comments.map(function (comment) {
      return (0, (_reprintComment2 || _reprintComment()).default)(comment);
    });
  }
  return newNode;
}

/**
 * This takes in a require node and reprints it. This should remove whitespace
 * and allow us to have a consistent formatting of all requires.
 */
function reprintRequireHelper(node) {
  if ((_jscodeshift2 || _jscodeshift()).default.ExpressionStatement.check(node)) {
    return statement(_templateObject, node.expression);
  }

  if ((_jscodeshift2 || _jscodeshift()).default.VariableDeclaration.check(node)) {
    var kind = node.kind || 'const';
    var declaration = node.declarations[0];
    if ((_jscodeshift2 || _jscodeshift()).default.Identifier.check(declaration.id)) {
      return (_jscodeshift2 || _jscodeshift()).default.variableDeclaration(kind, [(_jscodeshift2 || _jscodeshift()).default.variableDeclarator(declaration.id, declaration.init)]);
    } else if ((_jscodeshift2 || _jscodeshift()).default.ObjectPattern.check(declaration.id)) {
      declaration.id.properties.sort(function (prop1, prop2) {
        return (0, (_StringUtils2 || _StringUtils()).compareStrings)(prop1.key.name, prop2.key.name);
      });
      return (_jscodeshift2 || _jscodeshift()).default.variableDeclaration(kind, [(_jscodeshift2 || _jscodeshift()).default.variableDeclarator((0, (_oneLineObjectPattern2 || _oneLineObjectPattern()).default)(declaration.id), declaration.init)]);
    } else if ((_jscodeshift2 || _jscodeshift()).default.ArrayPattern.check(declaration.id)) {
      return (_jscodeshift2 || _jscodeshift()).default.variableDeclaration(kind, [(_jscodeshift2 || _jscodeshift()).default.variableDeclarator(declaration.id, declaration.init)]);
    }
  }

  if ((_jscodeshift2 || _jscodeshift()).default.ImportDeclaration.check(node) && node.importKind === 'type') {
    // Sort the specifiers.
    node.specifiers.sort(function (one, two) {
      return (0, (_StringUtils2 || _StringUtils()).compareStrings)(one.local.name, two.local.name);
    });
    // TODO: Properly remove new lines from the node.
    return node;
  }

  return node;
}

module.exports = reprintRequire;