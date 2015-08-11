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
var bottomPanel: ?atom$Panel = null;

type ActivationState = {
  hideDiagnosticsPanel: boolean;
};

var activationState: ?ActivationState = null;

function createPanel(diagnosticUpdater: DiagnosticUpdater, disposables: CompositeDisposable) {
  var panel = require('./createPanel').createDiagnosticsPanel(diagnosticUpdater);
  bottomPanel = panel;

  invariant(activationState);
  activationState.hideDiagnosticsPanel = false;

  var onDidChangeVisibleSubscription = panel.onDidChangeVisible((visible: boolean) => {
    invariant(activationState);
    activationState.hideDiagnosticsPanel = !visible;
  });
  disposables.add(onDidChangeVisibleSubscription);
}

module.exports = {
  activate(state: ?ActivationState): void {
    if (subscriptions) {
      return;
    }

    activationState = state || {hideDiagnosticsPanel: false};
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

    var lazilyCreateTable = createPanel.bind(null, diagnosticUpdater, subscriptions);

    var showTableSubscription = atom.commands.add(
      atom.views.getView(atom.workspace),
      'nuclide-diagnostics-ui:toggle-table',
      () => {
        if (!bottomPanel) {
          lazilyCreateTable();
        } else {
          bottomPanel.isVisible() ? bottomPanel.hide() : bottomPanel.show();
        }
      }
    );
    subscriptions.add(showTableSubscription);

    invariant(activationState);
    if (!activationState.hideDiagnosticsPanel) {
      lazilyCreateTable();
    }
  },

  deactivate(): void {
    if (subscriptions) {
      subscriptions.dispose();
      subscriptions = null;
    }

    if (bottomPanel) {
      bottomPanel.destroy();
      bottomPanel = null;
    }
  },

  serialize(): ActivationState {
    invariant(activationState);
    return activationState;
  },
};
