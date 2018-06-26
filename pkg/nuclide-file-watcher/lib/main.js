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

function activate(state) {
  const _subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  const _watchers = new WeakSet();

  _subscriptions.add(atom.workspace.observeTextEditors(editor => {
    if (_watchers.has(editor)) {
      return;
    }

    const fileWatcher = new (_FileWatcher || _load_FileWatcher()).default(editor);
    _watchers.add(editor);
    _subscriptions.addUntilDestroyed(editor, () => fileWatcher.destroy());
  }));

  subscriptions = _subscriptions;
}

function deactivate() {
  if (subscriptions == null) {
    return;
  }
  subscriptions.dispose();
  subscriptions = null;
}