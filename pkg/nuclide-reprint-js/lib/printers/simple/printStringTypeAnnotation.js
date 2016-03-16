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
import type {StringTypeAnnotation} from 'ast-types-flow';

function printStringTypeAnnotation(
  print: Print,
  node: StringTypeAnnotation,
): Lines {
  return ['string'];
}

module.exports = printStringTypeAnnotation;
