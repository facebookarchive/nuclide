'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseJSON = parseJSON;
exports.babelPosToPoint = babelPosToPoint;
exports.babelLocToRange = babelLocToRange;

var _atom = require('atom');

var _babylon;

function _load_babylon() {
  return _babylon = _interopRequireWildcard(require('babylon'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Returns a Babel Expression AST node, or null if the parse does not succeed.
 */
function parseJSON(json) {
  // This messes up the positions but without it, babel won't parse the text as an expression.
  const jsonWithParens = '(\n' + json + '\n)';
  try {
    const ast = (_babylon || _load_babylon()).parse(jsonWithParens);
    if (ast.type === 'File') {
      if (!(ast.program.body[0].type === 'ExpressionStatement')) {
        throw new Error('Invariant violation: "ast.program.body[0].type === \'ExpressionStatement\'"');
      }

      return ast.program.body[0].expression;
    } else if (ast.type === 'Program') {
      if (!(ast.body[0].type === 'ExpressionStatement')) {
        throw new Error('Invariant violation: "ast.body[0].type === \'ExpressionStatement\'"');
      }

      return ast.body[0].expression;
    }
  } catch (e) {}
  return null;
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function babelPosToPoint(pos) {
  // Need to subtract 2: one to move from 1-indexed to 0-indexed, another to account for the open
  // paren we had to add on the first line.
  return new _atom.Point(pos.line - 2, pos.column);
}

function babelLocToRange(loc) {
  return new _atom.Range(babelPosToPoint(loc.start), babelPosToPoint(loc.end));
}