"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Diagnostics = exports.DIAGNOSTIC_SOURCE = void 0;

function _vscodeLanguageserver() {
  const data = require("vscode-languageserver");

  _vscodeLanguageserver = function () {
    return data;
  };

  return data;
}

function _AutoImportsManager() {
  const data = require("./lib/AutoImportsManager");

  _AutoImportsManager = function () {
    return data;
  };

  return data;
}

function _ImportFormatter() {
  const data = require("./lib/ImportFormatter");

  _ImportFormatter = function () {
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
const DIAGNOSTIC_SOURCE = 'JS Auto-imports';
exports.DIAGNOSTIC_SOURCE = DIAGNOSTIC_SOURCE;

class Diagnostics {
  constructor(autoImportsManager, importFormatter) {
    this.autoImportsManager = autoImportsManager;
    this.importFormatter = importFormatter;
  }

  findDiagnosticsForFile(text, uri) {
    // Note: Don't return diagnostics for types.
    // It's too hard to match Flow's knowledge of types, particularly flow libs & flow builtins.
    // Instead, we'll rely on returning code actions for Flow's diagnostics.
    // (Of course, this is a much slower user experience, but being wrong is even worse.)
    return this.autoImportsManager.findMissingImports(uri, text).filter(missingImport => missingImport.symbol.type === 'value').map(missingImport => missingImportToDiagnostic(this.importFormatter, missingImport, uri));
  }

}

exports.Diagnostics = Diagnostics;

function missingImportToDiagnostic(importFormatter, importSuggestion, uri) {
  const {
    symbol
  } = importSuggestion;
  return {
    severity: _vscodeLanguageserver().DiagnosticSeverity.Information,
    range: {
      start: {
        character: symbol.location.start.col,
        line: symbol.location.start.line - 1
      },
      end: {
        character: symbol.location.end.col,
        line: symbol.location.end.line - 1
      }
    },
    message: `The ${symbol.type} ${symbol.id} is not imported.\n` + 'Select a suggestion from the text editor.',
    source: DIAGNOSTIC_SOURCE
  };
}