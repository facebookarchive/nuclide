"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.diagnosticProviderForResultStream = diagnosticProviderForResultStream;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _observable() {
  const data = require("../../../modules/nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
function diagnosticProviderForResultStream(results, isEnabledStream) {
  const toggledResults = results.let((0, _observable().toggle)(isEnabledStream));
  return {
    updates: (0, _observable().compact)(toggledResults.map(diagnosticsForResult)),
    invalidations: _RxMin.Observable.merge( // Invalidate diagnostics when display is disabled
    isEnabledStream.filter(enabled => !enabled), toggledResults.filter(result => {
      switch (result.kind) {
        case 'not-text-editor':
        case 'no-provider':
        case 'provider-error':
        case 'pane-change':
          return true;

        case 'result':
          return result.result == null;

        default:
          return false;
      }
    })).mapTo({
      scope: 'all'
    })
  };
}
/**
 * Preconditions:
 *   result.editor.getPath() != null
 *
 * This is reasonable because we only query providers when there is a path available for the current
 * text editor.
 */


function diagnosticsForResult(result) {
  if (result.kind !== 'result') {
    return null;
  }

  const value = result.result;

  if (value == null) {
    return null;
  }

  const editorPath = result.editor.getPath();

  if (!(editorPath != null)) {
    throw new Error("Invariant violation: \"editorPath != null\"");
  }

  const providerName = result.provider.displayName;
  const diagnostics = value.uncoveredRegions.map(region => uncoveredRangeToDiagnostic(region, editorPath, providerName));
  return new Map([[editorPath, diagnostics]]);
}

function uncoveredRangeToDiagnostic(region, path, providerName) {
  const text = region.message != null ? region.message : `Not covered by ${providerName}`;
  return {
    providerName: 'Type Coverage',
    type: 'Info',
    filePath: path,
    range: region.range,
    text
  };
}