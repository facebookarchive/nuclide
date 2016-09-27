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

exports.convertReferences = convertReferences;

var _HackHelpers2;

function _HackHelpers() {
  return _HackHelpers2 = require('./HackHelpers');
}

function convertReferences(hackResult, projectRoot) {

  var symbolName = hackResult[0].name;
  // Strip off the global namespace indicator.
  if (symbolName.startsWith('\\')) {
    symbolName = symbolName.slice(1);
  }

  // Process this into the format nuclide-find-references expects.
  var references = hackResult.map(function (ref) {
    return {
      uri: ref.filename,
      name: null, // TODO(hansonw): Get the caller when it's available
      range: (0, (_HackHelpers2 || _HackHelpers()).hackRangeToAtomRange)(ref)
    };
  });

  return {
    type: 'data',
    baseUri: projectRoot,
    referencedSymbolName: symbolName,
    references: references
  };
}