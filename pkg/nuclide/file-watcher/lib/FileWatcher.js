'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {CompositeDisposable} = require('atom');
var logger = null;

function getLogger() {
  return logger || (logger = require('nuclide-logging').getLogger());
}

class FileWatcher {

  _editor: TextEditor;
  _subscriptions: CompositeDisposable;

  constructor(editor: TextEditor) {
    this._editor = editor;
    this._subscriptions = new CompositeDisposable();
    if (this._editor == null) {
      getLogger().warn('No editor instance on this._editor');
      return;
    }
    this._subscriptions.add(this._editor.onDidConflict(() => {
      if (this._shouldPromptToReload()) {
        getLogger().info('Conflict at file: ' + this._editor.getPath());
        this._promptReload();
      }
    }));
  }

  _shouldPromptToReload(): boolean {
    return this._editor.getBuffer().isInConflict();
  }

  async _promptReload(): Promise {
    var {getPath, basename} = require('nuclide-remote-uri');

    var filePath = this._editor.getPath();
    var encoding = this._editor.getEncoding();
    var fileName = basename(filePath);
    var choice = atom.confirm({
      message: fileName + ' has changed on disk.',
      buttons: ['Reload', 'Compare', 'Ignore'],
    });
    if (choice === 2) {
      return;
    }
    if (choice === 0) {
      var buffer = this._editor.getBuffer();
      if (buffer) {
        buffer.reload();
      }
      return;
    }

    var {getClient} = require('nuclide-client');

    var client = getClient(filePath);
    if (!client) {
      getLogger().error('[file-watcher]: No client found for path:', filePath);
      return;
    }

    // Load the file contents locally or remotely.
    var localFilePath = getPath(filePath);
    var filesystemContents = await client.readFile(localFilePath, encoding);

    // Open a right split pane to compare the contents.
    // TODO: We can use the diff-view here when ready.
    var splitEditor = await atom.workspace.open(null, {split: 'right'});

    splitEditor.insertText(filesystemContents);
    splitEditor.setGrammar(this._editor.getGrammar());
  }

  destroy() {
    if (!this._subscriptions) {
      return;
    }
    this._subscriptions.dispose();
    this._subscriptions = null;
  };
}

module.exports = FileWatcher;
