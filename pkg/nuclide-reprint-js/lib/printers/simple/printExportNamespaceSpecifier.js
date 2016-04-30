'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ExportNamespaceSpecifier} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import flatten from '../../utils/flatten';
import markers from '../../constants/markers';

function printExportNamespaceSpecifier(
  print: Print,
  node: ExportNamespaceSpecifier,
): Lines {
  return flatten([
    '*',
    markers.space,
    'as',
    markers.noBreak,
    markers.space,
    print(node.exported),
  ]);
}

module.exports = printExportNamespaceSpecifier;
