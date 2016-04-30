'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ExportDefaultSpecifier} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import flatten from '../../utils/flatten';

function printExportDefaultSpecifier(
  print: Print,
  node: ExportDefaultSpecifier,
): Lines {
  return flatten(print(node.exported));
}

module.exports = printExportDefaultSpecifier;
