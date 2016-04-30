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
import type {TryStatement} from 'ast-types-flow';

import markers from '../../constants/markers';
import wrapStatement from '../../wrappers/simple/wrapStatement';

function printTryStatement(print: Print, node: TryStatement): Lines {
  const wrap = x => wrapStatement(print, node, x);

  let parts = [
    markers.hardBreak,
    'try',
    markers.noBreak,
    markers.space,
    print(node.block),
  ];

  if (node.handler) {
    const handler = node.handler;
    parts = parts.concat([
      markers.noBreak,
      markers.space,
      print(handler),
    ]);
  }

  if (node.finalizer) {
    const finalizer = node.finalizer;
    parts = parts.concat([
      markers.noBreak,
      markers.space,
      'finally',
      markers.noBreak,
      markers.space,
      print(finalizer),
    ]);
  }

  return wrap(parts);
}

module.exports = printTryStatement;
