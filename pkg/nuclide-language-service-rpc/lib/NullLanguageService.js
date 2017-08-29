'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NullLanguageService = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

// An implementation of LanguageService which always returns no results.
// Useful for implementing aggregate language services.
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

class NullLanguageService {
  getDiagnostics(fileVersion) {
    return Promise.resolve(null);
  }

  observeDiagnostics() {
    return _rxjsBundlesRxMinJs.Observable.empty().publish();
  }

  getAutocompleteSuggestions(fileVersion, position, request) {
    return Promise.resolve(null);
  }

  getDefinition(fileVersion, position) {
    return Promise.resolve(null);
  }

  findReferences(fileVersion, position) {
    return Promise.resolve(null);
  }

  getCoverage(filePath) {
    return Promise.resolve(null);
  }

  getOutline(fileVersion) {
    return Promise.resolve(null);
  }

  getCodeActions(fileVersion, range, diagnostics) {
    return Promise.resolve([]);
  }

  typeHint(fileVersion, position) {
    return Promise.resolve(null);
  }

  highlight(fileVersion, position) {
    return Promise.resolve(null);
  }

  formatSource(fileVersion, range, options) {
    return Promise.resolve(null);
  }

  formatEntireFile(fileVersion, range, options) {
    return Promise.resolve(null);
  }

  formatAtPosition(fileVersion, position, triggerCharacter, options) {
    return Promise.resolve(null);
  }

  getEvaluationExpression(fileVersion, position) {
    return Promise.resolve(null);
  }

  supportsSymbolSearch(directories) {
    return Promise.resolve(false);
  }

  symbolSearch(query, directories) {
    return Promise.resolve(null);
  }

  getProjectRoot(fileUri) {
    return Promise.resolve(null);
  }

  isFileInProject(fileUri) {
    return Promise.resolve(false);
  }

  dispose() {}
}

exports.NullLanguageService = NullLanguageService; // Assert that NullLanguageService satisifes the LanguageService interface:

null;