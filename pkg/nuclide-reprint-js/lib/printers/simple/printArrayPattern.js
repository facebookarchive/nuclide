'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ArrayPattern} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import flatten from '../../utils/flatten';
import printCommaSeparatedNodes from '../common/printCommaSeparatedNodes';

function printArrayPattern(print: Print, node: ArrayPattern): Lines {
  return flatten([
    '[',
    printCommaSeparatedNodes(print, node.elements),
    ']',
  ]);
}

module.exports = printArrayPattern;
