'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var invariant = require('assert');
var {CompositeDisposable} = require('atom');

var subscriptions: ?CompositeDisposable = null;

module.exports = {
  activate(state: ?Object): void {
    if (subscriptions) {
      return;
    }

    subscriptions = new CompositeDisposable();
  },

  consumeDiagnosticUpdates(diagnosticUpdater: DiagnosticUpdater): void {
    invariant(subscriptions);

    var {applyUpdateToEditor} = require('./gutter');

    subscriptions.add(atom.workspace.observeTextEditors((editor: TextEditor) => {
      var filePath = editor.getPath();
      if (!filePath) {
        return; // The file is likely untitled.
      }

      var callback = applyUpdateToEditor.bind(/* receiver */ null, editor);
      var disposable = diagnosticUpdater.onFileMessagesDidUpdate(callback, filePath);

      // Be sure to remove the subscription on the DiagnosticStore once the editor is closed.
      editor.onDidDestroy(() => disposable.dispose());
    }));
  },

  deactivate(): void {
    if (subscriptions) {
      subscriptions.dispose();
      subscriptions = null;
    }
  },
};
