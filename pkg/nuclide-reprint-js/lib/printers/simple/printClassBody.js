'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ClassBody} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import flatten from '../../utils/flatten';
import markers from '../../constants/markers';
import printArrayOfStatements from '../common/printArrayOfStatements';
import printComments from '../common/printComments';

function printClassBody(print: Print, node: ClassBody): Lines {
  // Can't put extra new lines in here like BlockStatement since it may be
  // used in a ClassExpression.
  return flatten([
    '{',
    // We want to override the extra space within the first node of a class
    // body, so we do one hard break and then throw in a no break. The empty
    // string is necessary to reset the run of markers.
    markers.hardBreak,
    markers.indent,
    '',
    markers.noBreak,
    printComments(node.innerComments),
    printArrayOfStatements(print, node.body),
    markers.dedent,
    markers.hardBreak,
    '}',
  ]);
}

module.exports = printClassBody;
