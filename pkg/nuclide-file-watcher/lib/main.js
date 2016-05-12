Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var subscriptions = null;
var watchers = null;

function activate(state) {
  var _subscriptions = new (_atom2 || _atom()).CompositeDisposable();
  var _watchers = new Map();

  _subscriptions.add(atom.workspace.observeTextEditors(function (editor) {
    if (_watchers.has(editor)) {
      return;
    }

    var FileWatcher = require('./FileWatcher');
    var fileWatcher = new FileWatcher(editor);
    _watchers.set(editor, fileWatcher);

    _subscriptions.add(editor.onDidDestroy(function () {
      fileWatcher.destroy();
      _watchers.delete(editor);
    }));
  }));

  watchers = _watchers;
  subscriptions = _subscriptions;

  // Disable the file-watcher package from showing the promot, if installed.
  atom.config.set('file-watcher.promptWhenFileHasChangedOnDisk', false);
}

function deactivate() {
  if (subscriptions == null || watchers == null) {
    return;
  }
  for (var fileWatcher of watchers.values()) {
    fileWatcher.destroy();
  }
  subscriptions.dispose();
  subscriptions = null;
}