'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RangeUtil = exports.SelectionRange = exports.RangeKey = undefined;

var _FileTreeNode;

function _load_FileTreeNode() {
  return _FileTreeNode = require('./FileTreeNode');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
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

exports.SelectionRange = SelectionRange; /**
                                          * Returns the current node if it is shown.
                                          * Otherwise, returns a nearby node that is shown.
                                          */

function findShownNode(node) {
  if (node.shouldBeShown) {
    return node;
  }

  let shown = node;
  while (shown != null) {
    const next = shown.findNextShownSibling();
    if (next != null) {
      return next;
    }
    shown = shown.parent;
  }

  shown = node;
  while (shown != null) {
    const next = shown.findPrevShownSibling();
    if (next != null) {
      return next;
    }
    shown = shown.parent;
  }
  return null;
}

class RangeUtil {
  /**
   * Returns the current node if it is shown and selected
   * Otherwise, returns a nearby selected node.
   */
  static findSelectedNode(node) {
    const shown = findShownNode(node);
    if (shown == null) {
      return shown;
    }
    if (shown.isSelected) {
      return shown;
    }
    let selected = shown;
    while (selected != null && !selected.isSelected) {
      selected = selected.findNext();
    }
    if (selected != null) {
      return selected;
    }
    selected = shown;
    while (selected != null && !selected.isSelected) {
      selected = selected.findPrevious();
    }
    return selected;
  }
}
exports.RangeUtil = RangeUtil;