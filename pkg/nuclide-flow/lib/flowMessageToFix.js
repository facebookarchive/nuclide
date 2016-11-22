'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = flowMessageToFix;

var _flowDiagnosticsCommon;

function _load_flowDiagnosticsCommon() {
  return _flowDiagnosticsCommon = require('./flowDiagnosticsCommon');
}

function flowMessageToFix(diagnostic) {
  for (const extractionFunction of fixExtractionFunctions) {
    const fix = extractionFunction(diagnostic);
    if (fix != null) {
      return fix;
    }
  }

  return null;
}

const fixExtractionFunctions = [unusedSuppressionFix, namedImportTypo];

function unusedSuppressionFix(diagnostic) {
  // Automatically remove unused suppressions:
  if (diagnostic.messageComponents.length === 2 && diagnostic.messageComponents[0].descr === 'Error suppressing comment' && diagnostic.messageComponents[1].descr === 'Unused suppression') {
    const oldRange = (0, (_flowDiagnosticsCommon || _load_flowDiagnosticsCommon()).extractRange)(diagnostic.messageComponents[0]);

    if (!(oldRange != null)) {
      throw new Error('Invariant violation: "oldRange != null"');
    }

    return {
      newText: '',
      oldRange: oldRange,
      speculative: true
    };
  }

  return null;
}

function namedImportTypo(diagnostic) {
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
  const oldRange = (0, (_flowDiagnosticsCommon || _load_flowDiagnosticsCommon()).extractRange)(diagnostic.messageComponents[0]);

  if (!(oldRange != null)) {
    throw new Error('Invariant violation: "oldRange != null"');
  }

  return {
    oldText: oldText,
    newText: newText,
    oldRange: oldRange,
    speculative: true
  };
}
module.exports = exports['default'];