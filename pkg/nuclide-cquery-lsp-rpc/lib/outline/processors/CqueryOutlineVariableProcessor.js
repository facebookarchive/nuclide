"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.processVariable = processVariable;

function _CqueryOutlineTokenizer() {
  const data = require("../tokenizers/CqueryOutlineTokenizer");

  _CqueryOutlineTokenizer = function () {
    return data;
  };

  return data;
}

function _TokenBuffer() {
  const data = require("../tokenizers/TokenBuffer");

  _TokenBuffer = function () {
    return data;
  };

  return data;
}

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

/**
 * Processes a variable, its tokenized text and find its position in the tree.
 */
function processVariable(root, node, symbol, ranges) {
  new CqueryOutlineVariableProcessor(root, node, symbol, ranges).process();
}

class CqueryOutlineVariableProcessor {
  constructor(root, node, symbol, ranges) {
    this._root = root;
    this._node = node;
    this._symbol = symbol;
    this._ranges = ranges;
  }

  process() {
    if (this._symbol.containerName == null) {
      return;
    }

    const tokenized = (0, _CqueryOutlineTokenizer().asNonLocalVariable)(this._symbol.containerName || '', this._symbol.name);

    if (tokenized == null) {
      return;
    }

    const parent = this._findParentForVariable(tokenized);

    if (parent == null) {
      return;
    }

    this._node.tokenizedText = tokenized.tokenizedText; // macros have one single token

    if (tokenized.tokenizedText.length === 1) {
      this._makeNodeAMacro();
    }

    this._ranges.addSymbol(this._symbol, this._node);

    parent.children.push(this._node);
  }

  _makeNodeAMacro() {
    this._node.kind = 'constant';
    this._node.icon = 'type-constant';
  }
  /*
   * This returns null for params and local variables
   * If the parent is a function and this variable starts at the same line as
   * the function, we append this variable as a param
   */


  _findParentForVariable(tokenized) {
    const functionParent = this._ranges.findParentFunction(this._symbol.location.range);

    if (functionParent != null) {
      this._appendParams(functionParent, tokenized);

      return null;
    }

    return this._ranges.findStructuredObjectParent(this._symbol.location.range) || this._root;
  }
  /**
   * obj-c functions don't contain ()
   */


  _isObjcFunction(node) {
    return !(node.tokenizedText || []).map(t => t.value).includes('(');
  }

  _appendParams(node, tokenized) {
    if (this._isObjcFunction(node)) {
      node.tokenizedText = new (_TokenBuffer().TokenBuffer)(node.tokenizedText).appendObjcParams(tokenized.tokenizedText).toArray();
    }
  }

}