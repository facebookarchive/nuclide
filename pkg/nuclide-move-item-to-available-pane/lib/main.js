"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _move() {
  const data = require("./move");

  _move = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
class Activation {
  constructor(state) {
    this._disposables = new (_UniversalDisposable().default)();
  }

  activate() {
    this._disposables.add(atom.commands.add('atom-text-editor', {
      // Pass the eta expansion of these functions to defer the loading of move.js.
      'nuclide-move-item-to-available-pane:right': event => (0, _move().moveRight)(event.target),
      'nuclide-move-item-to-available-pane:left': event => (0, _move().moveLeft)(event.target),
      'nuclide-move-item-to-available-pane:up': event => (0, _move().moveUp)(event.target),
      'nuclide-move-item-to-available-pane:down': event => (0, _move().moveDown)(event.target)
    }));
  }

  dispose() {
    this._disposables.dispose();
  }

}

let activation = null;

function activate(state) {
  if (activation == null) {
    activation = new Activation(state);
    activation.activate();
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}