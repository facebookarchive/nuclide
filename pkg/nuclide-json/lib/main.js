'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.provideOutlines = provideOutlines;
exports.getHyperclickProvider = getHyperclickProvider;
exports.provideCodeFormat = provideCodeFormat;

var _atom = require('atom');

var _JSONOutlineProvider;

function _load_JSONOutlineProvider() {
  return _JSONOutlineProvider = require('./JSONOutlineProvider');
}

var _NPMHyperclickProvider;

function _load_NPMHyperclickProvider() {
  return _NPMHyperclickProvider = require('./NPMHyperclickProvider');
}

var _CodeFormatHelpers;

function _load_CodeFormatHelpers() {
  return _CodeFormatHelpers = _interopRequireDefault(require('./CodeFormatHelpers'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {

  constructor(state) {
    this._disposables = new _atom.CompositeDisposable();
  }

  dispose() {
    this._disposables.dispose();
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

let activation = null;

function activate(state) {
  if (activation == null) {
    activation = new Activation(state);
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

function provideOutlines() {
  return {
    grammarScopes: ['source.json'],
    priority: 1,
    name: 'Nuclide JSON',
    getOutline(editor) {
      return Promise.resolve((0, (_JSONOutlineProvider || _load_JSONOutlineProvider()).getOutline)(editor.getText()));
    }
  };
}

function getHyperclickProvider() {
  return (0, (_NPMHyperclickProvider || _load_NPMHyperclickProvider()).getNPMHyperclickProvider)();
}

function provideCodeFormat() {
  return {
    grammarScopes: ['source.json'],
    priority: 1,
    formatEntireFile(editor, range) {
      return (_CodeFormatHelpers || _load_CodeFormatHelpers()).default.formatEntireFile(editor, range);
    }
  };
}