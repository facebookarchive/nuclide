"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseOutlineTree = parseOutlineTree;

function _protocol() {
  const data = require("../../../nuclide-vscode-language-service-rpc/lib/protocol");

  _protocol = function () {
    return data;
  };

  return data;
}

function _nodes() {
  const data = require("./nodes");

  _nodes = function () {
    return data;
  };

  return data;
}

function _CqueryOutlineNonVariableProcessor() {
  const data = require("./processors/CqueryOutlineNonVariableProcessor");

  _CqueryOutlineNonVariableProcessor = function () {
    return data;
  };

  return data;
}

function _CqueryOutlineVariableProcessor() {
  const data = require("./processors/CqueryOutlineVariableProcessor");

  _CqueryOutlineVariableProcessor = function () {
    return data;
  };

  return data;
}

function _SymbolRanges() {
  const data = require("./processors/SymbolRanges");

  _SymbolRanges = function () {
    return data;
  };

  return data;
}

function _sanitizers() {
  const data = require("./sanitizers");

  _sanitizers = function () {
    return data;
  };

  return data;
}

function _CqueryOutlineTokenizer() {
  const data = require("./tokenizers/CqueryOutlineTokenizer");

  _CqueryOutlineTokenizer = function () {
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
 * Given a list of outline tree nodes along with the symbols sent by cquery,
 * this creates the corresponding tree structure and sets a more beautiful
 * OutlineTree.tokenizedText
 *
 * For some examples please look at the spec.
 */
function parseOutlineTree(list) {
  const root = (0, _nodes().createNamespaceNode)('');
  const ranges = new (_SymbolRanges().SymbolRanges)();

  for (const [symbol, node] of list) {
    parseSymbol(root, ranges, symbol, node);
  }

  return root;
}

function parseSymbol(root, ranges, symbol, node) {
  const containerName = (0, _sanitizers().sanitizeSymbol)(symbol.containerName);
  const name = (0, _sanitizers().sanitizeSymbol)(symbol.name);
  symbol.name = name;
  symbol.containerName = containerName;

  if (containerName.length === 0 || name.length === 0) {
    return;
  }

  let tokenized = null;

  switch (symbol.kind) {
    case _protocol().SymbolKind.Class:
      tokenized = (0, _CqueryOutlineTokenizer().asClass)(containerName, name);
      break;

    case _protocol().SymbolKind.Function:
    case _protocol().SymbolKind.Method:
      tokenized = (0, _CqueryOutlineTokenizer().asFunction)(containerName, name);
      break;

    case _protocol().SymbolKind.Variable:
      tokenized = (0, _CqueryOutlineTokenizer().asMember)(containerName, name);

      if (tokenized == null) {
        (0, _CqueryOutlineVariableProcessor().processVariable)(root, node, symbol, ranges);
      }

  }

  if (tokenized != null) {
    (0, _CqueryOutlineNonVariableProcessor().processNonVariable)(root, tokenized, node, symbol, ranges);
  }
}