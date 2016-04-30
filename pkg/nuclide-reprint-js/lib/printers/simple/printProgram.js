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
import type {Program} from 'ast-types-flow';

import flatten from '../../utils/flatten';
import printArrayOfStatements from '../common/printArrayOfStatements';
import printComments from '../common/printComments';

function printProgram(print: Print, node: Program): Lines {
  return flatten([
    printComments(node.innerComments),
    printArrayOfStatements(print, node.body),
  ]);
}

module.exports = printProgram;
