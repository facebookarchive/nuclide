'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Fix} from '../../nuclide-diagnostics-common/lib/rpc-types';
import type {Diagnostic} from '../../nuclide-flow-rpc';

import invariant from 'assert';
import {extractRange} from './flowDiagnosticsCommon';

export default function flowMessageToFix(diagnostic: Diagnostic): ?Fix {
  for (const extractionFunction of fixExtractionFunctions) {
    const fix = extractionFunction(diagnostic);
    if (fix != null) {
      return fix;
    }
  }

  return null;
}

const fixExtractionFunctions: Array<(diagnostic: Diagnostic) => ?Fix> = [
  unusedSuppressionFix,
  namedImportTypo,
];

function unusedSuppressionFix(diagnostic: Diagnostic): ?Fix {
  // Automatically remove unused suppressions:
  if (diagnostic.messageComponents.length === 2 &&
      diagnostic.messageComponents[0].descr === 'Error suppressing comment' &&
      diagnostic.messageComponents[1].descr === 'Unused suppression') {
    const oldRange = extractRange(diagnostic.messageComponents[0]);
    invariant(oldRange != null);
    return {
      newText: '',
      oldRange,
      speculative: true,
    };
  }

  return null;
}

function namedImportTypo(diagnostic: Diagnostic): ?Fix {
  if (diagnostic.messageComponents.length !== 2) {
    return null;
  }

  const firstComponent = diagnostic.messageComponents[0];
  const secondComponent = diagnostic.messageComponents[1];
  if (!/^Named import from module `[^`]*`$/.test(firstComponent.descr)) {
    return null;
  }

  const regex = /^This module has no named export called `([^`]*)`. Did you mean `([^`]*)`\?$/;
  const match = regex.exec(secondComponent.descr);
  if (match == null) {
    return null;
  }

  const oldText = match[1];
  const newText = match[2];
  const oldRange = extractRange(diagnostic.messageComponents[0]);
  invariant(oldRange != null);

  return {
    oldText,
    newText,
    oldRange,
    speculative: true,
  };
}
