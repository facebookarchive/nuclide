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

var DEFAULT_TABLE_HEIGHT = 200;

var subscriptions: ?CompositeDisposable = null;
var bottomPanel: ?atom$Panel = null;

type ActivationState = {
  hideDiagnosticsPanel: boolean;
  diagnosticsPanelHeight: number;
};

var activationState: ?ActivationState = null;

var diagnosticUpdaterForTable: ?DiagnosticUpdater = null;

function createPanel(diagnosticUpdater: DiagnosticUpdater, disposables: CompositeDisposable) {
  invariant(activationState);
  var panel = require('./createPanel').createDiagnosticsPanel(
    diagnosticUpdater,
    activationState.diagnosticsPanelHeight);
  logPanelIsDisplayed();
  bottomPanel = panel;

  activationState.hideDiagnosticsPanel = false;

  var onDidChangeVisibleSubscription = panel.onDidChangeVisible((visible: boolean) => {
    invariant(activationState);
    activationState.hideDiagnosticsPanel = !visible;
  });
  disposables.add(onDidChangeVisibleSubscription);
}

function tryRecordPanelHeight(): void {
  invariant(activationState);
  if (bottomPanel && bottomPanel.isVisible()) {
    activationState.diagnosticsPanelHeight = bottomPanel.getItem().clientHeight;
  }
}

module.exports = {
  activate(state: ?Object): void {
    if (subscriptions) {
      return;
    }
    subscriptions = new CompositeDisposable();

    // Ensure the integrity of the ActivationState created from state.
    if (!state) {
      state = {};
    }
    if (typeof state.hideDiagnosticsPanel !== 'boolean') {
      state.hideDiagnosticsPanel = false;
    }
    if (typeof state.diagnosticsPanelHeight !== 'number') {
      state.diagnosticsPanelHeight = DEFAULT_TABLE_HEIGHT;
    }
    activationState = state;
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

    // Currently, the DiagnosticsPanel is designed to work with only one DiagnosticUpdater.
    // Therefore, we only create a DiagnosticsPanel for the first call to consumeDiagnosticUpdates.
    if (diagnosticUpdaterForTable) {
      return;
    }
    diagnosticUpdaterForTable = diagnosticUpdater;

    var lazilyCreateTable = createPanel.bind(null, diagnosticUpdater, subscriptions);

    var showTableSubscription = atom.commands.add(
      atom.views.getView(atom.workspace),
      'nuclide-diagnostics-ui:toggle-table',
      () => {
        var bottomPanelRef = bottomPanel;
        if (!bottomPanelRef) {
          lazilyCreateTable();
        } else if (bottomPanelRef.isVisible()) {
          tryRecordPanelHeight();
          bottomPanelRef.hide();
        } else {
          logPanelIsDisplayed();
          bottomPanelRef.show();
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

    diagnosticUpdaterForTable = null;
  },

  serialize(): ActivationState {
    tryRecordPanelHeight();
    invariant(activationState);
    return activationState;
  },
};

function logPanelIsDisplayed() {
  var {track} = require('nuclide-analytics');
  track('diagnostics-show-table');
}
