"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SelectionRange = exports.RangeKey = void 0;

function _FileTreeNode() {
  const data = require("./FileTreeNode");

  _FileTreeNode = function () {
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
class RangeKey {
  constructor(rootKey, nodeKey) {
    this._rootKey = rootKey;
    this._nodeKey = nodeKey;
  }

  static of(node) {
    return new RangeKey(node.rootUri, node.uri);
  }

  rootKey() {
    return this._rootKey;
  }

  nodeKey() {
    return this._nodeKey;
  }

  equals(other) {
    return this._rootKey === other._rootKey && this._nodeKey === other._nodeKey;
  }

}

exports.RangeKey = RangeKey;

class SelectionRange {
  constructor(anchor, range) {
    this._anchor = anchor;
    this._range = range;
  }

  anchor() {
    return this._anchor;
  }

  range() {
    return this._range;
  }

  static ofSingleItem(anchor) {
    return new SelectionRange(anchor, anchor);
  }

  withNewRange(range) {
    return new SelectionRange(this._anchor, range);
  }

  withNewAnchor(anchor) {
    return new SelectionRange(anchor, this._range);
  }

  equals(other) {
    return this._anchor.equals(other._anchor) && this._range.equals(other._range);
  }

}

exports.SelectionRange = SelectionRange;