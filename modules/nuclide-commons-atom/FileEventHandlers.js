"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerOnWillSave = registerOnWillSave;
exports.observeTextEditors = observeTextEditors;

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _analytics() {
  const data = require("../nuclide-commons/analytics");

  _analytics = function () {
    return data;
  };

  return data;
}

function _ProviderRegistry() {
  const data = _interopRequireDefault(require("./ProviderRegistry"));

  _ProviderRegistry = function () {
    return data;
  };

  return data;
}

function _textEdit() {
  const data = require("./text-edit");

  _textEdit = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
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
// Timeouts if providers don't all finish in 5 seconds.
const GLOBAL_SAVE_TIMEOUT_MS = 5000;
const onWillSaveProviders = new (_ProviderRegistry().default)(); // Returns an observable of booleans, each of which indicates whether the
// formatting text edits from a given provider was successfully applied or not.

function onWillSave(editor) {
  if (editor.getPath() == null) {
    return _rxjsCompatUmdMin.Observable.empty();
  }

  const providers = Array.from(onWillSaveProviders.getAllProvidersForEditor(editor)); // NOTE: concat() is used here to subscribe to providers sequentially and
  // apply their text edits in order.

  return _rxjsCompatUmdMin.Observable.concat(...providers.map(provider => provider.callback(editor).toArray().race(_rxjsCompatUmdMin.Observable.of([]).delay(provider.timeout)).map(edits => {
    const success = (0, _textEdit().applyTextEditsToBuffer)(editor.getBuffer(), edits);
    return success;
  })));
} // HACK: intercept the real TextEditor.save and handle it ourselves.
// Atom has no way of injecting content into the buffer asynchronously
// before a save operation.
// If we try to format after the save, and then save again,
// it's a poor user experience (and also races the text buffer's reload).


function patchEditorSave(editor) {
  const realSave = editor.save;
  const editor_ = editor;

  editor_.save = async () => {
    const timeout = new Date();
    timeout.setTime(timeout.getTime() + GLOBAL_SAVE_TIMEOUT_MS);

    try {
      await onWillSave(editor_).timeout(timeout).toPromise();
    } catch (e) {
      const providers = Array.from(onWillSaveProviders.getAllProvidersForEditor(editor_));
      (0, _analytics().track)('timeout-on-save', {
        uri: editor.getPath(),
        providers
      });
    } finally {
      await realSave.call(editor);
    }
  };

  return new (_UniversalDisposable().default)(() => {
    editor_.save = realSave;
  });
}

function registerOnWillSave(provider) {
  return onWillSaveProviders.addProvider(provider);
}

function observeTextEditors() {
  const disposables = new (_UniversalDisposable().default)();
  disposables.add(atom.workspace.observeTextEditors(editor => {
    disposables.add(patchEditorSave(editor));
  }));
  return disposables;
}