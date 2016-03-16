'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type BreakpointStore from './BreakpointStore';

const {CompositeDisposable} = require('atom');
const BreakpointDisplayController = require('./BreakpointDisplayController');

class BreakpointManager {
  _breakpointStore: BreakpointStore;
  _displayControllers: Map<atom$TextEditor, BreakpointDisplayController>;
  _disposables: CompositeDisposable;

  constructor(store: BreakpointStore) {
    this._breakpointStore = store;
    this._displayControllers = new Map();
    this._disposables = new CompositeDisposable(
      atom.workspace.observeTextEditors(this._handleTextEditor.bind(this)),
    );
  }

  dispose(): void {
    this._disposables.dispose();
    this._displayControllers.forEach(controller => controller.dispose());
    this._displayControllers.clear();
  }

  /**
   * Used for testing.
   */
  getDisplayControllers(): Map<atom$TextEditor, BreakpointDisplayController> {
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
      // TODO[jeffreytan]: flow does not seem to accept delegate typing,
      // need to ask flow team if this is a known issue.
      // $FlowFixMe
      const controller = new BreakpointDisplayController(this, this._breakpointStore, editor);
      this._displayControllers.set(editor, controller);
    }
  }
}

module.exports = BreakpointManager;
