/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {SymbolInformation} from '../../../nuclide-vscode-language-service-rpc/lib/protocol';
import type {OutlineTree} from 'atom-ide-ui/pkg/atom-ide-outline-view/lib/types';

import {SymbolKind} from '../../../nuclide-vscode-language-service-rpc/lib/protocol';
import {createNamespaceNode} from './nodes';
import {processNonVariable} from './processors/CqueryOutlineNonVariableProcessor';
import {processVariable} from './processors/CqueryOutlineVariableProcessor';
import {SymbolRanges} from './processors/SymbolRanges';
import {sanitizeSymbol} from './sanitizers';
import {
  asClass,
  asFunction,
  asMember,
} from './tokenizers/CqueryOutlineTokenizer';

/**
 * Given a list of outline tree nodes along with the symbols sent by cquery,
 * this creates the corresponding tree structure and sets a more beautiful
 * OutlineTree.tokenizedText
 *
 * For some examples please look at the spec.
 */
export function parseOutlineTree(
  list: Array<[SymbolInformation, OutlineTree]>,
): OutlineTree {
  const root = createNamespaceNode('');
  const ranges = new SymbolRanges();
  for (const [symbol, node] of list) {
    parseSymbol(root, ranges, symbol, node);
  }
  return root;
}

function parseSymbol(
  root: OutlineTree,
  ranges: SymbolRanges,
  symbol: SymbolInformation,
  node: OutlineTree,
): void {
  const containerName = sanitizeSymbol(symbol.containerName);
  const name = sanitizeSymbol(symbol.name);
  symbol.name = name;
  symbol.containerName = containerName;
  if (containerName.length === 0 || name.length === 0) {
    return;
  }

  let tokenized = null;
  switch (symbol.kind) {
    case SymbolKind.Class:
      tokenized = asClass(containerName, name);
      break;
    case SymbolKind.Function:
    case SymbolKind.Method:
      tokenized = asFunction(containerName, name);
      break;
    case SymbolKind.Variable:
      tokenized = asMember(containerName, name);
      if (tokenized == null) {
        processVariable(root, node, symbol, ranges);
      }
  }
  if (tokenized != null) {
    processNonVariable(root, tokenized, node, symbol, ranges);
  }
}
