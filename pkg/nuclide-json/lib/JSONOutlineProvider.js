'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Outline} from '../../nuclide-outline-view';

import {Point} from 'atom';

let babelCore = null;
function babelParse(text: string): Object {
  if (babelCore == null) {
    babelCore = require('babel-core');
  }
  return babelCore.parse(text);
}

export function getOutline(text: string): ?Outline {
  // This fucks up the positions but without it, babel won't parse the text as an expression
  const textWithParens = '(\n' + text + '\n)';
  let expression;
  try {
    const ast = babelParse(textWithParens);
    expression = ast.body[0].expression;
  } catch (e) {
    return null;
  }
  if (expression.type === 'ObjectExpression') {
    const outlineTrees = expression.properties
      // Filter out property keys that aren't string literals, such as computed properties. They
      // aren't valid JSON but nothing actually enforces that we are getting valid JSON and we are
      // using a full JS parser so we have to handle cases like this.
      .filter(prop => prop.key.type === 'Literal' && typeof prop.key.value === 'string')
      .map(prop => {
        return {
          plainText: prop.key.value,
          startPosition: babelPosToPoint(prop.loc.start),
          endPosition: babelPosToPoint(prop.loc.end),
          children: [],
        };
      });
    return { outlineTrees };
  }
  return null;
}

function babelPosToPoint(pos: { line: number; column: number }): atom$Point {
  // Need to subtract 2: one to move from 1-indexed to 0-indexed, another to account for the open
  // paren we had to add on the first line.
  return new Point(pos.line - 2, pos.column);
}
