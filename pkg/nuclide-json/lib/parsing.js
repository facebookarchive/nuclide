'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Point} from 'atom';

let babelCore = null;
function babelParse(text: string): Object {
  if (babelCore == null) {
    babelCore = require('babel-core');
  }
  return babelCore.parse(text);
}

/**
 * Returns a Babel Expression AST node, or null if the parse does not succeed.
 */
export function parseJSON(json: string): ?Object {
  // This fucks up the positions but without it, babel won't parse the text as an expression
  const jsonWithParens = '(\n' + json + '\n)';
  try {
    const ast = babelParse(jsonWithParens);
    return ast.body[0].expression;
  } catch (e) {
    return null;
  }
}

export function babelPosToPoint(pos: { line: number; column: number }): atom$Point {
  // Need to subtract 2: one to move from 1-indexed to 0-indexed, another to account for the open
  // paren we had to add on the first line.
  return new Point(pos.line - 2, pos.column);
}
