'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CommandExecutor = undefined;
exports.getEditsForImport = getEditsForImport;

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

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

var _util;

function _load_util() {
  return _util = require('./utils/util');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

class CommandExecutor {

  constructor(connection, importFormatter, documents) {
    this.connection = connection;
    this.importFormatter = importFormatter;
    this.documents = documents;
  }

  executeCommand(command, args) {
    switch (command) {
      case 'addImport':
        return this._addImport(args);
      default:
        command;
        throw new Error('Unexpected Command');
    }
  }

  _addImport(args) {
    const [missingImport, fileMissingImport] = args;
    const ast = (0, (_AutoImportsManager || _load_AutoImportsManager()).parseFile)(this.documents.get((_nuclideUri || _load_nuclideUri()).default.nuclideUriToUri(fileMissingImport)).getText());
    if (ast == null || ast.program == null || ast.program.body == null) {
      // File could not be parsed. If this is reached, we shouldn't be applying
      // addImport anyways since the file must have changed from when we computed
      // the CodeAction.
      return;
    }
    const { body } = ast.program;
    const edits = getEditsForImport(this.importFormatter, fileMissingImport, missingImport, body);

    const lspUri = (_nuclideUri || _load_nuclideUri()).default.nuclideUriToUri(fileMissingImport);
    // Version 2.0 LSP
    const changes = {};
    changes[lspUri] = edits;

    // Version 3.0 LSP
    const documentChanges = [{
      textDocument: {
        uri: lspUri,
        version: this.documents.get(lspUri).version
      },
      edits
    }];

    this.connection.workspace.applyEdit({ changes, documentChanges });
  }
}

exports.CommandExecutor = CommandExecutor;
CommandExecutor.COMMANDS = {
  addImport: true
};
function getEditsForImport(importFormatter, fileMissingImport, missingImport, programBody) {
  const importPath = importFormatter.formatImportFile(fileMissingImport, missingImport);
  const insertEdit = insertIntoExistingImport(importPath, missingImport, programBody);
  if (insertEdit != null) {
    return [createEdit(missingImport.id, insertEdit)];
  }
  return [createEdit(importFormatter.formatImport(fileMissingImport, missingImport), createNewImport(missingImport, programBody, importPath))];
}

function createEdit(insertText, { row, column, indent, newLinesAfter, newLinesBefore }) {
  return {
    range: (0, (_util || _load_util()).atomRangeToLSPRange)(new (_simpleTextBuffer || _load_simpleTextBuffer()).Range([row, column], [row, column])),
    newText:
    // We're always going to insert before any trailing commas, so it's safe to always add one.
    (column === 0 ? '' : ',') + '\n'.repeat(newLinesBefore) + ' '.repeat(indent || 0) + insertText + '\n'.repeat(newLinesAfter)
  };
}

// Find a position where we can just insert the missing ID.
function insertIntoExistingImport(importPath, missingImport, programBody) {
  // For now, we won't allow mixed imports (e.g. import {type X, Y})
  if (missingImport.isDefault) {
    return null;
  }
  for (const node of programBody) {
    const jsImport = getJSImport(node);
    if (jsImport == null || jsImport.importPath !== importPath) {
      continue;
    }
    if (jsImport.type === 'require') {
      const declaration = node.declarations[0];
      if (declaration.id.type === 'ObjectPattern') {
        const { properties } = declaration.id;
        return positionAfterNode(node, properties[properties.length - 1]);
      }
    } else {
      const isTypeImport = jsImport.type === 'importType';
      if (isTypeImport === missingImport.isTypeExport) {
        const { specifiers } = node;
        return positionAfterNode(node, specifiers[specifiers.length - 1]);
      }
    }
  }
}

// Return the insert position that would be immediately after the given node.
// e.g. after X in const {X|} = require('...')
function positionAfterNode(importNode, afterNode) {
  const hasNewline = importNode.loc.start.line !== importNode.loc.end.line;
  const { line, column } = afterNode.loc.end;
  return {
    row: line - 1,
    column,
    indent: hasNewline ? afterNode.loc.start.column : 1,
    newLinesAfter: 0,
    newLinesBefore: Number(hasNewline)
  };
}

function getJSImport(node) {
  switch (node.type) {
    // const {X} = require('..');
    case 'VariableDeclaration':
      if (node.kind === 'const' && node.declarations.length === 1) {
        const importPath = (0, (_util || _load_util()).getRequiredModule)(node.declarations[0].init);
        if (importPath != null) {
          return {
            type: 'require',
            importPath
          };
        }
      }
      break;
    case 'ImportDeclaration':
      return {
        type: node.importKind === 'type' ? 'importType' : 'import',
        importPath: node.source.value
      };
  }
}

function createNewImport(missingImport, programBody, importPath) {
  const nodesByType = {
    require: [],
    import: [],
    importType: []
  };
  programBody.forEach(node => {
    const jsImport = getJSImport(node);
    if (jsImport != null) {
      nodesByType[jsImport.type].push({
        node,
        importPath: jsImport.importPath
      });
    }
  });

  if (missingImport.isTypeExport) {
    if (nodesByType.importType.length > 0) {
      return insertInto(nodesByType.importType, importPath);
    } else {
      const firstImport = nodesByType.import[0] || nodesByType.require[0];
      if (firstImport != null) {
        return insertBefore(firstImport.node, 1);
      }
    }
  } else {
    if (nodesByType.import.length > 0) {
      return insertInto(nodesByType.import, importPath);
    } else if (nodesByType.require.length > 0) {
      return insertInto(nodesByType.require, importPath);
    } else if (nodesByType.importType.length > 0) {
      return insertAfter(nodesByType.importType[nodesByType.importType.length - 1].node, 1);
    }
  }
  return insertBefore(programBody[0], 1);
}

function insertInto(imports, importPath) {
  for (const importNode of imports) {
    // Find the first import that we can be inserted before.
    if ((0, (_util || _load_util()).compareForInsertion)(importPath, importNode.importPath) < 0) {
      return insertBefore(importNode.node);
    }
  }
  // Failing that, just insert it after the last one.
  return insertAfter(imports[imports.length - 1].node);
}

// Insert at the start of the next line:
// <node>
// <text\n>
function insertAfter(node, spacing = 0) {
  return {
    row: node.loc.end.line, // 1-based
    column: 0,
    newLinesAfter: 1,
    newLinesBefore: spacing
  };
}

// Insert at the start of the line:
// <\ntext\n><node>
function insertBefore(node, spacing = 0) {
  return {
    row: node.loc.start.line - 1, // 1-based
    column: 0,
    newLinesAfter: 1 + spacing,
    newLinesBefore: 0
  };
}