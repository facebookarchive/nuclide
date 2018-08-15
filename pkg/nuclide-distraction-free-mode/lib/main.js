"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.serialize = serialize;
exports.consumeDistractionFreeModeProvider = consumeDistractionFreeModeProvider;
exports.consumeToolBar = consumeToolBar;

function _analytics() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/analytics"));

  _analytics = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _DistractionFreeMode() {
  const data = require("./DistractionFreeMode");

  _DistractionFreeMode = function () {
    return data;
  };

  return data;
}

function _BuiltinProviders() {
  const data = require("./BuiltinProviders");

  _BuiltinProviders = function () {
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
    this._tunnelVision = new (_DistractionFreeMode().DistractionFreeMode)(state);

    this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-distraction-free-mode:toggle', () => {
      _analytics().default.track('distraction-free-mode:toggle');

      this._tunnelVision.toggleDistractionFreeMode();
    }));
  }

  dispose() {
    this._disposables.dispose();
  }

  serialize() {
    return this._tunnelVision.serialize();
  }

  consumeDistractionFreeModeProvider(providerOrList) {
    const providers = Array.isArray(providerOrList) ? providerOrList : [providerOrList];
    return new (_UniversalDisposable().default)(...providers.map(provider => this._tunnelVision.consumeDistractionFreeModeProvider(provider)));
  }

  consumeToolBar(getToolBar) {
    const toolBar = getToolBar('nuclide-distraction-free-mode');
    toolBar.addSpacer({
      priority: 900
    });
    toolBar.addButton({
      icon: 'eye',
      callback: 'nuclide-distraction-free-mode:toggle',
      tooltip: 'Toggle Distraction-Free Mode',
      priority: 901
    });
    const disposable = new (_UniversalDisposable().default)(() => {
      toolBar.removeItems();
    });

    this._disposables.add(disposable);

    return disposable;
  }

}

let activation = null;

function activate(state) {
  if (activation == null) {
    activation = new Activation(state);

    for (const provider of (0, _BuiltinProviders().getBuiltinProviders)()) {
      activation.consumeDistractionFreeModeProvider(provider);
    }
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

function serialize() {
  if (!(activation != null)) {
    throw new Error("Invariant violation: \"activation != null\"");
  }

  return activation.serialize();
}

function consumeDistractionFreeModeProvider(provider) {
  if (!(activation != null)) {
    throw new Error("Invariant violation: \"activation != null\"");
  }

  return activation.consumeDistractionFreeModeProvider(provider);
}

function consumeToolBar(getToolBar) {
  if (!(activation != null)) {
    throw new Error("Invariant violation: \"activation != null\"");
  }

  return activation.consumeToolBar(getToolBar);
}