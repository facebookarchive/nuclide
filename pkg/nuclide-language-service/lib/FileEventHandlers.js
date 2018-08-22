"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerOnWillSave = registerOnWillSave;
exports.observeTextEditors = observeTextEditors;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _ProviderRegistry() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/ProviderRegistry"));

  _ProviderRegistry = function () {
    return data;
  };

  return data;
}

function _textEdit() {
  const data = require("../../../modules/nuclide-commons-atom/text-edit");

  _textEdit = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
const onWillSaveProviders = new (_ProviderRegistry().default)();

function onWillSave(editor) {
  return editor.getBuffer().onWillSave(async _ => {
    const providers = Array.from(onWillSaveProviders.getAllProvidersForEditor(editor));
    const textEdits = await Promise.all(providers.map(async provider => provider.callback(editor).toArray().race(_RxMin.Observable.of([]).delay(provider.timeout)).toPromise()));
    const path = editor.getPath();

    if (path != null) {
      await (0, _textEdit().applyTextEdits)(path, ...(0, _collection().arrayFlatten)(textEdits));
    }
  });
}

function registerOnWillSave(provider) {
  return onWillSaveProviders.addProvider(provider);
}

function observeTextEditors() {
  const disposables = new (_UniversalDisposable().default)();
  disposables.add(atom.workspace.observeTextEditors(editor => {
    disposables.add(onWillSave(editor));
  }));
  return disposables;
}