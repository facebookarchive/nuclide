'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CodeActions = undefined;

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

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _Diagnostics;

function _load_Diagnostics() {
  return _Diagnostics = require('./Diagnostics');
}

class CodeActions {

  constructor(autoImportsManager, importFormatter) {
    this.autoImportsManager = autoImportsManager;
    this.importFormatter = importFormatter;
  }

  provideCodeActions(diagnostics, fileUri) {
    return (0, (_collection || _load_collection()).arrayFlatten)(diagnostics.map(diagnostic => diagnosticToCommands(this.autoImportsManager, this.importFormatter, diagnostic, fileUri)));
  }
}

exports.CodeActions = CodeActions; /**
                                    * Copyright (c) 2015-present, Facebook, Inc.
                                    * All rights reserved.
                                    *
                                    * This source code is licensed under the license found in the LICENSE file in
                                    * the root directory of this source tree.
                                    *
                                    * 
                                    * @format
                                    */

function diagnosticToCommands(autoImportsManager, importFormatter, diagnostic, fileWithDiagnostic) {
  // For now, only offer CodeActions for this server's Diagnostics. In the future,
  // we can provide CodeActions for Flow or the Linter.
  if (diagnostic.source === (_Diagnostics || _load_Diagnostics()).DIAGNOSTIC_SOURCE) {
    return (0, (_collection || _load_collection()).arrayFlatten)(autoImportsManager.getSuggestedImportsForRange(fileWithDiagnostic, diagnostic.range)
    // Create a CodeAction for each file with an export.
    .map(missingImport => missingImport.filesWithExport.map(fileWithExport => {
      const addImportArgs = [missingImport.symbol.id, fileWithExport, fileWithDiagnostic];
      return {
        title: `Import from ${importFormatter.formatImportFile(fileWithDiagnostic, fileWithExport)}`,
        command: 'addImport',
        arguments: addImportArgs
      };
    })));
  }
  return [];
}