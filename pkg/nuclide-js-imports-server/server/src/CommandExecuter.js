'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CommandExecuter = undefined;

var _vscodeLanguageserver;

function _load_vscodeLanguageserver() {
  return _vscodeLanguageserver = require('vscode-languageserver');
}

var _ImportFormatter;

function _load_ImportFormatter() {
  return _ImportFormatter = require('./lib/ImportFormatter');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _AutoImportsManager;

function _load_AutoImportsManager() {
  return _AutoImportsManager = require('./lib/AutoImportsManager');
}

var _util;

function _load_util() {
  return _util = require('./utils/util');
}

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CommandExecuter {

  constructor(connection, importFormatter, documents) {
    this.connection = connection;
    this.importFormatter = importFormatter;
    this.documents = documents;
  }

  executeCommand(command, args) {
    switch (command) {
      case 'addImport':
        return addImport(args, this.connection, this.importFormatter, this.documents);
      default:
        throw new Error('Unexpected Command');
    }
  }
}

exports.CommandExecuter = CommandExecuter; /**
                                            * Copyright (c) 2015-present, Facebook, Inc.
                                            * All rights reserved.
                                            *
                                            * This source code is licensed under the license found in the LICENSE file in
                                            * the root directory of this source tree.
                                            *
                                            * 
                                            * @format
                                            */

CommandExecuter.COMMANDS = {
  addImport
};
function addImport(args, connection, importFormatter, documents) {
  const [id, missingImport, fileMissingImport] = args;
  const ast = (0, (_AutoImportsManager || _load_AutoImportsManager()).parseFile)(documents.get((_nuclideUri || _load_nuclideUri()).default.nuclideUriToUri(fileMissingImport)).getText());
  if (ast == null || ast.program == null || ast.program.body == null) {
    // File could not be parsed. If this is reached, we shouldn't be applying
    // addImport anyways since the file must have changed from when we computed
    // the CodeAction.
    return;
  }
  const { body } = ast.program;
  connection.workspace.applyEdit(getImportWorkspaceEdit(fileMissingImport, missingImport, id, importFormatter, body, documents));
}

function getImportWorkspaceEdit(fileMissingImport, missingImport, id, importFormatter, programBody, documents) {
  const { row, newLinesBefore, newLinesAfter } = findPositionForImport(missingImport, programBody);
  const edits = [getEditForFile(row, newLinesBefore, importFormatter, fileMissingImport, missingImport, newLinesAfter)];
  const lspUri = (_nuclideUri || _load_nuclideUri()).default.nuclideUriToUri(fileMissingImport);
  // Version 2.0 LSP
  const changes = {};
  changes[lspUri] = edits;

  // Version 3.0 LSP
  const documentChanges = [{
    textDocument: {
      uri: lspUri,
      version: documents.get(lspUri).version
    },
    edits
  }];

  return { changes, documentChanges };
}

function getEditForFile(row, newLinesBefore, importFormatter, fileMissingImport, missingImport, newLinesAfter) {
  return {
    range: emptyRangeAtRow(row),
    newText: `${'\n'.repeat(newLinesBefore)}${importFormatter.formatImport(fileMissingImport, missingImport)};${'\n'.repeat(newLinesAfter)}`
  };
}

function emptyRangeAtRow(row) {
  return (0, (_util || _load_util()).atomRangeToLSPRange)(new (_simpleTextBuffer || _load_simpleTextBuffer()).Range([row, 0], [row, 0]));
}

function findPositionForImport(missingImport, programBody) {
  // For now, we consider two types of imports: value import and type imports.
  // TODO: integrate with nuclide-format-js or replace this with a more
  const [lastTypeImport, lastValueImport] = findLastTopLevelNodeSatisfying(programBody, [node => node.type === 'ImportDeclaration' && node.importKind === 'type', node => node.type === 'ImportDeclaration' && node.importKind === 'value']);

  let row;
  let newLinesAfter = 1;
  let newLinesBefore = 0;
  if (missingImport.isTypeExport && lastTypeImport) {
    row = rowAfterRange((0, (_util || _load_util()).babelLocationToAtomRange)(lastTypeImport.loc));
  } else if (!missingImport.isTypeExport && lastValueImport) {
    row = rowAfterRange((0, (_util || _load_util()).babelLocationToAtomRange)(lastValueImport.loc));
  } else if (!missingImport.isTypeExport && lastTypeImport) {
    // If we are adding the first import of this kind, we should at least be
    // consistent. For now, we will have type imports come before value imports.
    row = rowAfterRange((0, (_util || _load_util()).babelLocationToAtomRange)(lastTypeImport.loc));
    newLinesBefore += 1;
  } else {
    row = rowBeforeRange((0, (_util || _load_util()).babelLocationToAtomRange)(programBody[0].loc), 0);
    newLinesAfter += 1;
  }

  return {
    row,
    newLinesAfter,
    newLinesBefore
  };
}

function rowBeforeRange(range, rows = 1) {
  return range.start.row - rows;
}

function rowAfterRange(range, rows = 1) {
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
function findLastTopLevelNodeSatisfying(programBody, predicates) {
  const reversed = [...programBody].reverse();
  return predicates.map(predicate => reversed.find(x => predicate(x)));
}