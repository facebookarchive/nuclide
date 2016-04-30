'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DebuggerStatement} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import wrapStatement from '../../wrappers/simple/wrapStatement';

function printDebuggerStatement(print: Print, node: DebuggerStatement): Lines {
  const wrap = x => wrapStatement(print, node, x);
  return wrap(['debugger;']);
}

module.exports = printDebuggerStatement;
