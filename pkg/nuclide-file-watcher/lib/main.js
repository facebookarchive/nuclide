'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _FileWatcher;

function _load_FileWatcher() {
  return _FileWatcher = _interopRequireDefault(require('./FileWatcher'));
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

let subscriptions = null;
let watchers = null;

function activate(state) {
  const _subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  const _watchers = new Map();

  _subscriptions.add(atom.workspace.observeTextEditors(editor => {
    if (_watchers.has(editor)) {
      return;
    }

    const fileWatcher = new (_FileWatcher || _load_FileWatcher()).default(editor);
    _watchers.set(editor, fileWatcher);

    _subscriptions.add(editor.onDidDestroy(() => {
      fileWatcher.destroy();
      _watchers.delete(editor);
    }));
  }));

  watchers = _watchers;
  subscriptions = _subscriptions;
}

function deactivate() {
  if (subscriptions == null || watchers == null) {
    return;
  }
  for (const fileWatcher of watchers.values()) {
    fileWatcher.destroy();
  }
  subscriptions.dispose();
  subscriptions = null;
}