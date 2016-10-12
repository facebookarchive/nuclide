'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideEvaluationExpression} from '../../nuclide-debugger-interfaces/rpc-types';

import {wordAtPosition} from '../../commons-atom/range';
import {JAVASCRIPT_IDENTIFIER_REGEX} from './constants';

export class FlowEvaluationExpressionProvider {

  getEvaluationExpression(
    editor: atom$TextEditor,
    position: atom$Point,
  ): Promise<?NuclideEvaluationExpression> {
    // TODO: Replace RegExp with AST-based, more accurate approach.
    const extractedIdentifier = wordAtPosition(
      editor,
      position,
      JAVASCRIPT_IDENTIFIER_REGEX,
    );
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
