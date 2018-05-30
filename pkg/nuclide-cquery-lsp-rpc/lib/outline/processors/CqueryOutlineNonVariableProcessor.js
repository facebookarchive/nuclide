'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.processNonVariable = processNonVariable;

var _collection;

function _load_collection() {
  return _collection = require('../../../../../modules/nuclide-commons/collection');
}

var _nodes;

function _load_nodes() {
  return _nodes = require('../nodes');
}

/**
 * Processes a non-variable, its tokenized text and find its position in the
 * tree.
 */
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

function processNonVariable(root, tokenized, node, symbol, ranges) {
  new CqueryOutlineNonVariableProcessor(root, tokenized, node, symbol, ranges).process();
}

class CqueryOutlineNonVariableProcessor {

  constructor(root, tokenized, node, symbol, ranges) {
    this._root = root;
    this._tokenized = tokenized;
    this._node = node;
    this._symbol = symbol;
    this._ranges = ranges;
  }

  process() {
    if (this._ranges.findOverlappingVariable(this._symbol.location.range) != null || this._ranges.findParentFunction(this._symbol.location.range) != null) {
      return;
    }
    this._ranges.addSymbol(this._symbol, this._node);
    const { ancestors, tokenizedText } = this._tokenized;
    let currentNode = this._root;
    for (const ancestor of ancestors) {
      currentNode = this._traverseToChildNode(ancestor, currentNode, this._node);
    }
    this._node.tokenizedText = tokenizedText;
    currentNode.children.push(this._node);
  }

  _traverseToChildNode(ancestor, currentNode, node) {
    if (this._shouldCreateNewNamespaceNode(ancestor, currentNode)) {
      const newNode = (0, (_nodes || _load_nodes()).createNamespaceNode)(ancestor, node.startPosition);
      // this node is not added to a covering range, because we don't know
      // where this symbol finishes, and this could be in fact a class name
      // in a definition and not a namespace, but we still treat is a namespace
      currentNode.children.push(newNode);
      return newNode;
    }
    return (0, (_collection || _load_collection()).lastFromArray)(currentNode.children);
  }

  _shouldCreateNewNamespaceNode(ancestor, currentNode) {
    return currentNode.children.length === 0 || (0, (_collection || _load_collection()).lastFromArray)(currentNode.children).representativeName !== ancestor;
  }
}