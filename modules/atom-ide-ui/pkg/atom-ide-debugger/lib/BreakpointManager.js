"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _BreakpointDisplayController() {
  const data = _interopRequireDefault(require("./BreakpointDisplayController"));

  _BreakpointDisplayController = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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
class BreakpointManager {
  constructor(service) {
    this._service = service;
    this._displayControllers = new Map();
    this._disposables = new (_UniversalDisposable().default)(atom.workspace.observeTextEditors(this._handleTextEditor.bind(this)));
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
      const controller = new (_BreakpointDisplayController().default)(this, this._service, editor);

      this._displayControllers.set(editor, controller);
    }
  }

}

exports.default = BreakpointManager;