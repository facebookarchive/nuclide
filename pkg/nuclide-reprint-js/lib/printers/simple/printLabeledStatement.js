'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {LabeledStatement} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import markers from '../../constants/markers';
import wrapStatement from '../../wrappers/simple/wrapStatement';

function printLabeledStatement(print: Print, node: LabeledStatement): Lines {
  const wrap = x => wrapStatement(print, node, x);
  return wrap([
    print(node.label),
    ':',
    markers.space,
    print(node.body),
  ]);
}

module.exports = printLabeledStatement;
