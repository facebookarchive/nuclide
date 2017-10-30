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

import type {
  SymbolInformation,
  WorkspaceSymbolParams,
} from '../../nuclide-vscode-language-service-rpc/lib/protocol';
import type {AutoImportsManager} from './lib/AutoImportsManager';
import type {ExportType} from './lib/types';

import {SymbolKind} from '../../nuclide-vscode-language-service-rpc/lib/protocol';

const WORKSPACE_SYMBOLS_LIMIT = 100;

function exportTypeToSymbolKind(type?: ExportType): $Values<typeof SymbolKind> {
  switch (type) {
    case 'FunctionDeclaration':
    case 'FunctionExpression':
      return SymbolKind.Function;
    case 'ClassDeclaration':
    case 'ClassExpression':
      return SymbolKind.Class;
    case 'VariableDeclaration':
      return SymbolKind.Variable;
    case 'InterfaceDeclaration':
      return SymbolKind.Interface;
    case 'ObjectExpression':
      return SymbolKind.Module;
    case 'TypeAlias':
      return SymbolKind.Constructor;
    case 'NumericLiteral':
    case 'StringLiteral':
      return SymbolKind.Constant;
    default:
      return SymbolKind.Module;
  }
}

export class WorkspaceSymbols {
  static getWorkspaceSymbols(
    autoImportsManager: AutoImportsManager,
    params: WorkspaceSymbolParams,
  ): Array<SymbolInformation> {
    const index = autoImportsManager.exportsManager.getExportsIndex();
    const matchingIds = index.getIdsMatching(
      params.query,
      WORKSPACE_SYMBOLS_LIMIT,
    );
    return matchingIds.reduce((acc, id) => {
      if (acc.length >= WORKSPACE_SYMBOLS_LIMIT) {
        return acc;
      }
      const needed = WORKSPACE_SYMBOLS_LIMIT - acc.length;
      return index
        .getExportsFromId(id)
        .slice(0, needed)
        .map(jsExport => {
          const position = {
            line: jsExport.line - 1,
            character: 0, // TODO: not really needed for now.
          };
          return {
            name: id,
            kind: exportTypeToSymbolKind(jsExport.type),
            location: {
              uri: jsExport.uri,
              range: {
                start: position,
                end: position,
              },
            },
          };
        });
    }, []);
  }
}
