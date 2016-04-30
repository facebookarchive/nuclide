'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ExportDefaultDeclaration} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import flatten from '../../utils/flatten';
import markers from '../../constants/markers';

function printExportDefaultDeclaration(
  print: Print,
  node: ExportDefaultDeclaration,
): Lines {
  return flatten([
    'export',
    markers.space,
    'default',
    markers.noBreak,
    markers.space,
    print(node.declaration),
    markers.noBreak,
    ';',
    markers.hardBreak,
  ]);
}

module.exports = printExportDefaultDeclaration;
