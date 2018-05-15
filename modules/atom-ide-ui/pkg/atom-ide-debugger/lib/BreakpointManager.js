'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _UniversalDisposable;













function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../nuclide-commons/UniversalDisposable'));}var _BreakpointDisplayController;
function _load_BreakpointDisplayController() {return _BreakpointDisplayController = _interopRequireDefault(require('./BreakpointDisplayController'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

class BreakpointManager {




  constructor(service) {
    this._service = service;
    this._displayControllers = new Map();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(
    atom.workspace.observeTextEditors(this._handleTextEditor.bind(this)));

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
      const controller = new (_BreakpointDisplayController || _load_BreakpointDisplayController()).default(
      this,
      this._service,
      editor);

      this._displayControllers.set(editor, controller);
    }
  }}exports.default = BreakpointManager; /**
                                          * Copyright (c) 2017-present, Facebook, Inc.
                                          * All rights reserved.
                                          *
                                          * This source code is licensed under the BSD-style license found in the
                                          * LICENSE file in the root directory of this source tree. An additional grant
                                          * of patent rights can be found in the PATENTS file in the same directory.
                                          *
                                          *  strict-local
                                          * @format
                                          */