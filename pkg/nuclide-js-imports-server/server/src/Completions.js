'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Completions = undefined;
exports.getImportInformation = getImportInformation;

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

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const MAX_RESULTS = 200; /**
                          * Copyright (c) 2015-present, Facebook, Inc.
                          * All rights reserved.
                          *
                          * This source code is licensed under the license found in the LICENSE file in
                          * the root directory of this source tree.
                          *
                          * 
                          * @format
                          */

const INCOMPLETE_IMPORT_REGEX = {
  namedType: /^\s*import\s+type\s+{\s*([$\w]+)$/,
  namedValue: /^\s*import\s+{\s*([$\w\s,]+)$/,
  defaultType: /^\s*import\s+type\s+([$\w]+)$/,
  defaultValue: /^\s*import\s+([$\w]+)$/,
  requireImport: /^const\s+([$\w]+)$/,
  requireDestructured: /^const\s+{\s*([$\w]+)$/
};

const IMPORT_STATEMENT_REGEXES = {
  namedType: /^\s*import\s+type\s+{\s*([$\w\s,]+)\s*}\s*(.*)/,
  namedValue: /^\s*import\s+{\s*([$\w\s,]+)\s*}\s*(.*)/,
  defaultType: /^\s*import\s+type\s+([$\w]+)\s+(.*)/,
  defaultValue: /^\s*import\s+([$\w]+)\s+(.*)/,
  requireImport: /^const\s+([$\w]+)\s+(.*)/,
  requireDestructured: /^const\s+{\s*([$\w\s,]+)\s*}\s*(.*)/
};

class Completions {

  constructor(documents, autoImportsManager, importsFormatter, isHaste) {
    this.documents = documents;
    this.autoImportsManager = autoImportsManager;
    this.importsFormatter = importsFormatter;
    this.isHaste = isHaste;
  }

  provideCompletions(textDocumentPosition, nuclideFormattedUri) {
    const { position, textDocument } = textDocumentPosition;

    // TODO(seansegal): Handle imports broken up on multiple lines.
    const line = this.documents.get(textDocument.uri).buffer.lineForRow(position.line);

    if (positionIsAtLineEnd(line, position) &&
    // Check if line starts with "import" (or "const") before matching all regexes.
    isImportStatement(line) && line.indexOf(';') < 0) {
      const importInformation = getImportInformation(line);
      if (importInformation) {
        return importInformation.isComplete ? provideImportFileCompletions(importInformation, this.importsFormatter, this.autoImportsManager, nuclideFormattedUri, line, position.line, this.isHaste) : provideFullImportCompletions(importInformation, this.importsFormatter, this.autoImportsManager, nuclideFormattedUri, line, position.line, this.isHaste);
      }
    }
    return [];
  }
}

exports.Completions = Completions; // Provides autocompletion of IDs that could be imported. When selected
// the entire import line is added.

function provideFullImportCompletions(importInformation, importsFormatter, autoImportsManager, nuclideFormattedUri, line, lineNum, isHaste) {
  const { ids, importType } = importInformation;
  if (isHaste && (importType === 'defaultValue' || importType === 'namedValue')) {
    // Value imports should not be used with haste. Require is used instead.
    return [];
  }
  return filterSuggestions([autoImportsManager.exportsManager.getExportsIndex().getExportsStartingWith(ids[0], MAX_RESULTS)], importType).map((suggestion, i) => {
    const fileToImport = importsFormatter.formatImportFile(nuclideFormattedUri, suggestion);

    const insertText = getInsertTextForCompleteImport(importType, suggestion.id, fileToImport);

    return {
      label: suggestion.id,
      kind: (_vscodeLanguageserver || _load_vscodeLanguageserver()).CompletionItemKind.Module,
      data: i,
      inlineDetail: importsFormatter.stripLeadingDots(fileToImport),
      insertText
    };
  });
}

function getInsertTextForCompleteImport(importType, id, formattedFileToImport) {
  switch (importType) {
    case 'namedValue':
    case 'namedType':
      return `${id}} from '${formattedFileToImport}';`;
    case 'requireImport':
      return `${id} = require('${formattedFileToImport}');`;
    case 'requireDestructured':
      return `${id}} = require('${formattedFileToImport}');`;
    default:
      return `${id} from '${formattedFileToImport}';`;
  }
}

// Given a list of IDs that are already typed, provide autocompletion for
// the files that those IDs might be imported from.
function provideImportFileCompletions(importInformation, importsFormatter, autoImportsManager, nuclideFormattedUri, line, lineNum, isHaste) {
  const { ids, importType, extraText } = importInformation;
  if (!shouldProvideCompletions(extraText, importType)) {
    return [];
  }
  return filterSuggestions(ids.map(id => autoImportsManager.findFilesWithSymbol(id)), importType).sort((s1, s2) => {
    return uriToSortNumber(s1.uri) - uriToSortNumber(s2.uri);
  }).map((suggestion, i) => {
    return importsToCompletionItems(importsFormatter, nuclideFormattedUri, suggestion, i, line, lineNum, importType, isHaste);
  });
}

function shouldProvideCompletions(extraText, importType) {
  return (
    // For now, if there is any trailing extra text including whitespace
    // then don't offer autocomplete suggestions. Eventually, this problem
    // can be better solved by sending a TextEdit to replace extraText.
    extraText.indexOf(' ') < 0 || importType !== 'requireImport' && extraText.trim() === 'from' || importType === 'requireImport' && extraText.trim() === '='
  );
}

function filterSuggestions(suggestionsForEachId, importType) {
  let suggestions = suggestionsForEachId[0] || [];

  // If there is more than one ID, take the intersection
  // (based on the import URI) of all the suggestions
  if (suggestionsForEachId.length > 1) {
    const commonUris = suggestionsForEachId.reduce((aggregated, suggestionForId) => {
      return (0, (_collection || _load_collection()).setIntersect)(aggregated, new Set(suggestionForId.map(s => s.uri)));
    }, new Set(suggestionsForEachId[0].map(s => s.uri)));
    suggestions = suggestionsForEachId.reduce((suggestionsAggregate, suggestionsForId) => {
      return suggestionsAggregate.concat(suggestionsForId.filter(e => commonUris.has(e.uri)));
    }, []);
  }

  // Filter out suggestions based on the import type
  switch (importType) {
    case 'defaultValue':
      return suggestions.filter(exp => exp.isDefault && !exp.isTypeExport);
    case 'defaultType':
      return suggestions.filter(exp => exp.isTypeExport || exp.isDefault && isClassOrUnknownExport(exp));
    case 'namedValue':
      return suggestions.filter(exp => !exp.isDefault && !exp.isTypeExport);
    case 'namedType':
      return suggestions.filter(exp => exp.isTypeExport || !exp.isDefault && isClassOrUnknownExport(exp));
    case 'requireImport':
      return suggestions.filter(exp => exp.isDefault && !exp.isTypeExport);
    case 'requireDestructured':
      return suggestions.filter(exp => !exp.isDefault && !exp.isTypeExport);
    default:
      return suggestions;
  }
}

// Exported for testing
function getImportInformation(line) {
  for (const importType of Object.keys(IMPORT_STATEMENT_REGEXES)) {
    const importStatement = line.match(IMPORT_STATEMENT_REGEXES[importType]);
    if (importStatement && importStatement.length > 1) {
      if (importStatement[1] === 'type') {
        // Edge case: "import type TextDoc" will match complete defaultValue
        // regex, but we want it to match the incomplete defaultType regex.
        continue;
      }
      return {
        ids: importStatement[1].split(',').map(id => id.trim()).filter(id => id.length > 0),
        extraText: importStatement.length > 2 ? importStatement[2] : '',
        isComplete: true,
        importType
      };
    }
  }
  for (const importType of Object.keys(INCOMPLETE_IMPORT_REGEX)) {
    const importStatement = line.match(INCOMPLETE_IMPORT_REGEX[importType]);
    if (importStatement && importStatement.length > 1) {
      return {
        ids: [importStatement[1]],
        extraText: '',
        isComplete: false,
        importType
      };
    }
  }
  return null;
}

function importsToCompletionItems(importsFormatter, currentFile, exportSuggestion, dataNum, lineText, lineNum, importType, isHaste) {
  const fileImport = importsFormatter.formatImportFile(currentFile, exportSuggestion);

  // autocomplete-plus will replace everything until there is whitespace. If the
  // user writes "import Foo from " we should no longer include "from" in the
  // completion to avoid two "from"s.
  const fromIsAlreadyTyped = new RegExp(IMPORT_STATEMENT_REGEXES[importType].source + /\s*from\s+/.source).test(lineText);

  const equalIsAlreadyTyped = new RegExp(IMPORT_STATEMENT_REGEXES[importType].source + /\s*=\s*/.source).test(lineText);

  const label = importType === 'requireImport' || importType === 'requireDestructured' ? `${equalIsAlreadyTyped ? '' : '='} require('${fileImport}');` : `${fromIsAlreadyTyped ? '' : 'from'} '${fileImport}';`;

  return {
    label,
    kind: (_vscodeLanguageserver || _load_vscodeLanguageserver()).CompletionItemKind.Module,
    data: dataNum,
    insertText: label
  };
}

function isImportStatement(line) {
  return (/^\s*import/.test(line) || /^const/.test(line)
  );
}

// This function will always return true when an export is a Class export,
// but will sometimes return true even if an export is NOT a class export.
// More specifically, if the type of export is unknown (for example, this would
// happen in the program: "class SomeClass{}; export {SomeClass}")
// this function returns true.
function isClassOrUnknownExport(exp) {
  return !exp.type || exp.type === 'ClassDeclaration' || exp.type === 'ClassExpression';
}

function positionIsAtLineEnd(line, position) {
  return line.length === position.character ||
  // Still provide autocomplete if there is trailing whitespace.
  line.substr(position.character).trim() === '';
}

function uriToSortNumber(uri) {
  /* For now, sort in the following order: (TODO: explore other sorting options)
        - Modules
        - Local paths (./*)
        - Relative paths in other directories (../*)
  */
  if (uri.startsWith('..')) {
    return (_nuclideUri || _load_nuclideUri()).default.split(uri).filter(dir => dir === '..').length;
  }
  if (uri.startsWith('.')) {
    return 0;
  }
  return -1;
}