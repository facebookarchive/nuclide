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
  FileMessageUpdate,
  ObservableDiagnosticUpdater,
} from '../../nuclide-diagnostics-common';
import type {
  FileDiagnosticMessage,
} from '../../nuclide-diagnostics-common/lib/rpc-types';
import type {DistractionFreeModeProvider} from '../../nuclide-distraction-free-mode';
import type {GetToolBar} from '../../commons-atom/suda-tool-bar';

import invariant from 'assert';
import {CompositeDisposable, Disposable} from 'atom';

import {track} from '../../nuclide-analytics';

import type {HomeFragments} from '../../nuclide-home/lib/types';

import UniversalDisposable from '../../commons-node/UniversalDisposable';
import createDiagnosticsPanel from './createPanel';
import StatusBarTile from './StatusBarTile';
import {applyUpdateToEditor} from './gutter';
import {goToLocation} from '../../commons-atom/go-to-location';

const DEFAULT_HIDE_DIAGNOSTICS_PANEL = true;
const DEFAULT_TABLE_HEIGHT = 200;
const DEFAULT_FILTER_BY_ACTIVE_EDITOR = false;
const LINTER_PACKAGE = 'linter';

let subscriptions: ?CompositeDisposable = null;
let bottomPanel: ?atom$Panel = null;
let statusBarTile: ?StatusBarTile;

type ActivationState = {
  hideDiagnosticsPanel: boolean,
  diagnosticsPanelHeight: number,
  filterByActiveTextEditor: boolean,
};

let activationState: ?ActivationState = null;

let consumeUpdatesCalled = false;

function createPanel(diagnosticUpdater: ObservableDiagnosticUpdater): IDisposable {
  invariant(activationState);
  const {
    atomPanel: panel,
    setWarnAboutLinter,
  } = createDiagnosticsPanel(
    diagnosticUpdater.allMessageUpdates,
    activationState.diagnosticsPanelHeight,
    activationState.filterByActiveTextEditor,
    disableLinter,
    filterByActiveTextEditor => {
      if (activationState != null) {
        activationState.filterByActiveTextEditor = filterByActiveTextEditor;
      }
    },
  );
  logPanelIsDisplayed();
  bottomPanel = panel;

  return new CompositeDisposable(
    panel.onDidChangeVisible((visible: boolean) => {
      invariant(activationState);
      activationState.hideDiagnosticsPanel = !visible;
    }),
    watchForLinter(setWarnAboutLinter),
  );
}

function disableLinter() {
  atom.packages.disablePackage(LINTER_PACKAGE);
}

function watchForLinter(setWarnAboutLinter: (warn: boolean) => void): IDisposable {
  if (atom.packages.isPackageActive(LINTER_PACKAGE)) {
    setWarnAboutLinter(true);
  }
  return new CompositeDisposable(
    atom.packages.onDidActivatePackage(pkg => {
      if (pkg.name === LINTER_PACKAGE) {
        setWarnAboutLinter(true);
      }
    }),
    atom.packages.onDidDeactivatePackage(pkg => {
      if (pkg.name === LINTER_PACKAGE) {
        setWarnAboutLinter(false);
      }
    }),
  );
}

function getStatusBarTile(): StatusBarTile {
  if (!statusBarTile) {
    statusBarTile = new StatusBarTile();
  }
  return statusBarTile;
}

function tryRecordActivationState(): void {
  invariant(activationState);
  if (bottomPanel && bottomPanel.isVisible()) {
    activationState.diagnosticsPanelHeight = bottomPanel.getItem().clientHeight;
  }
}

