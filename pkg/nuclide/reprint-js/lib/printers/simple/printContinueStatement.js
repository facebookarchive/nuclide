'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ContinueStatement} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

var markers = require('../../constants/markers');
var wrapStatement = require('../../wrappers/simple/wrapStatement');

function printContinueStatement(print: Print, node: ContinueStatement): Lines {
  const wrap = x => wrapStatement(print, node, x);

  let parts = ['continue'];
  if (node.label) {
    let label = node.label;
    parts = parts.concat([
      ':',
      markers.noBreak,
      markers.space,
      print(label),
    ]);
  }
  return wrap([
    parts,
    markers.noBreak,
    ';',
  ]);
}

module.exports = printContinueStatement;
