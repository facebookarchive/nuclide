'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ForStatement} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import markers from '../../constants/markers';
import wrapStatement from '../../wrappers/simple/wrapStatement';

function printForStatement(print: Print, node: ForStatement): Lines {
  const wrap = x => wrapStatement(print, node, x);

  let parts = [
    markers.hardBreak,
    'for (',
    markers.openScope,
    markers.scopeIndent,
  ];
  parts.push(markers.scopeBreak);
  if (node.init) {
    const init = node.init;
    parts.push(print(init));
  }
  parts.push(';');
  parts.push(markers.scopeBreak);
  if (node.test) {
    const test = node.test;
    parts = parts.concat([
      markers.space,
      print(test),
    ]);
  }
  parts.push(';');
  parts.push(markers.scopeBreak);
  if (node.update) {
    const update = node.update;
    parts = parts.concat([
      markers.space,
      print(update),
    ]);
    // We only need an additional one if there was an update, otherwise we
    // just ended with a scopeBreak.
    parts.push(markers.scopeBreak);
  }
  parts = parts.concat([
    markers.scopeDedent,
    markers.closeScope,
    ')',
    markers.space,
    print(node.body),
  ]);
  return wrap(parts);
}

module.exports = printForStatement;
