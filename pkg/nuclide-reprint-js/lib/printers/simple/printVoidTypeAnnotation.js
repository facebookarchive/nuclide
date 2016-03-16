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
import type {VoidTypeAnnotation} from 'ast-types-flow';

function printVoidTypeAnnotation(
  print: Print,
  node: VoidTypeAnnotation,
): Lines {
  return ['void'];
}

module.exports = printVoidTypeAnnotation;
