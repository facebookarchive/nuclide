'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {CompositeDisposable, TextEditor} = require('atom');
var BreakpointDisplayController = require('./BreakpointDisplayController.js');
/* eslint-disable no-unused-vars */
var BreakpointStore = require('./BreakpointStore');
/* eslint-enable no-unused-vars */

class BreakpointManager {
  _breakpointStore: BreakpointStore;
  _displayControllers: Map<atom$TextEditor, BreakpointDisplayController>;
  _disposables: CompositeDisposable;

  constructor(store: BreakpointStore) {
    this._breakpointStore = store;
    this._displayControllers = new Map();
    this._disposables = new CompositeDisposable();

    this._disposables.add(atom.workspace.observeTextEditors(this._handleTextEditor.bind(this)));
  }

  dispose(): void {
    this._disposables.dispose();
    this._displayControllers.forEach(controller => controller.dispose());
    this._displayControllers.clear();
  }

  /**
   * Used for testing.
   */
  getDisplayControllers(): Set<BreakpointDisplayController> {
    return this._displayControllers;
  }

  /**
   * Delegate callback from BreakpointDisplayController.
   */
  handleTextEditorDestroyed(controller: BreakpointDisplayController) {
    controller.dispose();
    this._displayControllers.delete(controller.getEditor());
  }

  _handleTextEditor(editor: atom$TextEditor) {
    if (!this._displayControllers.has(editor)) {
      var controller = new BreakpointDisplayController(this, this._breakpointStore, editor);
      this._displayControllers.set(editor, controller);
    }
  }
}

module.exports = BreakpointManager;
