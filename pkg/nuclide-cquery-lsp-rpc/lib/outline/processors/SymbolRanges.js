'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SymbolRanges = undefined;

var _protocol;

function _load_protocol() {
  return _protocol = require('../../../../nuclide-vscode-language-service-rpc/lib/protocol');
}

var _symbols;

function _load_symbols() {
  return _symbols = require('../symbols');
}

/**
 * Class that handles the symbol ranges that have already been processed. It's
 * useful for determining the parents of certain symbols by looking at the
 * ranges.
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

class SymbolRanges {
  constructor() {
    this._functions = [];
    this._structuredObjects = [];
    this._variables = [];
  } // namespaces, classes, structs, etc.


  addSymbol(symbol, node) {
    if ((0, (_symbols || _load_symbols()).isFunction)(symbol)) {
      this._functions.push([symbol.location.range, node]);
    } else if (symbol.kind === (_protocol || _load_protocol()).SymbolKind.Variable) {
      this._variables.push([symbol.location.range, node]);
    } else {
      this._structuredObjects.push([symbol.location.range, node]);
    }
  }

  /**
   * 0: the ranges intersect
   * 1: range1 is strictly before range2
   * 2: range2 is strictly after range1
   */
  _compareRanges(range1, range2) {
    const isLess = (a, b) => a.end.line < b.start.line || a.end.line === b.start.line && a.end.character < b.start.character;
    return isLess(range1, range2) ? -1 : isLess(range2, range1) ? 1 : 0;
  }

  findParentFunction(range) {
    for (let i = this._functions.length - 1; i >= 0; i--) {
      const [containerRange, node] = this._functions[i];
      const cmp = this._compareRanges(containerRange, range);
      if (cmp === 0) {
        return node;
      }
      if (cmp < 0) {
        // from this point on, all the functions are above the current symbol
        break;
      }
    }
    return null;
  }

  /**
   * This happens for cases in obj-c like this one
   *   @property (atomic, copy) NSString* threadKey;
   * where the property defines several symbols, e.g. _threadKey, threadKey,
   * setThreadKey, etc. in an overlapping range with the initial symbol
   */
  findOverlappingVariable(range) {
    for (let i = this._variables.length - 1; i >= 0; i--) {
      const [containerRange, node] = this._variables[i];
      const cmp = this._compareRanges(containerRange, range);
      if (cmp === 0) {
        return node;
      }
      if (cmp < 0) {
        // from this point on, all the variables are above the current symbol
        break;
      }
    }
    return null;
  }

  findStructuredObjectParent(range) {
    for (let i = this._structuredObjects.length - 1; i >= 0; i--) {
      const [containerRange, parent] = this._structuredObjects[i];
      if (this._compareRanges(containerRange, range) === 0) {
        return parent;
      }
    }
    return null;
  }
}
exports.SymbolRanges = SymbolRanges;