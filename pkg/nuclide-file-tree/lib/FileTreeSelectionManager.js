"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileTreeSelectionManager = void 0;

function Immutable() {
  const data = _interopRequireWildcard(require("immutable"));

  Immutable = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
class FileTreeSelectionManager {
  constructor(emitChange) {
    this._emitChange = emitChange;
    this._selectedNodes = Immutable().Set();
    this._focusedNodes = Immutable().Set();
  }

  selectedNodes() {
    return this._selectedNodes;
  }

  focusedNodes() {
    return this._focusedNodes;
  }

  isSelected(node) {
    return this._selectedNodes.has(node);
  }

  isFocused(node) {
    return this._focusedNodes.has(node);
  }

  _checkSelected(newSelected) {
    if (newSelected !== this._selectedNodes) {
      this._selectedNodes = newSelected;

      this._emitChange();
    }
  }

  _checkFocused(newFocused) {
    if (newFocused !== this._focusedNodes) {
      this._focusedNodes = newFocused;

      this._emitChange();
    }
  }

  select(node) {
    this._checkSelected(this._selectedNodes.add(node));
  }

  unselect(node) {
    this._checkSelected(this._selectedNodes.delete(node));
  }

  focus(node) {
    this._checkFocused(this._focusedNodes.add(node));
  }

  unfocus(node) {
    this._checkFocused(this._focusedNodes.delete(node));
  }

  clearSelected() {
    this._checkSelected(this._selectedNodes.clear());
  }

  clearFocused() {
    this._checkFocused(this._focusedNodes.clear());
  }

  collectDebugState() {
    return {
      _selectedNodes: this._selectedNodes.toArray().map(node => node.uri),
      _focusedNodes: this._focusedNodes.toArray().map(node => node.uri)
    };
  }

}

exports.FileTreeSelectionManager = FileTreeSelectionManager;