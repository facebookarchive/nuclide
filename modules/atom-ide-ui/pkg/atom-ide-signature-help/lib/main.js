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

function _SignatureHelpManager() {
  const data = _interopRequireDefault(require("./SignatureHelpManager"));

  _SignatureHelpManager = function () {
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
class Activation {
  constructor() {
    this._manager = null;
    this._datatipService = null;
  }

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

    return new (_UniversalDisposable().default)(() => {
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

    this._manager = new (_SignatureHelpManager().default)();

    if (this._datatipService != null) {
      this._manager.setDatatipService(this._datatipService);
    }

    return this._manager;
  }

}

(0, _createPackage().default)(module.exports, Activation);