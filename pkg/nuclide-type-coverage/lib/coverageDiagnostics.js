'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.diagnosticProviderForResultStream = diagnosticProviderForResultStream;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

function diagnosticProviderForResultStream(results, isEnabledStream) {
  const toggledResults = (0, (_observable || _load_observable()).toggle)(results, isEnabledStream);

  return {
    updates: (0, (_observable || _load_observable()).compact)(toggledResults.map(diagnosticsForResult)),
    invalidations: _rxjsBundlesRxMinJs.Observable.merge(
    // Invalidate diagnostics when display is disabled
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
    })).mapTo({ scope: 'all' })
  };
}

/**
 * Preconditions:
 *   result.editor.getPath() != null
 *
 * This is reasonable because we only query providers when there is a path available for the current
 * text editor.
 */
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
    throw new Error('Invariant violation: "editorPath != null"');
  }

  const providerName = result.provider.displayName;

  const diagnostics = value.uncoveredRegions.map(region => uncoveredRangeToDiagnostic(region, editorPath, providerName));

  return {
    filePathToMessages: new Map([[editorPath, diagnostics]])
  };
}

function uncoveredRangeToDiagnostic(region, path, providerName) {
  const text = region.message != null ? region.message : `Not covered by ${providerName}`;
  return {
    scope: 'file',
    providerName: 'Type Coverage',
    type: 'Warning',
    filePath: path,
    range: region.range,
    text
  };
}