"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.consumeTypehintProvider = consumeTypehintProvider;
exports.consumeDatatipService = consumeDatatipService;
exports.deactivate = deactivate;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _TypeHintManager() {
  const data = _interopRequireDefault(require("./TypeHintManager"));

  _TypeHintManager = function () {
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
const PACKAGE_NAME = 'nuclide-type-hint';

class Activation {
  constructor(state) {
    this._disposables = new (_UniversalDisposable().default)();

    if (this.typeHintManager == null) {
      this.typeHintManager = new (_TypeHintManager().default)();
    }
  }

  consumeTypehintProvider(provider) {
    if (!this.typeHintManager) {
      throw new Error("Invariant violation: \"this.typeHintManager\"");
    }

    this.typeHintManager.addProvider(provider);
    return new (_UniversalDisposable().default)(() => {
      if (this.typeHintManager != null) {
        this.typeHintManager.removeProvider(provider);
      }
    });
  }

  consumeDatatipService(service) {
    if (!this.typeHintManager) {
      throw new Error("Invariant violation: \"this.typeHintManager\"");
    }

    const datatip = this.typeHintManager.datatip.bind(this.typeHintManager);
    const datatipProvider = {
      providerName: PACKAGE_NAME,
      priority: 1,
      datatip
    };
    const disposable = service.addProvider(datatipProvider);

    this._disposables.add(disposable);

    return disposable;
  }

  dispose() {
    this._disposables.dispose();
  }

}

let activation = null;

function activate(state) {
  activation = new Activation(state);
}

function consumeTypehintProvider(provider) {
  if (!activation) {
    throw new Error("Invariant violation: \"activation\"");
  }

  return activation.consumeTypehintProvider(provider);
}

function consumeDatatipService(service) {
  if (!activation) {
    throw new Error("Invariant violation: \"activation\"");
  }

  return activation.consumeDatatipService(service);
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}