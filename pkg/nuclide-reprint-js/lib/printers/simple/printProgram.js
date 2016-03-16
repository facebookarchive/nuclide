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

const flatten = require('../../utils/flatten');
const printArrayOfStatements = require('../common/printArrayOfStatements');
const printComments = require('../common/printComments');

function printProgram(print: Print, node: Program): Lines {
  return flatten([
    printComments(node.innerComments),
    printArrayOfStatements(print, node.body),
  ]);
}

module.exports = printProgram;
