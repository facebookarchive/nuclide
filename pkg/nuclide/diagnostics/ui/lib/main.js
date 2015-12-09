'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DiagnosticUpdater} from '../../base';

import invariant from 'assert';
import {CompositeDisposable} from 'atom';

import type DiagnosticsPanel from './DiagnosticsPanel';
import type StatusBarTile from './StatusBarTile';
import type {HomeFragments} from '../../../home-interfaces';

const DEFAULT_HIDE_DIAGNOSTICS_PANEL = true;
const DEFAULT_TABLE_HEIGHT = 200;
const DEFAULT_FILTER_BY_ACTIVE_EDITOR = false;
const LINTER_PACKAGE = 'linter';

let subscriptions: ?CompositeDisposable = null;
let bottomPanel: ?atom$Panel = null;
let getDiagnosticsPanel: ?(() => ?DiagnosticsPanel);
let statusBarTile: ?StatusBarTile;

type ActivationState = {
  hideDiagnosticsPanel: boolean;
  diagnosticsPanelHeight: number;
  filterByActiveTextEditor: boolean;
};

let activationState: ?ActivationState = null;

let diagnosticUpdaterForTable: ?DiagnosticUpdater = null;

function createPanel(diagnosticUpdater: DiagnosticUpdater, disposables: CompositeDisposable) {
  invariant(activationState);
  const {
    atomPanel: panel,
    getDiagnosticsPanel: getDiagnosticsPanelFn,
    setWarnAboutLinter,
  } = require('./createPanel').createDiagnosticsPanel(
    diagnosticUpdater,
    activationState.diagnosticsPanelHeight,
    activationState.filterByActiveTextEditor,
    disableLinter);
  logPanelIsDisplayed();
  bottomPanel = panel;
  getDiagnosticsPanel = getDiagnosticsPanelFn;

  activationState.hideDiagnosticsPanel = false;

  const onDidChangeVisibleSubscription = panel.onDidChangeVisible((visible: boolean) => {
    invariant(activationState);
    activationState.hideDiagnosticsPanel = !visible;
  });
  disposables.add(onDidChangeVisibleSubscription);

  watchForLinter(setWarnAboutLinter, disposables);
}

function disableLinter() {
  atom.packages.disablePackage(LINTER_PACKAGE);
}

function watchForLinter(
    setWarnAboutLinter: (warn: boolean) => void,
    disposables: CompositeDisposable): void {
  if (atom.packages.isPackageActive(LINTER_PACKAGE)) {
    setWarnAboutLinter(true);
  }
  disposables.add(atom.packages.onDidActivatePackage(pkg => {
    if (pkg.name === LINTER_PACKAGE) {
      setWarnAboutLinter(true);
    }
  }));
  disposables.add(atom.packages.onDidDeactivatePackage(pkg => {
    if (pkg.name === LINTER_PACKAGE) {
      setWarnAboutLinter(false);
    }
  }));
}

function getStatusBarTile(): StatusBarTile {
  if (!statusBarTile) {
    statusBarTile = new (require('./StatusBarTile'))();
  }
  return statusBarTile;
}

function tryRecordActivationState(): void {
  invariant(activationState);
  if (bottomPanel && bottomPanel.isVisible()) {
    activationState.diagnosticsPanelHeight = bottomPanel.getItem().clientHeight;

    invariant(getDiagnosticsPanel);
    const diagnosticsPanel = getDiagnosticsPanel();
    if (diagnosticsPanel) {
      activationState.filterByActiveTextEditor = diagnosticsPanel.props.filterByActiveTextEditor;
    }
  }
}

let toolBar: ?any = null;

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
      state.hideDiagnosticsPanel = DEFAULT_HIDE_DIAGNOSTICS_PANEL;
    }
    if (typeof state.diagnosticsPanelHeight !== 'number') {
      state.diagnosticsPanelHeight = DEFAULT_TABLE_HEIGHT;
    }
    if (typeof state.filterByActiveTextEditor !== 'boolean') {
      state.filterByActiveTextEditor = DEFAULT_FILTER_BY_ACTIVE_EDITOR;
    }
    activationState = state;
  },

  consumeDiagnosticUpdates(diagnosticUpdater: DiagnosticUpdater): void {
    getStatusBarTile().consumeDiagnosticUpdates(diagnosticUpdater);

    const {applyUpdateToEditor} = require('./gutter');

    invariant(subscriptions);
    subscriptions.add(atom.workspace.observeTextEditors((editor: TextEditor) => {
      const filePath = editor.getPath();
      if (!filePath) {
        return; // The file is likely untitled.
      }

      const callback = applyUpdateToEditor.bind(/* receiver */ null, editor);
      const disposable = diagnosticUpdater.onFileMessagesDidUpdate(callback, filePath);

      // Be sure to remove the subscription on the DiagnosticStore once the editor is closed.
      editor.onDidDestroy(() => disposable.dispose());
    }));

    // Currently, the DiagnosticsPanel is designed to work with only one DiagnosticUpdater.
    // Therefore, we only create a DiagnosticsPanel for the first call to consumeDiagnosticUpdates.
    if (diagnosticUpdaterForTable) {
      return;
    }
    diagnosticUpdaterForTable = diagnosticUpdater;

    const lazilyCreateTable = createPanel.bind(null, diagnosticUpdater, subscriptions);

    const showTableSubscription = atom.commands.add(
      atom.views.getView(atom.workspace),
      'nuclide-diagnostics-ui:toggle-table',
      () => {
        const bottomPanelRef = bottomPanel;
        if (!bottomPanelRef) {
          lazilyCreateTable();
        } else if (bottomPanelRef.isVisible()) {
          tryRecordActivationState();
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

  consumeStatusBar(statusBar: atom$StatusBar): void {
    getStatusBarTile().consumeStatusBar(statusBar);
  },

  consumeToolBar(getToolBar: (group: string) => Object): void {
    toolBar = getToolBar('nuclide-diagnostics-ui');
    toolBar.addButton({
      icon: 'law',
      callback: 'nuclide-diagnostics-ui:toggle-table',
      tooltip: 'Toggle Diagnostics Table',
      priority: 200,
    });
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

    if (statusBarTile) {
      statusBarTile.dispose();
      statusBarTile = null;
    }

    if (toolBar) {
      toolBar.removeItems();
    }

    diagnosticUpdaterForTable = null;
  },

  serialize(): ActivationState {
    tryRecordActivationState();
    invariant(activationState);
    return activationState;
  },

  getHomeFragments(): HomeFragments {
    return {
      feature: {
        title: 'Diagnostics',
        icon: 'law',
        description: 'Displays diagnostics, errors, and lint warnings for your files and projects.',
        command: 'nuclide-diagnostics-ui:toggle-table',
      },
      priority: 4,
    };
  },

};

function logPanelIsDisplayed() {
  const {track} = require('../../../analytics');
  track('diagnostics-show-table');
}
