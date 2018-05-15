'use strict';var _UniversalDisposable;














function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../nuclide-commons/UniversalDisposable'));}var _createPackage;
function _load_createPackage() {return _createPackage = _interopRequireDefault(require('../../../../nuclide-commons-atom/createPackage'));}var _SignatureHelpManager;
function _load_SignatureHelpManager() {return _SignatureHelpManager = _interopRequireDefault(require('./SignatureHelpManager'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

class Activation {constructor() {this.

    _manager = null;this.
    _datatipService = null;} // Lazily initialize SignatureHelpManager once we actually get a provider.

  dispose() {
    if (this._manager != null) {
      this._manager.dispose();
    }
  }

  consumeDatatip(datatipService) {
    this._datatipService = datatipService;
    if (this._manager != null) {
      this._manager.setDatatipService(datatipService);
    }
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._datatipService = null;
      if (this._manager != null) {
        this._manager.setDatatipService(null);
      }
    });
  }

  provideSignatureHelp() {
    return provider => {
      const manager = this._getSignatureHelpManager();
      return manager.consumeSignatureHelp(provider);
    };
  }

  _getSignatureHelpManager() {
    if (this._manager != null) {
      return this._manager;
    }
    this._manager = new (_SignatureHelpManager || _load_SignatureHelpManager()).default();
    if (this._datatipService != null) {
      this._manager.setDatatipService(this._datatipService);
    }
    return this._manager;
  }} /**
      * Copyright (c) 2017-present, Facebook, Inc.
      * All rights reserved.
      *
      * This source code is licensed under the BSD-style license found in the
      * LICENSE file in the root directory of this source tree. An additional grant
      * of patent rights can be found in the PATENTS file in the same directory.
      *
      *  strict-local
      * @format
      */(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);