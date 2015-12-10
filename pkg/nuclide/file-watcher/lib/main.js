'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {CompositeDisposable as CompositeDisposableType} from 'atom';
let subscriptions: ?CompositeDisposableType = null;
let watchers: ?Map = null;

module.exports = {

  activate(state: ?Object): void {
    const {CompositeDisposable} = require('atom');

    const _subscriptions = new CompositeDisposable();
    const _watchers = new Map();

    _subscriptions.add(atom.workspace.observeTextEditors(editor => {
      if (_watchers.has(editor)) {
        return;
      }

      const FileWatcher = require('./FileWatcher');
      const fileWatcher = new FileWatcher(editor);
      _watchers.set(editor, fileWatcher);

      _subscriptions.add(editor.onDidDestroy(() => {
        fileWatcher.destroy();
        _watchers.delete(editor);
      }));
    }));

    watchers = _watchers;
    subscriptions = _subscriptions;

    // Disable the file-watcher package from showing the promot, if installed.
    atom.config.set('file-watcher.promptWhenFileHasChangedOnDisk', false);
  },

  deactivate(): void {
    if (subscriptions == null || watchers == null) {
      return;
    }
    for (const fileWatcher of watchers.values()) {
      fileWatcher.destroy();
    }
    subscriptions.dispose();
    subscriptions = null;
  },
};
