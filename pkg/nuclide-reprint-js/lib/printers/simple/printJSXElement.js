'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {JSXElement} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import markers from '../../constants/markers';
import wrapExpression from '../../wrappers/simple/wrapExpression';

function printJSXElement(print: Print, node: JSXElement): Lines {
  const wrap = x => wrapExpression(print, node, x);
  return wrap([
    markers.openScope,
    markers.scopeIndent,
    print(node.openingElement),
    markers.scopeBreak,
    node.children.map(child => [
      print(child),
      markers.scopeBreak,
    ]),
    markers.scopeDedent,
    markers.closeScope,
    print(node.closingElement),
  ]);
}

module.exports = printJSXElement;
