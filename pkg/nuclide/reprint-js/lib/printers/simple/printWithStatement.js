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
import type {WithStatement} from 'ast-types-flow';

var markers = require('../../constants/markers');
var wrapStatement = require('../../wrappers/simple/wrapStatement');

function printWithStatement(print: Print, node: WithStatement): Lines {
  const wrap = x => wrapStatement(print, node, x);
  return wrap([
    markers.hardBreak,
    'with (',
    markers.openScope,
    markers.scopeIndent,
    markers.scopeBreak,
    print(node.object),
    markers.scopeBreak,
    markers.scopeDedent,
    markers.closeScope,
    ')',
    markers.space,
    print(node.body),
  ]);
}

module.exports = printWithStatement;
