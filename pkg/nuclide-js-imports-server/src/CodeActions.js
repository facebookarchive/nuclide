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

var _util;

function _load_util() {
  return _util = require('./utils/util');
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

const FLOW_DIAGNOSTIC_SOURCE = 'Flow';

class CodeActions {

  constructor(autoImportsManager, importFormatter) {
    this.autoImportsManager = autoImportsManager;
    this.importFormatter = importFormatter;
  }

  provideCodeActions(diagnostics, fileUri) {
    return (0, (_collection || _load_collection()).arrayFlatten)(diagnostics.map(diagnostic => diagnosticToCommands(this.autoImportsManager, this.importFormatter, diagnostic, fileUri)));
  }
}

exports.CodeActions = CodeActions;
function diagnosticToCommands(autoImportsManager, importFormatter, diagnostic, fileWithDiagnostic) {
  if (diagnostic.source === (_Diagnostics || _load_Diagnostics()).DIAGNOSTIC_SOURCE || diagnostic.source === FLOW_DIAGNOSTIC_SOURCE) {
    return (0, (_collection || _load_collection()).arrayFlatten)(autoImportsManager.getSuggestedImportsForRange(fileWithDiagnostic, diagnostic.range).filter(suggestedImport => {
      // For Flow's diagnostics, only fire for missing types (exact match)
      if (diagnostic.source === FLOW_DIAGNOSTIC_SOURCE) {
        const range = (0, (_util || _load_util()).babelLocationToAtomRange)(suggestedImport.symbol.location);
        const diagnosticRange = (0, (_util || _load_util()).lspRangeToAtomRange)(diagnostic.range);
        return range.isEqual(diagnosticRange);
      }
      return true;
    })
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