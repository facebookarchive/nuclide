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
  return _collection = require('../../../modules/nuclide-commons/collection');
}

var _Diagnostics;

function _load_Diagnostics() {
  return _Diagnostics = require('./Diagnostics');
}

var _util;

function _load_util() {
  return _util = require('./utils/util');
}

var _lspUtils;

function _load_lspUtils() {
  return _lspUtils = require('../../nuclide-lsp-implementation-common/lsp-utils');
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

const CODE_ACTIONS_LIMIT = 10;
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
        if (suggestedImport.symbol.type !== 'type') {
          return false;
        }
        const range = (0, (_util || _load_util()).babelLocationToAtomRange)(suggestedImport.symbol.location);
        const diagnosticRange = (0, (_lspUtils || _load_lspUtils()).lspRangeToAtomRange)(diagnostic.range);
        return range.isEqual(diagnosticRange);
      }
      // Otherwise this has to be a value import.
      return suggestedImport.symbol.type === 'value';
    })
    // Create a CodeAction for each file with an export.
    .map(missingImport => missingImport.filesWithExport.map(jsExport => Object.assign({}, jsExport, {
      // Force this to be imported as a type/value depending on the context.
      isTypeExport: missingImport.symbol.type === 'type'
    })))).map(fileWithExport => ({
      fileWithExport,
      importPath: importFormatter.formatImportFile(fileWithDiagnostic, fileWithExport)
    })).sort((a, b) => (0, (_util || _load_util()).compareForSuggestion)(a.importPath, b.importPath)).slice(0, CODE_ACTIONS_LIMIT).map(({ fileWithExport, importPath }) => {
      const addImportArgs = [fileWithExport, fileWithDiagnostic];
      let verb;
      if (fileWithExport.isTypeExport) {
        verb = 'Import type';
      } else if (importFormatter.useRequire) {
        verb = 'Require';
      } else {
        verb = 'Import';
      }
      return {
        title: `${verb} from ${importPath}`,
        command: 'addImport',
        arguments: addImportArgs
      };
    });
  }
  return [];
}