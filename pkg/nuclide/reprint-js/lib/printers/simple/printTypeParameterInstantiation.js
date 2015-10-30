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
import type {TypeParameterInstantiation} from 'ast-types-flow';

var flatten = require('../../utils/flatten');
var printCommaSeparatedNodes = require('../common/printCommaSeparatedNodes');

function printTypeParameterInstantiation(
  print: Print,
  node: TypeParameterInstantiation,
): Lines {
  return flatten([
    '<',
    printCommaSeparatedNodes(print, node.params),
    '>',
  ]);
}

module.exports = printTypeParameterInstantiation;
