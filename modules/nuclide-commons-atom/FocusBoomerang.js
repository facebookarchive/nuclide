"use strict";Object.defineProperty(exports, "__esModule", { value: true });
















class FocusBoomerang {


  recordFocus() {
    if (this._focus != null) {
      return;
    }

    this._focus = {
      node: document.activeElement,
      pane: atom.workspace.getActivePane() };

  }

  returnFocus() {
    if (this._focus == null) {
      return;
    }
    const { node, pane } = this._focus;
    if (node != null && document.body != null && document.body.contains(node)) {
      node.focus();
      return;
    }
    if (pane != null) {
      pane.activate();
    }
  }}exports.default = FocusBoomerang; /**
                                       * Copyright (c) 2017-present, Facebook, Inc.
                                       * All rights reserved.
                                       *
                                       * This source code is licensed under the BSD-style license found in the
                                       * LICENSE file in the root directory of this source tree. An additional grant
                                       * of patent rights can be found in the PATENTS file in the same directory.
                                       *
                                       *  strict
                                       * @format
                                       */