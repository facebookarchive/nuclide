/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type DebuggerModel from './DebuggerModel';
import type DebuggerActions from './DebuggerActions';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {observeTextEditors} from 'nuclide-commons-atom/text-editor';
import BreakpointDisplayController from './BreakpointDisplayController';

export default class BreakpointManager {
  _debuggerActions: DebuggerActions;
  _model: DebuggerModel;
  _displayControllers: Map<atom$TextEditor, BreakpointDisplayController>;
  _disposables: UniversalDisposable;

  constructor(debuggerActions: DebuggerActions, model: DebuggerModel) {
    this._debuggerActions = debuggerActions;
    this._model = model;
    this._displayControllers = new Map();
    this._disposables = new UniversalDisposable(
      observeTextEditors(this._handleTextEditor.bind(this)),
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
      const controller = new BreakpointDisplayController(
        this,
        this._model,
        editor,
        this._debuggerActions,
      );
      this._displayControllers.set(editor, controller);
    }
  }
}
