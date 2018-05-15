'use strict';var _UniversalDisposable;













function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../nuclide-commons/UniversalDisposable'));}var _createPackage;
function _load_createPackage() {return _createPackage = _interopRequireDefault(require('../../../../nuclide-commons-atom/createPackage'));}var _Hyperclick;
function _load_Hyperclick() {return _Hyperclick = _interopRequireDefault(require('./Hyperclick'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

// Legacy providers have a default priority of 0.
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
 */function fixLegacyProvider(provider) {if (provider.priority == null) {provider.priority = 0;}return provider;}class Activation {
  constructor() {
    this._hyperclick = new (_Hyperclick || _load_Hyperclick()).default();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._hyperclick);
  }

  dispose() {
    this._disposables.dispose();
  }

  // Legacy providers have a default priority of 0.
  addLegacyProvider(
  provider)
  {
    return this.addProvider(
    Array.isArray(provider) ?
    provider.map(fixLegacyProvider) :
    fixLegacyProvider(provider));

  }

  addProvider(
  provider)
  {
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
    return textEditor =>
    this._hyperclick.observeTextEditor(textEditor);
  }}


(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);