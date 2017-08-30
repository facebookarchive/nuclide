/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import {
  type TextDocumentPositionParams,
  type CompletionItem,
  CompletionItemKind,
} from '../../nuclide-vscode-language-service-rpc/lib/protocol';

import {AutoImportsManager} from './lib/AutoImportsManager';
import {ImportFormatter} from './lib/ImportFormatter';
import {setIntersect} from 'nuclide-commons/collection';
import nuclideUri from 'nuclide-commons/nuclideUri';

import type TextDocuments from './TextDocuments';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {JSExport} from './lib/types';

type ImportType =
  | 'namedType'
  | 'namedValue'
  | 'defaultType'
  | 'defaultValue'
  | 'requireImport'
  | 'requireDestructured';

type ImportInformation = {
  ids: Array<string>,
  importType: ImportType,
  isComplete: boolean,
};

const MAX_RESULTS = 200;

const INCOMPLETE_IMPORT_REGEX = {
  namedType: /^\s*import\s+type\s+{\s*([$\w]+)$/,
  namedValue: /^\s*import\s+{\s*([$\w\s,]+)$/,
  defaultType: /^\s*import\s+type\s+([$\w]+)$/,
  defaultValue: /^\s*import\s+([$\w]+)$/,
  requireImport: /^const\s+([$\w]+)$/,
  requireDestructured: /^const\s+{\s*([$\w]+)$/,
};

const IMPORT_STATEMENT_REGEXES = {
  namedType: /^\s*import\s+type\s+{\s*([$\w\s,]+)\s*}\s*(.*)/,
  namedValue: /^\s*import\s+{\s*([$\w\s,]+)\s*}\s*(.*)/,
  defaultType: /^\s*import\s+type\s+([$\w]+)\s+(.*)/,
  defaultValue: /^\s*import\s+([$\w]+)\s+(.*)/,
  requireImport: /^const\s+([$\w]+)\s+(.*)/,
  requireDestructured: /^const\s+{\s*([$\w\s,]+)\s*}\s*(.*)/,
};

export class Completions {
  documents: TextDocuments;
  autoImportsManager: AutoImportsManager;
  importsFormatter: ImportFormatter;
  isHaste: boolean;

  constructor(
    documents: TextDocuments,
    autoImportsManager: AutoImportsManager,
    importsFormatter: ImportFormatter,
    isHaste: boolean,
  ) {
    this.documents = documents;
    this.autoImportsManager = autoImportsManager;
    this.importsFormatter = importsFormatter;
    this.isHaste = isHaste;
  }

  provideCompletions(
    textDocumentPosition: TextDocumentPositionParams,
    nuclideFormattedUri: NuclideUri,
  ): Array<CompletionItem> {
    const {position, textDocument} = textDocumentPosition;

    // TODO(seansegal): Handle imports broken up on multiple lines.
    const line = this.documents
      .get(textDocument.uri)
      .buffer.lineForRow(position.line);

    if (
      positionIsAtLineEnd(line, position) &&
      // Check if line starts with "import" (or "const") before matching all regexes.
      isImportStatement(line) &&
      line.indexOf(';') < 0
    ) {
      const prefix = line.substr(0, position.character);
      const importInformation = getImportInformation(prefix);
      if (importInformation) {
        return importInformation.isComplete
          ? provideImportFileCompletions(
              importInformation,
              this.importsFormatter,
              this.autoImportsManager,
              nuclideFormattedUri,
              line,
              position.line,
              this.isHaste,
            )
          : provideFullImportCompletions(
              importInformation,
              this.importsFormatter,
              this.autoImportsManager,
              nuclideFormattedUri,
              line,
              position.line,
              this.isHaste,
            );
      }
    }
    return [];
  }
}

// Provides autocompletion of IDs that could be imported. When selected
// the entire import line is added.
function provideFullImportCompletions(
  importInformation: ImportInformation,
  importsFormatter: ImportFormatter,
  autoImportsManager: AutoImportsManager,
  nuclideFormattedUri: NuclideUri,
  line: string,
  lineNum: number,
  isHaste: boolean,
): Array<CompletionItem> {
  const {ids, importType} = importInformation;
  if (
    isHaste &&
    (importType === 'defaultValue' || importType === 'namedValue')
  ) {
    // Value imports should not be used with haste. Require is used instead.
    return [];
  }
  return filterSuggestions(
    [
      autoImportsManager.exportsManager
        .getExportsIndex()
        .getExportsStartingWith(ids[0], MAX_RESULTS),
    ],
    importType,
  ).map((suggestion, i) => {
    const fileToImport = importsFormatter.formatImportFile(
      nuclideFormattedUri,
      suggestion,
    );

    const insertText = getInsertTextForCompleteImport(
      importType,
      suggestion.id,
      fileToImport,
    );

    return {
      label: suggestion.id,
      kind: CompletionItemKind.Module,
      data: i,
      inlineDetail: importsFormatter.stripLeadingDots(fileToImport),
      textEdit: {
        range: {
          start: {line: lineNum, character: 0},
          end: {line: lineNum, character: line.length},
        },
        newText: insertText,
      },
    };
  });
}

function getInsertTextForCompleteImport(
  importType: ImportType,
  id: string,
  formattedFileToImport: string,
) {
  switch (importType) {
    case 'namedValue':
      return `import {${id}} from '${formattedFileToImport}';`;
    case 'namedType':
      return `import type {${id}} from '${formattedFileToImport}';`;
    case 'requireImport':
      return `const ${id} = require('${formattedFileToImport}');`;
    case 'requireDestructured':
      return `const {${id}} = require('${formattedFileToImport}');`;
    case 'defaultValue':
      return `import ${id} from '${formattedFileToImport}';`;
    case 'defaultType':
      return `import type ${id} from '${formattedFileToImport}';`;
    default:
      (importType: empty);
      throw new Error(`Invalid import type ${importType}`);
  }
}

// Given a list of IDs that are already typed, provide autocompletion for
// the files that those IDs might be imported from.
function provideImportFileCompletions(
  importInformation: ImportInformation,
  importsFormatter: ImportFormatter,
  autoImportsManager: AutoImportsManager,
  nuclideFormattedUri: NuclideUri,
  line: string,
  lineNum: number,
  isHaste: boolean,
): Array<CompletionItem> {
  const {ids, importType} = importInformation;
  return filterSuggestions(
    ids.map(id => autoImportsManager.findFilesWithSymbol(id)),
    importType,
  )
    .sort((s1, s2) => {
      return uriToSortNumber(s1.uri) - uriToSortNumber(s2.uri);
    })
    .map((suggestion, i) => {
      return importsToCompletionItems(
        importsFormatter,
        nuclideFormattedUri,
        suggestion,
        i,
        line,
        lineNum,
        importType,
        ids,
      );
    });
}

function filterSuggestions(
  suggestionsForEachId: Array<Array<JSExport>>,
  importType: ImportType,
): Array<JSExport> {
  let suggestions = suggestionsForEachId[0] || [];

  // If there is more than one ID, take the intersection
  // (based on the import URI) of all the suggestions
  if (suggestionsForEachId.length > 1) {
    const commonUris = suggestionsForEachId.reduce(
      (aggregated, suggestionForId) => {
        return setIntersect(
          aggregated,
          new Set(suggestionForId.map(s => s.uri)),
        );
      },
      new Set(suggestionsForEachId[0].map(s => s.uri)),
    );
    suggestions = suggestionsForEachId.reduce(
      (suggestionsAggregate, suggestionsForId) => {
        return suggestionsAggregate.concat(
          suggestionsForId.filter(e => commonUris.has(e.uri)),
        );
      },
      [],
    );
  }

  // Filter out suggestions based on the import type
  switch (importType) {
    case 'defaultValue':
      return suggestions.filter(exp => exp.isDefault && !exp.isTypeExport);
    case 'defaultType':
      return suggestions.filter(
        exp =>
          exp.isTypeExport || (exp.isDefault && isClassOrUnknownExport(exp)),
      );
    case 'namedValue':
      return suggestions.filter(exp => !exp.isDefault && !exp.isTypeExport);
    case 'namedType':
      return suggestions.filter(
        exp =>
          exp.isTypeExport || (!exp.isDefault && isClassOrUnknownExport(exp)),
      );
    case 'requireImport':
      return suggestions.filter(exp => exp.isDefault && !exp.isTypeExport);
    case 'requireDestructured':
      return suggestions.filter(exp => !exp.isDefault && !exp.isTypeExport);
    default:
      return suggestions;
  }
}

// Exported for testing
export function getImportInformation(line: string): ?ImportInformation {
  for (const importType of Object.keys(IMPORT_STATEMENT_REGEXES)) {
    const importStatement = line.match(IMPORT_STATEMENT_REGEXES[importType]);
    if (importStatement && importStatement.length > 1) {
      if (importStatement[1] === 'type') {
        // Edge case: "import type TextDoc" will match complete defaultValue
        // regex, but we want it to match the incomplete defaultType regex.
        continue;
      }
      return {
        ids: importStatement[1]
          .split(',')
          .map(id => id.trim())
          .filter(id => id.length > 0),
        isComplete: true,
        importType,
      };
    }
  }
  for (const importType of Object.keys(INCOMPLETE_IMPORT_REGEX)) {
    const importStatement = line.match(INCOMPLETE_IMPORT_REGEX[importType]);
    if (importStatement && importStatement.length > 1) {
      return {
        ids: [importStatement[1]],
        isComplete: false,
        importType,
      };
    }
  }
  return null;
}

function importsToCompletionItems(
  importsFormatter: ImportFormatter,
  currentFile: NuclideUri,
  exportSuggestion: JSExport,
  dataNum: number,
  lineText: string,
  lineNum: number,
  importType: ImportType,
  ids: Array<string>,
): CompletionItem {
  const fileImport = importsFormatter.formatImportFile(
    currentFile,
    exportSuggestion,
  );

  const label =
    importType === 'requireImport' || importType === 'requireDestructured'
      ? `= require('${fileImport}');`
      : `from '${fileImport}';`;

  return {
    label,
    kind: CompletionItemKind.Module,
    data: dataNum,
    textEdit: {
      range: {
        start: {line: lineNum, character: 0},
        end: {line: lineNum, character: lineText.length},
      },
      newText: getInsertTextForCompleteImport(
        importType,
        ids.join(', '),
        fileImport,
      ),
    },
  };
}

function isImportStatement(line: string): boolean {
  return /^\s*import/.test(line) || /^const/.test(line);
}

// This function will always return true when an export is a Class export,
// but will sometimes return true even if an export is NOT a class export.
// More specifically, if the type of export is unknown (for example, this would
// happen in the program: "class SomeClass{}; export {SomeClass}")
// this function returns true.
function isClassOrUnknownExport(exp: JSExport): boolean {
  return (
    !exp.type ||
    exp.type === 'ClassDeclaration' ||
    exp.type === 'ClassExpression'
  );
}

function positionIsAtLineEnd(line: string, position: Object): boolean {
  if (line.length === position.character) {
    return true;
  }
  const remainder = line.substr(position.character).trim();
  // Still provide autocomplete if there is trailing whitespace.
  // Editor bracket matchers often insert a trailing "}", which should also be ignored.
  return remainder === '' || remainder === '}';
}

function uriToSortNumber(uri: NuclideUri): number {
  /* For now, sort in the following order: (TODO: explore other sorting options)
        - Modules
        - Local paths (./*)
        - Relative paths in other directories (../*)
  */
  if (uri.startsWith('..')) {
    return nuclideUri.split(uri).filter(dir => dir === '..').length;
  }
  if (uri.startsWith('.')) {
    return 0;
  }
  return -1;
}
