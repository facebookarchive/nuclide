"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkspaceSymbols = void 0;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _protocol() {
  const data = require("../../nuclide-vscode-language-service-rpc/lib/protocol");

  _protocol = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
const WORKSPACE_SYMBOLS_LIMIT = 30;

function exportTypeToSymbolKind(type) {
  switch (type) {
    case 'FunctionDeclaration':
    case 'FunctionExpression':
      return _protocol().SymbolKind.Function;

    case 'ClassDeclaration':
    case 'ClassExpression':
      return _protocol().SymbolKind.Class;

    case 'VariableDeclaration':
      return _protocol().SymbolKind.Variable;

    case 'InterfaceDeclaration':
    case 'TypeAlias':
      return _protocol().SymbolKind.Interface;

    case 'ObjectExpression':
      return _protocol().SymbolKind.Module;

    case 'NumericLiteral':
      return _protocol().SymbolKind.Number;

    case 'StringLiteral':
      return _protocol().SymbolKind.String;

    default:
      return _protocol().SymbolKind.Module;
  }
}

class WorkspaceSymbols {
  static getWorkspaceSymbols(autoImportsManager, params) {
    const index = autoImportsManager.exportsManager.getExportsIndex();
    const matchingIds = index.getIdsMatching(params.query, WORKSPACE_SYMBOLS_LIMIT);
    return matchingIds.reduce((acc, id) => {
      if (acc.length >= WORKSPACE_SYMBOLS_LIMIT) {
        return acc;
      }

      const needed = WORKSPACE_SYMBOLS_LIMIT - acc.length;
      return acc.concat(index.getExportsFromId(id).slice(0, needed).map(jsExport => {
        const position = {
          line: jsExport.line - 1,
          character: 0 // TODO: not really needed for now.

        };
        return {
          name: id,
          containerName: jsExport.hasteName,
          kind: exportTypeToSymbolKind(jsExport.type),
          location: {
            uri: _nuclideUri().default.nuclideUriToUri(jsExport.uri),
            range: {
              start: position,
              end: position
            }
          }
        };
      }));
    }, []);
  }

}

exports.WorkspaceSymbols = WorkspaceSymbols;