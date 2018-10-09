"use strict";

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _createPackage() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _Hyperclick() {
  const data = _interopRequireDefault(require("./Hyperclick"));

  _Hyperclick = function () {
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
 * 
 * @format
 */
// Legacy providers have a default priority of 0.
function fixLegacyProvider(provider) {
  if (provider.priority == null) {
    provider.priority = 0;
  }

  return provider;
}

class Activation {
  constructor() {
    this._hyperclick = new (_Hyperclick().default)();
    this._disposables = new (_UniversalDisposable().default)(this._hyperclick);
  }

  dispose() {
    this._disposables.dispose();
  } // Legacy providers have a default priority of 0.


  addLegacyProvider(provider) {
    return this.addProvider(Array.isArray(provider) ? provider.map(fixLegacyProvider) : fixLegacyProvider(provider));
  }

  addProvider(provider) {
    const disposable = this._hyperclick.addProvider(provider);

    this._disposables.add(disposable);

    return disposable;
  }
  /**
   * A TextEditor whose creation is announced via atom.workspace.observeTextEditors() will be
   * observed by default by hyperclick. However, if a TextEditor is created via some other means,
   * (such as a building block for a piece of UI), then it must be observed explicitly.
   */


  observeTextEditor() {
    return textEditor => this._hyperclick.observeTextEditor(textEditor);
  }

}

(0, _createPackage().default)(module.exports, Activation);