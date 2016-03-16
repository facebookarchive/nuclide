'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Lines, Print} from '../../types/common';
import type {TupleTypeAnnotation} from 'ast-types-flow';

const flatten = require('../../utils/flatten');
const printCommaSeparatedNodes = require('../common/printCommaSeparatedNodes');

function printTupleTypeAnnotation(
  print: Print,
  node: TupleTypeAnnotation,
): Lines {
  return flatten([
    '[',
    printCommaSeparatedNodes(print, node.types),
    ']',
  ]);
}

module.exports = printTupleTypeAnnotation;
