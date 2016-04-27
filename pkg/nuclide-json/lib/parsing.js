Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.parseJSON = parseJSON;
exports.babelPosToPoint = babelPosToPoint;
exports.babelLocToRange = babelLocToRange;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var babelCore = null;
function babelParse(text) {
  if (babelCore == null) {
    babelCore = require('babel-core');
  }
  return babelCore.parse(text);
}

/**
 * Returns a Babel Expression AST node, or null if the parse does not succeed.
 */

function parseJSON(json) {
  // This fucks up the positions but without it, babel won't parse the text as an expression
  var jsonWithParens = '(\n' + json + '\n)';
  try {
    var ast = babelParse(jsonWithParens);
    return ast.body[0].expression;
  } catch (e) {
    return null;
  }
}

function babelPosToPoint(pos) {
  // Need to subtract 2: one to move from 1-indexed to 0-indexed, another to account for the open
  // paren we had to add on the first line.
  return new _atom.Point(pos.line - 2, pos.column);
}

function babelLocToRange(loc) {
  return new _atom.Range(babelPosToPoint(loc.start), babelPosToPoint(loc.end));
}