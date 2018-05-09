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

import type {OutlineTree} from 'atom-ide-ui';
import type {SymbolInformation} from '../../../../nuclide-vscode-language-service-rpc/lib/protocol';
import type {TokenizedSymbol} from '../../types';
import type {SymbolRanges} from './SymbolRanges';

import {lastFromArray} from 'nuclide-commons/collection';
import {createNamespaceNode} from '../nodes';

/**
 * Processes a non-variable, its tokenized text and find its position in the
 * tree.
 */
export function processNonVariable(
  root: OutlineTree,
  tokenized: TokenizedSymbol,
  node: OutlineTree,
  symbol: SymbolInformation,
  ranges: SymbolRanges,
): void {
  new CqueryOutlineNonVariableProcessor(
    root,
    tokenized,
    node,
    symbol,
    ranges,
  ).process();
}

class CqueryOutlineNonVariableProcessor {
  _root: OutlineTree;
  _tokenized: TokenizedSymbol;
  _node: OutlineTree;
  _symbol: SymbolInformation;
  _ranges: SymbolRanges;

  constructor(
    root: OutlineTree,
    tokenized: TokenizedSymbol,
    node: OutlineTree,
    symbol: SymbolInformation,
    ranges: SymbolRanges,
  ) {
    this._root = root;
    this._tokenized = tokenized;
    this._node = node;
    this._symbol = symbol;
    this._ranges = ranges;
  }

  process(): void {
    if (
      this._ranges.findOverlappingVariable(this._symbol.location.range) !=
        null ||
      this._ranges.findParentFunction(this._symbol.location.range) != null
    ) {
      return;
    }
    this._ranges.addSymbol(this._symbol, this._node);
    const {ancestors, tokenizedText} = this._tokenized;
    let currentNode = this._root;
    for (const ancestor of ancestors) {
      currentNode = this._traverseToChildNode(
        ancestor,
        currentNode,
        this._node,
      );
    }
    this._node.tokenizedText = tokenizedText;
    currentNode.children.push(this._node);
  }

  _traverseToChildNode(
    ancestor: string,
    currentNode: OutlineTree,
    node: OutlineTree,
  ): OutlineTree {
    if (this._shouldCreateNewNamespaceNode(ancestor, currentNode)) {
      const newNode = createNamespaceNode(ancestor, node.startPosition);
      // this node is not added to a covering range, because we don't know
      // where this symbol finishes, and this could be in fact a class name
      // in a definition and not a namespace, but we still treat is a namespace
      currentNode.children.push(newNode);
      return newNode;
    }
    return lastFromArray(currentNode.children);
  }

  _shouldCreateNewNamespaceNode(
    ancestor: string,
    currentNode: OutlineTree,
  ): boolean {
    return (
      currentNode.children.length === 0 ||
      lastFromArray(currentNode.children).representativeName !== ancestor
    );
  }
}
