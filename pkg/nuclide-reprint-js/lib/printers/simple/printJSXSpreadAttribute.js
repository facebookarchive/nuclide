'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {JSXSpreadAttribute} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import flatten from '../../utils/flatten';
import markers from '../../constants/markers';

function printJSXSpreadAttribute(
  print: Print,
  node: JSXSpreadAttribute,
): Lines {
  return flatten([
    '{...',
    markers.noBreak,
    print(node.argument),
    markers.noBreak,
    '}',
  ]);
}

module.exports = printJSXSpreadAttribute;
