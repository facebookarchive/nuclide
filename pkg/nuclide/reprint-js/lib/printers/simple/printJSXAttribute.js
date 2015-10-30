'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {JSXAttribute} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

var flatten = require('../../utils/flatten');
var markers = require('../../constants/markers');

function printJSXAttribute(print: Print, node: JSXAttribute): Lines {
  return flatten([
    print(node.name),
    node.value
      ? [markers.noBreak, '=', markers.noBreak, print(node.value)]
      : markers.empty,
  ]);
}

module.exports = printJSXAttribute;
