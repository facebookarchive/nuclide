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

import type {OutlineTree} from 'atom-ide-ui';
import type {SymbolInformation} from '../../../../nuclide-vscode-language-service-rpc/lib/protocol';
import type {TokenizedSymbol} from '../../types';
import type {SymbolRanges} from './SymbolRanges';

import {asNonLocalVariable} from '../tokenizers/CqueryOutlineTokenizer';
import {TokenBuffer} from '../tokenizers/TokenBuffer';

/**
 * Processes a variable, its tokenized text and find its position in the tree.
 */
export function processVariable(
  root: OutlineTree,
  node: OutlineTree,
  symbol: SymbolInformation,
  ranges: SymbolRanges,
): void {
  new CqueryOutlineVariableProcessor(root, node, symbol, ranges).process();
}

class CqueryOutlineVariableProcessor {
  _root: OutlineTree;
  _node: OutlineTree;
  _symbol: SymbolInformation;
  _ranges: SymbolRanges;

  constructor(
    root: OutlineTree,
    node: OutlineTree,
    symbol: SymbolInformation,
    ranges: SymbolRanges,
  ) {
    this._root = root;
    this._node = node;
    this._symbol = symbol;
    this._ranges = ranges;
  }

  process(): void {
    if (this._symbol.containerName == null) {
      return;
    }
    const tokenized = asNonLocalVariable(
      this._symbol.containerName || '',
      this._symbol.name,
    );
    if (tokenized == null) {
      return;
    }
    const parent = this._findParentForVariable(tokenized);
    if (parent == null) {
      return;
    }
    this._node.tokenizedText = tokenized.tokenizedText;
    // macros have one single token
    if (tokenized.tokenizedText.length === 1) {
      this._makeNodeAMacro();
    }
    this._ranges.addSymbol(this._symbol, this._node);
    parent.children.push(this._node);
  }

  _makeNodeAMacro(): void {
    this._node.kind = 'constant';
    this._node.icon = 'type-constant';
  }

  /*
   * This returns null for params and local variables
   * If the parent is a function and this variable starts at the same line as
   * the function, we append this variable as a param
   */
  _findParentForVariable(tokenized: TokenizedSymbol): ?OutlineTree {
    const functionParent = this._ranges.findParentFunction(
      this._symbol.location.range,
    );
    if (functionParent != null) {
      this._appendParams(functionParent, tokenized);
      return null;
    }
    return (
      this._ranges.findStructuredObjectParent(this._symbol.location.range) ||
      this._root
    );
  }

  /**
   * obj-c functions don't contain ()
   */
  _isObjcFunction(node: OutlineTree): boolean {
    return !(node.tokenizedText || []).map(t => t.value).includes('(');
  }

  _appendParams(node: OutlineTree, tokenized: TokenizedSymbol): void {
    if (this._isObjcFunction(node)) {
      node.tokenizedText = new TokenBuffer(node.tokenizedText)
        .appendObjcParams(tokenized.tokenizedText)
        .toArray();
    }
  }
}
