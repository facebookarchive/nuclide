'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseOutlineTree = parseOutlineTree;

var _protocol;

function _load_protocol() {
  return _protocol = require('../../../nuclide-vscode-language-service-rpc/lib/protocol');
}

var _nodes;

function _load_nodes() {
  return _nodes = require('./nodes');
}

var _CqueryOutlineNonVariableProcessor;

function _load_CqueryOutlineNonVariableProcessor() {
  return _CqueryOutlineNonVariableProcessor = require('./processors/CqueryOutlineNonVariableProcessor');
}

var _CqueryOutlineVariableProcessor;

function _load_CqueryOutlineVariableProcessor() {
  return _CqueryOutlineVariableProcessor = require('./processors/CqueryOutlineVariableProcessor');
}

var _SymbolRanges;

function _load_SymbolRanges() {
  return _SymbolRanges = require('./processors/SymbolRanges');
}

var _sanitizers;

function _load_sanitizers() {
  return _sanitizers = require('./sanitizers');
}

var _CqueryOutlineTokenizer;

function _load_CqueryOutlineTokenizer() {
  return _CqueryOutlineTokenizer = require('./tokenizers/CqueryOutlineTokenizer');
}

/**
 * Given a list of outline tree nodes along with the symbols sent by cquery,
 * this creates the corresponding tree structure and sets a more beautiful
 * OutlineTree.tokenizedText
 *
 * For some examples please look at the spec.
 */
function parseOutlineTree(list) {
  const root = (0, (_nodes || _load_nodes()).createNamespaceNode)('');
  const ranges = new (_SymbolRanges || _load_SymbolRanges()).SymbolRanges();
  for (const [symbol, node] of list) {
    parseSymbol(root, ranges, symbol, node);
  }
  return root;
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   *  strict-local
   * @format
   */

function parseSymbol(root, ranges, symbol, node) {
  const containerName = (0, (_sanitizers || _load_sanitizers()).sanitizeSymbol)(symbol.containerName);
  const name = (0, (_sanitizers || _load_sanitizers()).sanitizeSymbol)(symbol.name);
  symbol.name = name;
  symbol.containerName = containerName;
  if (containerName.length === 0 || name.length === 0) {
    return;
  }

  let tokenized = null;
  switch (symbol.kind) {
    case (_protocol || _load_protocol()).SymbolKind.Class:
      tokenized = (0, (_CqueryOutlineTokenizer || _load_CqueryOutlineTokenizer()).asClass)(containerName, name);
      break;
    case (_protocol || _load_protocol()).SymbolKind.Function:
    case (_protocol || _load_protocol()).SymbolKind.Method:
      tokenized = (0, (_CqueryOutlineTokenizer || _load_CqueryOutlineTokenizer()).asFunction)(containerName, name);
      break;
    case (_protocol || _load_protocol()).SymbolKind.Variable:
      tokenized = (0, (_CqueryOutlineTokenizer || _load_CqueryOutlineTokenizer()).asMember)(containerName, name);
      if (tokenized == null) {
        (0, (_CqueryOutlineVariableProcessor || _load_CqueryOutlineVariableProcessor()).processVariable)(root, node, symbol, ranges);
      }
  }
  if (tokenized != null) {
    (0, (_CqueryOutlineNonVariableProcessor || _load_CqueryOutlineNonVariableProcessor()).processNonVariable)(root, tokenized, node, symbol, ranges);
  }
}