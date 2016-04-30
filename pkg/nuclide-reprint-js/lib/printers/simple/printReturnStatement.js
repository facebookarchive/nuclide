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
import type {ReturnStatement} from 'ast-types-flow';

import markers from '../../constants/markers';
import wrapStatement from '../../wrappers/simple/wrapStatement';

function printReturnStatement(print: Print, node: ReturnStatement): Lines {
  const wrap = x => wrapStatement(print, node, x);

  let parts = ['return'];
  if (node.argument) {
    const argument = node.argument;
    parts = parts.concat([
      markers.space,
      print(argument),
    ]);
  }
  return wrap([
    parts,
    markers.noBreak,
    ';',
  ]);
}

module.exports = printReturnStatement;
