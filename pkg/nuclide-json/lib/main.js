"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.provideOutlines = provideOutlines;
exports.getHyperclickProvider = getHyperclickProvider;
exports.provideCodeFormat = provideCodeFormat;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _JSONOutlineProvider() {
  const data = require("./JSONOutlineProvider");

  _JSONOutlineProvider = function () {
    return data;
  };

  return data;
}

function _NPMHyperclickProvider() {
  const data = require("./NPMHyperclickProvider");

  _NPMHyperclickProvider = function () {
    return data;
  };

  return data;
}

function _CodeFormatHelpers() {
  const data = _interopRequireDefault(require("./CodeFormatHelpers"));

  _CodeFormatHelpers = function () {
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

  dispose() {
    this._disposables.dispose();
  }

}

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
      return Promise.resolve((0, _JSONOutlineProvider().getOutline)(editor.getText()));
    }

  };
}

function getHyperclickProvider() {
  return (0, _NPMHyperclickProvider().getNPMHyperclickProvider)();
}

function provideCodeFormat() {
  return {
    grammarScopes: ['source.json'],
    priority: 1,

    formatEntireFile(editor, range) {
      return _CodeFormatHelpers().default.formatEntireFile(editor, range);
    }

  };
}