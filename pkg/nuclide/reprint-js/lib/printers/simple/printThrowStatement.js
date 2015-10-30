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
import type {ThrowStatement} from 'ast-types-flow';

var markers = require('../../constants/markers');
var wrapStatement = require('../../wrappers/simple/wrapStatement');

function printThrowStatement(print: Print, node: ThrowStatement): Lines {
  const wrap = x => wrapStatement(print, node, x);
  return wrap([
    'throw',
    print(node.argument),
    markers.noBreak,
    ';',
  ]);
}

module.exports = printThrowStatement;
