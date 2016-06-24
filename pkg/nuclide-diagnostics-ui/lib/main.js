'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  DiagnosticUpdater,
  FileMessageUpdate,
  ObservableDiagnosticUpdater,
} from '../../nuclide-diagnostics-base';
import type {DistractionFreeModeProvider} from '../../nuclide-distraction-free-mode';

import invariant from 'assert';
import {CompositeDisposable} from 'atom';

import {track} from '../../nuclide-analytics';

import type DiagnosticsPanel from './DiagnosticsPanel';
import type StatusBarTile from './StatusBarTile';
import type {HomeFragments} from '../../nuclide-home/lib/types';

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

let consumeUpdatesCalled = false;
let consumeObservableUpdatesCalled = false;

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

export function activate(state: ?Object): void {
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
}

export function consumeDiagnosticUpdates(diagnosticUpdater: DiagnosticUpdater): void {
  getStatusBarTile().consumeDiagnosticUpdates(diagnosticUpdater);
  gutterConsumeDiagnosticUpdates(diagnosticUpdater);

  // Currently, the DiagnosticsPanel is designed to work with only one DiagnosticUpdater.
  if (consumeUpdatesCalled) {
    return;
  }
  consumeUpdatesCalled = true;

  tableConsumeDiagnosticUpdates(diagnosticUpdater);
}

export function consumeObservableDiagnosticUpdates(
  diagnosticUpdater: ObservableDiagnosticUpdater,
): void {
  // TODO migrate things from consumeDiagnosticUpdates above
  if (consumeObservableUpdatesCalled) {
    return;
  }
  consumeObservableUpdatesCalled = true;

  addAtomCommands(diagnosticUpdater);
}

function gutterConsumeDiagnosticUpdates(diagnosticUpdater: DiagnosticUpdater): void {
  const {applyUpdateToEditor} = require('./gutter');

  const fixer = diagnosticUpdater.applyFix.bind(diagnosticUpdater);

  invariant(subscriptions != null);
  subscriptions.add(atom.workspace.observeTextEditors((editor: TextEditor) => {
    const filePath = editor.getPath();
    if (!filePath) {
      return; // The file is likely untitled.
    }

    const callback = (update: FileMessageUpdate) => {
      applyUpdateToEditor(editor, update, fixer);
    };
    const disposable = diagnosticUpdater.onFileMessagesDidUpdate(callback, filePath);

    // Be sure to remove the subscription on the DiagnosticStore once the editor is closed.
    editor.onDidDestroy(() => disposable.dispose());
  }));
}

function tableConsumeDiagnosticUpdates(diagnosticUpdater: DiagnosticUpdater): void {
  invariant(subscriptions != null);
  const lazilyCreateTable = createPanel.bind(null, diagnosticUpdater, subscriptions);

  const toggleTable = () => {
    const bottomPanelRef = bottomPanel;
    if (bottomPanelRef == null) {
      lazilyCreateTable();
    } else if (bottomPanelRef.isVisible()) {
      tryRecordActivationState();
      bottomPanelRef.hide();
    } else {
      logPanelIsDisplayed();
      bottomPanelRef.show();
    }
  };

  const showTable = () => {
    if (bottomPanel == null || !bottomPanel.isVisible()) {
      toggleTable();
    }
  };

  subscriptions.add(atom.commands.add(
    atom.views.getView(atom.workspace),
    'nuclide-diagnostics-ui:toggle-table',
    toggleTable,
  ));

  subscriptions.add(atom.commands.add(
    atom.views.getView(atom.workspace),
    'nuclide-diagnostics-ui:show-table',
    showTable,
  ));

  invariant(activationState);
  if (!activationState.hideDiagnosticsPanel) {
    lazilyCreateTable();
  }
}

function addAtomCommands(diagnosticUpdater: ObservableDiagnosticUpdater): void {
  const fixAllInCurrentFile = () => {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return;
    }
    const path = editor.getPath();
    if (path == null) {
      return;
    }
    track('diagnostics-autofix-all-in-file');
    diagnosticUpdater.applyFixesForFile(path);
  };

  invariant(subscriptions != null);

  subscriptions.add(atom.commands.add(
    atom.views.getView(atom.workspace),
    'nuclide-diagnostics-ui:fix-all-in-current-file',
    fixAllInCurrentFile,
  ));

}

export function consumeStatusBar(statusBar: atom$StatusBar): void {
  getStatusBarTile().consumeStatusBar(statusBar);
}

export function consumeToolBar(getToolBar: (group: string) => Object): void {
  toolBar = getToolBar('nuclide-diagnostics-ui');
  toolBar.addButton({
    icon: 'law',
    callback: 'nuclide-diagnostics-ui:toggle-table',
    tooltip: 'Toggle Diagnostics Table',
    priority: 200,
  });
}

export function deactivate(): void {
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
}

export function serialize(): ActivationState {
  tryRecordActivationState();
  invariant(activationState);
  return activationState;
}

export function getHomeFragments(): HomeFragments {
  return {
    feature: {
      title: 'Diagnostics',
      icon: 'law',
      description: 'Displays diagnostics, errors, and lint warnings for your files and projects.',
      command: 'nuclide-diagnostics-ui:show-table',
    },
    priority: 4,
  };
}

export function getDistractionFreeModeProvider(): DistractionFreeModeProvider {
  return {
    name: 'nuclide-diagnostics-ui',
    isVisible(): boolean {
      return bottomPanel != null && bottomPanel.isVisible();
    },
    toggle(): void {
      atom.commands.dispatch(
        atom.views.getView(atom.workspace),
        'nuclide-diagnostics-ui:toggle-table'
      );
    },
  };
}

function logPanelIsDisplayed() {
  track('diagnostics-show-table');
}
