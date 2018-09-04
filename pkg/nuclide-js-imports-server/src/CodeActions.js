"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CodeActions = void 0;

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

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _Diagnostics() {
  const data = require("./Diagnostics");

  _Diagnostics = function () {
    return data;
  };

  return data;
}

function _util() {
  const data = require("./utils/util");

  _util = function () {
    return data;
  };

  return data;
}

function _lspUtils() {
  const data = require("../../nuclide-lsp-implementation-common/lsp-utils");

  _lspUtils = function () {
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
const CODE_ACTIONS_LIMIT = 10;
const FLOW_DIAGNOSTIC_SOURCES = ['Flow', 'Flow: InferError'];

class CodeActions {
  constructor(autoImportsManager, importFormatter) {
    this.autoImportsManager = autoImportsManager;
    this.importFormatter = importFormatter;
  }

  provideCodeActions(diagnostics, fileUri) {
    return (0, _collection().arrayFlatten)(diagnostics.map(diagnostic => diagnosticToCommands(this.autoImportsManager, this.importFormatter, diagnostic, fileUri)));
  }

}

exports.CodeActions = CodeActions;

function diagnosticToCommands(autoImportsManager, importFormatter, diagnostic, fileWithDiagnostic) {
  if (diagnostic.source === _Diagnostics().DIAGNOSTIC_SOURCE || FLOW_DIAGNOSTIC_SOURCES.includes(diagnostic.source)) {
    return (0, _collection().arrayFlatten)(autoImportsManager.getSuggestedImportsForRange(fileWithDiagnostic, diagnostic.range).filter(suggestedImport => {
      // For Flow's diagnostics, only fire for missing types (exact match)
      if (FLOW_DIAGNOSTIC_SOURCES.includes(diagnostic.source)) {
        if (suggestedImport.symbol.type !== 'type') {
          return false;
        }

        const range = (0, _util().babelLocationToAtomRange)(suggestedImport.symbol.location);
        const diagnosticRange = (0, _lspUtils().lspRangeToAtomRange)(diagnostic.range);
        return range.isEqual(diagnosticRange);
      } // Otherwise this has to be a value import.


      return suggestedImport.symbol.type === 'value';
    }) // Create a CodeAction for each file with an export.
    .map(missingImport => missingImport.filesWithExport.map(jsExport => Object.assign({}, jsExport, {
      // Force this to be imported as a type/value depending on the context.
      isTypeExport: missingImport.symbol.type === 'type'
    })))).map(fileWithExport => ({
      fileWithExport,
      importPath: importFormatter.formatImportFile(fileWithDiagnostic, fileWithExport)
    })).sort((a, b) => (0, _util().compareForSuggestion)(a.importPath, b.importPath)).slice(0, CODE_ACTIONS_LIMIT).map(({
      fileWithExport,
      importPath
    }) => {
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