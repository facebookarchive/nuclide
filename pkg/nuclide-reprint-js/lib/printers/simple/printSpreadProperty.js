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
import type {SpreadProperty} from 'ast-types-flow';

import flatten from '../../utils/flatten';
import markers from '../../constants/markers';

function printSpreadProperty(print: Print, node: SpreadProperty): Lines {
  return flatten([
    '...',
    markers.noBreak,
    print(node.argument),
  ]);
}

module.exports = printSpreadProperty;
