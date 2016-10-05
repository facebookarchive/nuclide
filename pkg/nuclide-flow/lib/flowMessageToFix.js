Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.default = flowMessageToFix;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _flowDiagnosticsCommon2;

function _flowDiagnosticsCommon() {
  return _flowDiagnosticsCommon2 = require('./flowDiagnosticsCommon');
}

function flowMessageToFix(diagnostic) {
  for (var extractionFunction of fixExtractionFunctions) {
    var fix = extractionFunction(diagnostic);
    if (fix != null) {
      return fix;
    }
  }

  return null;
}

var fixExtractionFunctions = [unusedSuppressionFix, namedImportTypo];

function unusedSuppressionFix(diagnostic) {
  // Automatically remove unused suppressions:
  if (diagnostic.messageComponents.length === 2 && diagnostic.messageComponents[0].descr === 'Error suppressing comment' && diagnostic.messageComponents[1].descr === 'Unused suppression') {
    var oldRange = (0, (_flowDiagnosticsCommon2 || _flowDiagnosticsCommon()).extractRange)(diagnostic.messageComponents[0]);
    (0, (_assert2 || _assert()).default)(oldRange != null);
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

  var firstComponent = diagnostic.messageComponents[0];
  var secondComponent = diagnostic.messageComponents[1];
  if (!/^Named import from module `[^`]*`$/.test(firstComponent.descr)) {
    return null;
  }

  var regex = /^This module has no named export called `([^`]*)`. Did you mean `([^`]*)`\?$/;
  var match = regex.exec(secondComponent.descr);
  if (match == null) {
    return null;
  }

  var oldText = match[1];
  var newText = match[2];
  var oldRange = (0, (_flowDiagnosticsCommon2 || _flowDiagnosticsCommon()).extractRange)(diagnostic.messageComponents[0]);
  (0, (_assert2 || _assert()).default)(oldRange != null);

  return {
    oldText: oldText,
    newText: newText,
    oldRange: oldRange,
    speculative: true
  };
}
module.exports = exports.default;