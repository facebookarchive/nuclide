'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Diagnostics = exports.DIAGNOSTIC_SOURCE = undefined;

var _vscodeLanguageserver;

function _load_vscodeLanguageserver() {
  return _vscodeLanguageserver = require('vscode-languageserver');
}

var _AutoImportsManager;

function _load_AutoImportsManager() {
  return _AutoImportsManager = require('./lib/AutoImportsManager');
}

var _ImportFormatter;

function _load_ImportFormatter() {
  return _ImportFormatter = require('./lib/ImportFormatter');
}

const DIAGNOSTIC_SOURCE = exports.DIAGNOSTIC_SOURCE = 'JS Auto-imports'; /**
                                                                          * Copyright (c) 2015-present, Facebook, Inc.
                                                                          * All rights reserved.
                                                                          *
                                                                          * This source code is licensed under the license found in the LICENSE file in
                                                                          * the root directory of this source tree.
                                                                          *
                                                                          * 
                                                                          * @format
                                                                          */

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
  const { symbol } = importSuggestion;
  return {
    severity: (_vscodeLanguageserver || _load_vscodeLanguageserver()).DiagnosticSeverity.Information,
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
    message: `The ${symbol.type} ${symbol.id} is not imported.`,
    source: DIAGNOSTIC_SOURCE
  };
}