"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NullLanguageService = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

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
// An implementation of LanguageService which always returns no results.
// Useful for implementing aggregate language services.
class NullLanguageService {
  getDiagnostics(fileVersion) {
    return Promise.resolve(null);
  }

  observeDiagnostics() {
    return _RxMin.Observable.empty().publish();
  }

  getAutocompleteSuggestions(fileVersion, position, request) {
    return Promise.resolve(null);
  }

  resolveAutocompleteSuggestion(suggestion) {
    return Promise.resolve(null);
  }

  getDefinition(fileVersion, position) {
    return Promise.resolve(null);
  }

  onToggleCoverage(set) {
    return Promise.resolve(undefined);
  }

  findReferences(fileVersion, position) {
    return _RxMin.Observable.of(null).publish();
  }

  rename(fileVersion, position, newName) {
    return _RxMin.Observable.of(null).publish();
  }

  getCoverage(filePath) {
    return Promise.resolve(null);
  }

  getOutline(fileVersion) {
    return Promise.resolve(null);
  }

  getCodeLens(fileVersion) {
    return Promise.resolve(null);
  }

  resolveCodeLens(filePath, codeLens) {
    return Promise.resolve(null);
  }

  getAdditionalLogFiles(deadline) {
    return Promise.resolve([]);
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

  signatureHelp(fileVersion, position) {
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

  getExpandedSelectionRange(fileVersion, currentSelection) {
    return Promise.resolve(null);
  }

  getCollapsedSelectionRange(fileVersion, currentSelection, originalCursorPosition) {
    return Promise.resolve(null);
  }

  observeStatus(fileVersion) {
    return _RxMin.Observable.of({
      kind: 'null'
    }).publish();
  }

  async clickStatus(fileVersion, id, button) {}

  onWillSave(fileVersion) {
    return _RxMin.Observable.empty().publish();
  }

  async sendLspRequest(filePath, method, params) {}

  async sendLspNotification(filePath, method, params) {}

  observeLspNotifications(notificationMethod) {
    return _RxMin.Observable.empty().publish();
  }

  dispose() {}

} // Assert that NullLanguageService satisifes the LanguageService interface:


exports.NullLanguageService = NullLanguageService;
null;