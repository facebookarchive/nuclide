'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AnyTypeAnnotation} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

function printAnyTypeAnnotation(print: Print, node: AnyTypeAnnotation): Lines {
  return ['any'];
}

module.exports = printAnyTypeAnnotation;
