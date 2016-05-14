'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideEvaluationExpression} from '../../nuclide-debugger-interfaces/service';

import wordAtPosition from '../../commons-atom/word-at-position';

// A heuristic for named variables in Hack.
// TODO: Replace RegExp with AST-based, more accurate approach.
const HACK_IDENTIFIER_REGEXP = /\$\w+/gi;

export class HackEvaluationExpressionProvider {

  getEvaluationExpression(
    editor: atom$TextEditor,
    position: atom$Point,
  ): Promise<?NuclideEvaluationExpression> {
    const extractedIdentifier = wordAtPosition(editor, position, HACK_IDENTIFIER_REGEXP);
    if (extractedIdentifier == null) {
      return Promise.resolve(null);
    }
    const {
      range,
      wordMatch,
    } = extractedIdentifier;
    const [expression] = wordMatch;
    if (expression == null) {
      return Promise.resolve(null);
    }
    return Promise.resolve({
      expression,
      range,
    });
  }
}
