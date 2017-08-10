'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('nuclide-commons-atom/text-editor');
}

var _BreakpointDisplayController;

function _load_BreakpointDisplayController() {
  return _BreakpointDisplayController = _interopRequireDefault(require('./BreakpointDisplayController'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class BreakpointManager {

  constructor(store, debuggerActions) {
    this._breakpointStore = store;
    this._debuggerActions = debuggerActions;
    this._displayControllers = new Map();
    this._disposables = new _atom.CompositeDisposable((0, (_textEditor || _load_textEditor()).observeTextEditors)(this._handleTextEditor.bind(this)));
  }

  dispose() {
    this._disposables.dispose();
    this._displayControllers.forEach(controller => controller.dispose());
    this._displayControllers.clear();
  }

  /**
   * Used for testing.
   */
  getDisplayControllers() {
    return this._displayControllers;
  }

  /**
   * Delegate callback from BreakpointDisplayController.
   */
  handleTextEditorDestroyed(controller) {
    controller.dispose();
    this._displayControllers.delete(controller.getEditor());
  }

  _handleTextEditor(editor) {
    if (!this._displayControllers.has(editor)) {
      const controller = new (_BreakpointDisplayController || _load_BreakpointDisplayController()).default(this, this._breakpointStore, editor, this._debuggerActions);
      this._displayControllers.set(editor, controller);
    }
  }
}
exports.default = BreakpointManager; /**
                                      * Copyright (c) 2015-present, Facebook, Inc.
                                      * All rights reserved.
                                      *
                                      * This source code is licensed under the license found in the LICENSE file in
                                      * the root directory of this source tree.
                                      *
                                      * 
                                      * @format
                                      */