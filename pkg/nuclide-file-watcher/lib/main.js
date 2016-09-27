Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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

var _FileWatcher2;

function _FileWatcher() {
  return _FileWatcher2 = _interopRequireDefault(require('./FileWatcher'));
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

    var fileWatcher = new (_FileWatcher2 || _FileWatcher()).default(editor);
    _watchers.set(editor, fileWatcher);

    _subscriptions.add(editor.onDidDestroy(function () {
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
  for (var fileWatcher of watchers.values()) {
    fileWatcher.destroy();
  }
  subscriptions.dispose();
  subscriptions = null;
}