export function activate(state_: ?Object): void {
  let state = state_;
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

export function consumeDiagnosticUpdates(
  diagnosticUpdater: ObservableDiagnosticUpdater,
): void {
  getStatusBarTile().consumeDiagnosticUpdates(diagnosticUpdater);
  gutterConsumeDiagnosticUpdates(diagnosticUpdater);

  // Currently, the DiagnosticsPanel is designed to work with only one DiagnosticUpdater.
  if (consumeUpdatesCalled) {
    return;
  }
  consumeUpdatesCalled = true;

  tableConsumeDiagnosticUpdates(diagnosticUpdater);
  addAtomCommands(diagnosticUpdater);
}

function gutterConsumeDiagnosticUpdates(diagnosticUpdater: ObservableDiagnosticUpdater): void {
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
    const disposable = new UniversalDisposable(
      diagnosticUpdater.getFileMessageUpdates(filePath).subscribe(callback),
    );

    // Be sure to remove the subscription on the DiagnosticStore once the editor is closed.
    editor.onDidDestroy(() => disposable.dispose());
  }));
}

function tableConsumeDiagnosticUpdates(diagnosticUpdater: ObservableDiagnosticUpdater): void {
  invariant(subscriptions != null);

  const toggleTable = () => {
    const bottomPanelRef = bottomPanel;
    if (bottomPanelRef == null) {
      invariant(subscriptions != null);
      subscriptions.add(createPanel(diagnosticUpdater));
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
    invariant(subscriptions != null);
    subscriptions.add(createPanel(diagnosticUpdater));
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

  subscriptions.add(new KeyboardShortcuts(diagnosticUpdater));
}

// TODO(peterhal): The current index should really live in the DiagnosticStore.
class KeyboardShortcuts {
  _subscriptions: UniversalDisposable;
  _diagnostics: Array<FileDiagnosticMessage>;
  _index: ?number;

  constructor(diagnosticUpdater: ObservableDiagnosticUpdater) {
    this._index = null;
    this._diagnostics = [];

    this._subscriptions = new UniversalDisposable();

    const first = () => this.setIndex(0);
    const last = () => this.setIndex(this._diagnostics.length - 1);
    this._subscriptions.add(
      diagnosticUpdater.allMessageUpdates.subscribe(
        diagnostics => {
          this._diagnostics = (diagnostics
            .filter(diagnostic => diagnostic.scope === 'file'): any);
          this._index = null;
        }),
      atom.commands.add(
        atom.views.getView(atom.workspace),
        'nuclide-diagnostics-ui:go-to-first-diagnostic',
        first,
      ),
      atom.commands.add(
        atom.views.getView(atom.workspace),
        'nuclide-diagnostics-ui:go-to-last-diagnostic',
        last,
      ),
      atom.commands.add(
        atom.views.getView(atom.workspace),
        'nuclide-diagnostics-ui:go-to-next-diagnostic',
        () => { this._index == null ? first() : this.setIndex(this._index + 1); },
      ),
      atom.commands.add(
        atom.views.getView(atom.workspace),
        'nuclide-diagnostics-ui:go-to-previous-diagnostic',
        () => { this._index == null ? last() : this.setIndex(this._index - 1); },
      ),
    );
  }

  setIndex(index: number): void {
    if (this._diagnostics.length === 0) {
      this._index = null;
      return;
    }
    this._index = Math.max(0, Math.min(index, this._diagnostics.length - 1));
    const diagnostic = this._diagnostics[this._index];
    const range = diagnostic.range;
    if (range == null) {
      goToLocation(diagnostic.filePath);
    } else {
      goToLocation(diagnostic.filePath, range.start.row, range.start.column);
    }
  }

  dispose(): void {
    this._subscriptions.dispose();
  }
}

export function consumeStatusBar(statusBar: atom$StatusBar): void {
  getStatusBarTile().consumeStatusBar(statusBar);
}

export function consumeToolBar(getToolBar: GetToolBar): IDisposable {
  const toolBar = getToolBar('nuclide-diagnostics-ui');
  toolBar.addButton({
    icon: 'law',
    callback: 'nuclide-diagnostics-ui:toggle-table',
    tooltip: 'Toggle Diagnostics Table',
    priority: 200,
  });
  const disposable = new Disposable(() => { toolBar.removeItems(); });
  invariant(subscriptions != null);
  subscriptions.add(disposable);
  return disposable;
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

  consumeUpdatesCalled = false;
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
        'nuclide-diagnostics-ui:toggle-table',
      );
    },
  };
}

function logPanelIsDisplayed() {
  track('diagnostics-show-table');
}
