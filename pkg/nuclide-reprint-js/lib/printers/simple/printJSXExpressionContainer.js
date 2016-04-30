'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {JSXExpressionContainer} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import flatten from '../../utils/flatten';
import markers from '../../constants/markers';

function printJSXExpressionContainer(
  print: Print,
  node: JSXExpressionContainer,
): Lines {
  return flatten([
    '{',
    markers.openScope,
    markers.scopeIndent,
    markers.scopeBreak,
    print(node.expression),
    markers.scopeBreak,
    markers.scopeDedent,
    markers.closeScope,
    '}',
  ]);
}

module.exports = printJSXExpressionContainer;
