'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {CatchClause} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import flatten from '../../utils/flatten';
import markers from '../../constants/markers';

function printCatchClause(print: Print, node: CatchClause): Lines {
  return flatten([
    'catch (',
    markers.openScope,
    markers.scopeIndent,
    markers.scopeBreak,
    print(node.param),
    markers.scopeBreak,
    markers.scopeDedent,
    markers.closeScope,
    ')',
    markers.noBreak,
    markers.space,
    print(node.body),
  ]);
}

module.exports = printCatchClause;
