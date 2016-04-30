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

import flatten from '../../utils/flatten';
import markers from '../../constants/markers';

function wrapStatement(print: Print, node: any, lines: Lines): Lines {
  return flatten([
    lines,
    markers.hardBreak,
  ]);
}

module.exports = wrapStatement;
