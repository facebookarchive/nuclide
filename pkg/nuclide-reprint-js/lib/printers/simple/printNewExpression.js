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
import type {NewExpression} from 'ast-types-flow';

const markers = require('../../constants/markers');
const printCommaSeparatedNodes = require('../common/printCommaSeparatedNodes');
const wrapExpression = require('../../wrappers/simple/wrapExpression');

function printNewExpression(print: Print, node: NewExpression): Lines {
  const wrap = x => wrapExpression(print, node, x);
  return wrap([
    'new',
    markers.noBreak,
    markers.space,
    print(node.callee),
    markers.noBreak,
    '(',
    printCommaSeparatedNodes(print, node.arguments),
    ')',
  ]);
}

module.exports = printNewExpression;
