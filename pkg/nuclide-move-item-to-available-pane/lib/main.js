'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;

var _atom = require('atom');

var _move;

function _load_move() {
  return _move = require('./move');
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

class Activation {

  constructor(state) {
    this._disposables = new _atom.CompositeDisposable();
  }

  activate() {
    this._disposables.add(atom.commands.add('atom-text-editor', {
      // Pass the eta expansion of these functions to defer the loading of move.js.
      'nuclide-move-item-to-available-pane:right': event => (0, (_move || _load_move()).moveRight)(event.target),
      'nuclide-move-item-to-available-pane:left': event => (0, (_move || _load_move()).moveLeft)(event.target),
      'nuclide-move-item-to-available-pane:up': event => (0, (_move || _load_move()).moveUp)(event.target),
      'nuclide-move-item-to-available-pane:down': event => (0, (_move || _load_move()).moveDown)(event.target)
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