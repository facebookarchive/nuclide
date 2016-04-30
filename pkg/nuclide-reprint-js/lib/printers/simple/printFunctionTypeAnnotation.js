'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FunctionTypeAnnotation} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import flatten from '../../utils/flatten';
import markers from '../../constants/markers';
import printCommaSeparatedNodes from '../common/printCommaSeparatedNodes';

function printFunctionTypeAnnotation(
  print: Print,
  node: FunctionTypeAnnotation,
): Lines {
  // TODO: node.rest
  return flatten([
    '(',
    printCommaSeparatedNodes(print, node.params),
    ') =>',
    markers.noBreak,
    markers.space,
    print(node.returnType),
  ]);
}

module.exports = printFunctionTypeAnnotation;
