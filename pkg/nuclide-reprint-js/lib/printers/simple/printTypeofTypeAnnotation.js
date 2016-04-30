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
import type {TypeofTypeAnnotation} from 'ast-types-flow';

import flatten from '../../utils/flatten';
import markers from '../../constants/markers';

function printTypeofTypeAnnotation(
  print: Print,
  node: TypeofTypeAnnotation,
): Lines {
  return flatten([
    'typeof',
    markers.noBreak,
    markers.space,
    print(node.argument),
  ]);
}

module.exports = printTypeofTypeAnnotation;
