Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.parseJSON = parseJSON;
exports.babelPosToPoint = babelPosToPoint;
exports.babelLocToRange = babelLocToRange;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _babelCoreLibHelpersParse2;

function _babelCoreLibHelpersParse() {
  return _babelCoreLibHelpersParse2 = _interopRequireDefault(require('babel-core/lib/helpers/parse'));
}

/**
 * Returns a Babel Expression AST node, or null if the parse does not succeed.
 */

function parseJSON(json) {
  // This messes up the positions but without it, babel won't parse the text as an expression.
  var jsonWithParens = '(\n' + json + '\n)';
  try {
    var ast = (0, (_babelCoreLibHelpersParse2 || _babelCoreLibHelpersParse()).default)(jsonWithParens);
    if (ast.type === 'File') {
      (0, (_assert2 || _assert()).default)(ast.program.body[0].type === 'ExpressionStatement');
      return ast.program.body[0].expression;
    } else if (ast.type === 'Program') {
      (0, (_assert2 || _assert()).default)(ast.body[0].type === 'ExpressionStatement');
      return ast.body[0].expression;
    }
  } catch (e) {}
  return null;
}

function babelPosToPoint(pos) {
  // Need to subtract 2: one to move from 1-indexed to 0-indexed, another to account for the open
  // paren we had to add on the first line.
  return new (_atom2 || _atom()).Point(pos.line - 2, pos.column);
}

function babelLocToRange(loc) {
  return new (_atom2 || _atom()).Range(babelPosToPoint(loc.start), babelPosToPoint(loc.end));
}