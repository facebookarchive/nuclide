'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {EmptyStatement} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import wrapStatement from '../../wrappers/simple/wrapStatement';

function printEmptyStatement(print: Print, node: EmptyStatement): Lines {
  const wrap = x => wrapStatement(print, node, x);
  return wrap([';']);
}

module.exports = printEmptyStatement;
