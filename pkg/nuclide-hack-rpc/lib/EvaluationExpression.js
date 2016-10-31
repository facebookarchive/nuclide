'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {NuclideEvaluationExpression} from '../../nuclide-debugger-interfaces/rpc-types';

import {wordAtPositionFromBuffer} from '../../commons-node/range';
import {HACK_WORD_REGEX} from './HackHelpers';

export function getEvaluationExpression(
  filePath: NuclideUri,
  buffer: simpleTextBuffer$TextBuffer,
  position: atom$Point,
): ?NuclideEvaluationExpression {
  // TODO: Replace RegExp with AST-based, more accurate approach.
  const extractedIdentifier = wordAtPositionFromBuffer(buffer, position, HACK_WORD_REGEX);
  if (extractedIdentifier == null) {
    return null;
  }
  const {
    range,
    wordMatch,
  } = extractedIdentifier;
  const [expression] = wordMatch;
  if (expression == null) {
    return null;
  }
  return {
    expression,
    range,
  };
}
