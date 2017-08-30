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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {JSExport} from './lib/types';
import type TextDocuments from './TextDocuments';
import type {
  WorkspaceEdit,
  TextEdit,
} from '../../nuclide-vscode-language-service-rpc/lib/protocol';

import {IConnection} from 'vscode-languageserver';
import {ImportFormatter} from './lib/ImportFormatter';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {parseFile} from './lib/AutoImportsManager';
import {babelLocationToAtomRange, atomRangeToLSPRange} from './utils/util';
import {Range} from 'simple-text-buffer';
import {getRequiredModule} from './utils/util';

export type AddImportCommandParams = [string, JSExport, NuclideUri];

type EditParams = {
  row: number,
  column: number,
  indent?: number,
  newLinesBefore: number,
  newLinesAfter: number,
};

export class CommandExecutor {
  static COMMANDS = {
    addImport: true,
  };

  connection: IConnection;
  importFormatter: ImportFormatter;
  documents: TextDocuments;

  constructor(
    connection: IConnection,
    importFormatter: ImportFormatter,
    documents: TextDocuments,
  ) {
    this.connection = connection;
    this.importFormatter = importFormatter;
    this.documents = documents;
  }

  executeCommand(command: $Keys<typeof CommandExecutor.COMMANDS>, args: any) {
    switch (command) {
      case 'addImport':
        return this._addImport((args: AddImportCommandParams));
      default:
        (command: empty);
        throw new Error('Unexpected Command');
    }
  }

  _addImport(args: AddImportCommandParams) {
    const [, missingImport, fileMissingImport] = args;
    const ast = parseFile(
      this.documents
        .get(nuclideUri.nuclideUriToUri(fileMissingImport))
        .getText(),
    );
    if (ast == null || ast.program == null || ast.program.body == null) {
      // File could not be parsed. If this is reached, we shouldn't be applying
      // addImport anyways since the file must have changed from when we computed
      // the CodeAction.
      return;
    }
    const {body} = ast.program;
    const edits = getEditsForImport(
      this.importFormatter,
      fileMissingImport,
      missingImport,
      body,
    );

    const lspUri = nuclideUri.nuclideUriToUri(fileMissingImport);
    // Version 2.0 LSP
    const changes = {};
    changes[lspUri] = edits;

    // Version 3.0 LSP
    const documentChanges = [
      {
        textDocument: {
          uri: lspUri,
          version: this.documents.get(lspUri).version,
        },
        edits,
      },
    ];

    this.connection.workspace.applyEdit(
      ({changes, documentChanges}: WorkspaceEdit),
    );
  }
}

export function getEditsForImport(
  importFormatter: ImportFormatter,
  fileMissingImport: NuclideUri,
  missingImport: JSExport,
  programBody: Array<Object>,
): Array<TextEdit> {
  const importPath = importFormatter.formatImportFile(
    fileMissingImport,
    missingImport,
  );
  const insertEdit = insertIntoExistingImport(
    importPath,
    missingImport,
    programBody,
  );
  if (insertEdit != null) {
    return [createEdit(missingImport.id, insertEdit)];
  }
  return [
    createEdit(
      importFormatter.formatImport(fileMissingImport, missingImport),
      createNewImport(missingImport, programBody),
    ),
  ];
}

function createEdit(
  insertText: string,
  {row, column, indent, newLinesAfter, newLinesBefore}: EditParams,
): TextEdit {
  return {
    range: atomRangeToLSPRange(new Range([row, column], [row, column])),
    newText:
      // We're always going to insert before any trailing commas, so it's safe to always add one.
      (column === 0 ? '' : ',') +
      '\n'.repeat(newLinesBefore) +
      ' '.repeat(indent || 0) +
      insertText +
      '\n'.repeat(newLinesAfter),
  };
}

// Find a position where we can just insert the missing ID.
function insertIntoExistingImport(
  importPath: string,
  missingImport: JSExport,
  programBody: Array<Object>,
): ?EditParams {
  // For now, we won't allow mixed imports (e.g. import {type X, Y})
  if (missingImport.isDefault) {
    return null;
  }
  for (const node of programBody) {
    switch (node.type) {
      // const {X} = require('..');
      case 'VariableDeclaration':
        if (node.kind === 'const' && !missingImport.isTypeExport) {
          for (const declaration of node.declarations) {
            if (declaration.id.type !== 'ObjectPattern') {
              continue;
            }
            const required = getRequiredModule(declaration.init);
            if (required != null && required === importPath) {
              const {properties} = declaration.id;
              return positionAfterNode(node, properties[properties.length - 1]);
            }
          }
        }
        break;
      case 'ImportDeclaration':
        const isTypeImport = node.importKind === 'type';
        if (
          isTypeImport === missingImport.isTypeExport &&
          node.source.type === 'StringLiteral' &&
          node.source.value === importPath
        ) {
          const {specifiers} = node;
          return positionAfterNode(node, specifiers[specifiers.length - 1]);
        }
        break;
    }
  }
}

// Return the insert position that would be immediately after the given node.
// e.g. after X in const {X|} = require('...')
function positionAfterNode(importNode, afterNode) {
  const hasNewline = importNode.loc.start.line !== importNode.loc.end.line;
  const {line, column} = afterNode.loc.end;
  return {
    row: line - 1,
    column,
    indent: hasNewline ? afterNode.loc.start.column : 1,
    newLinesAfter: 0,
    newLinesBefore: Number(hasNewline),
  };
}

function createNewImport(
  missingImport: JSExport,
  programBody: Array<Object>,
): EditParams {
  // For now, we consider two types of imports: value import and type imports.
  // TODO: integrate with nuclide-format-js or replace this with a more
  // specific ordering that is easily configurable.

  const [
    lastTypeImport,
    lastValueImport,
  ] = findLastTopLevelNodeSatisfying(programBody, [
    node => node.type === 'ImportDeclaration' && node.importKind === 'type',
    node => node.type === 'ImportDeclaration' && node.importKind === 'value',
  ]);

  let row;
  let newLinesAfter = 1;
  let newLinesBefore = 0;
  if (missingImport.isTypeExport && lastTypeImport) {
    row = rowAfterRange(babelLocationToAtomRange(lastTypeImport.loc));
  } else if (!missingImport.isTypeExport && lastValueImport) {
    row = rowAfterRange(babelLocationToAtomRange(lastValueImport.loc));
  } else if (!missingImport.isTypeExport && lastTypeImport) {
    // If we are adding the first import of this kind, we should at least be
    // consistent. For now, we will have type imports come before value imports.
    row = rowAfterRange(babelLocationToAtomRange(lastTypeImport.loc));
    newLinesBefore += 1;
  } else {
    row = rowBeforeRange(babelLocationToAtomRange(programBody[0].loc), 0);
    newLinesAfter += 1;
  }

  return {
    row,
    column: 0,
    newLinesAfter,
    newLinesBefore,
  };
}

function rowBeforeRange(range: atom$Range, rows?: number = 1) {
  return range.start.row - rows;
}

function rowAfterRange(range: atom$Range, rows?: number = 1) {
  return range.end.row + rows;
}

/**
 * Traverses top-level nodes of an AST, checking each predicate
 * function on every node.
 *
 * The output array corresponds 1:1 to the input predicate array. The i-th
 * element of the output array corresponds to the last node that returned true
 * for the i-th predicate function.
 */
function findLastTopLevelNodeSatisfying(
  programBody: Array<Object>,
  predicates: Array<(node: Object) => boolean>,
): Array<?Object> {
  const reversed = [...programBody].reverse();
  return predicates.map(predicate => reversed.find(x => predicate(x)));
}
