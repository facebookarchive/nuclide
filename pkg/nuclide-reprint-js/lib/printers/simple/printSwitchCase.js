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
import type {SwitchCase} from 'ast-types-flow';

import flatten from '../../utils/flatten';
import markers from '../../constants/markers';

function printSwitchCase(print: Print, node: SwitchCase): Lines {
  const consequentParts = flatten(node.consequent.map(
    nodePart => print(nodePart),
  ));
  if (node.consequent.length > 0) {
    // We want a new line separating cases if they had a consequent.
    consequentParts.push(markers.multiHardBreak);
    consequentParts.push(markers.multiHardBreak);
  }
  if (!node.test) {
    return flatten([
      'default:',
      markers.hardBreak,
      markers.indent,
      consequentParts,
      markers.dedent,
    ]);
  } else {
    const test = node.test;
    return flatten([
      'case',
      markers.space,
      print(test),
      ':',
      markers.hardBreak,
      markers.indent,
      consequentParts,
      markers.dedent,
    ]);
  }
}

module.exports = printSwitchCase;
