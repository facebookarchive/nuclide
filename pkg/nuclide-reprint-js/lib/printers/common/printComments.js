'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Lines} from '../../types/common';

import flatten from '../../utils/flatten';
import printComment from './printComment';

function printComments(nodes: ?Array<any>): Lines {
  if (!Array.isArray(nodes)) {
    return [];
  }
  return flatten(nodes.map(n => printComment(n)));
}

module.exports = printComments;
