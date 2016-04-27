Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.activate = activate;
exports.consumeDiagnosticUpdates = consumeDiagnosticUpdates;
exports.consumeStatusBar = consumeStatusBar;
exports.consumeToolBar = consumeToolBar;
exports.deactivate = deactivate;
exports.serialize = serialize;
exports.getHomeFragments = getHomeFragments;
exports.getDistractionFreeModeProvider = getDistractionFreeModeProvider;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('atom');

var _nuclideAnalytics = require('../../nuclide-analytics');

var DEFAULT_HIDE_DIAGNOSTICS_PANEL = true;
var DEFAULT_TABLE_HEIGHT = 200;
var DEFAULT_FILTER_BY_ACTIVE_EDITOR = false;
var LINTER_PACKAGE = 'linter';

var subscriptions = null;
var bottomPanel = null;
var getDiagnosticsPanel = undefined;
var statusBarTile = undefined;

var activationState = null;

var diagnosticUpdaterForTable = null;

function createPanel(diagnosticUpdater, disposables) {
  (0, _assert2['default'])(activationState);

  var _require$createDiagnosticsPanel = require('./createPanel').createDiagnosticsPanel(diagnosticUpdater, activationState.diagnosticsPanelHeight, activationState.filterByActiveTextEditor, disableLinter);

  var panel = _require$createDiagnosticsPanel.atomPanel;
  var getDiagnosticsPanelFn = _require$createDiagnosticsPanel.getDiagnosticsPanel;
  var setWarnAboutLinter = _require$createDiagnosticsPanel.setWarnAboutLinter;

  logPanelIsDisplayed();
  bottomPanel = panel;
  getDiagnosticsPanel = getDiagnosticsPanelFn;

  activationState.hideDiagnosticsPanel = false;

  var onDidChangeVisibleSubscription = panel.onDidChangeVisible(function (visible) {
    (0, _assert2['default'])(activationState);
    activationState.hideDiagnosticsPanel = !visible;
  });
  disposables.add(onDidChangeVisibleSubscription);

  watchForLinter(setWarnAboutLinter, disposables);
}

function disableLinter() {
  atom.packages.disablePackage(LINTER_PACKAGE);
}

function watchForLinter(setWarnAboutLinter, disposables) {
  if (atom.packages.isPackageActive(LINTER_PACKAGE)) {
    setWarnAboutLinter(true);
  }
  disposables.add(atom.packages.onDidActivatePackage(function (pkg) {
    if (pkg.name === LINTER_PACKAGE) {
      setWarnAboutLinter(true);
    }
  }));
  disposables.add(atom.packages.onDidDeactivatePackage(function (pkg) {
    if (pkg.name === LINTER_PACKAGE) {
      setWarnAboutLinter(false);
    }
  }));
}

function getStatusBarTile() {
  if (!statusBarTile) {
    statusBarTile = new (require('./StatusBarTile'))();
  }
  return statusBarTile;
}

function tryRecordActivationState() {
  (0, _assert2['default'])(activationState);
  if (bottomPanel && bottomPanel.isVisible()) {
    activationState.diagnosticsPanelHeight = bottomPanel.getItem().clientHeight;

    (0, _assert2['default'])(getDiagnosticsPanel);
    var diagnosticsPanel = getDiagnosticsPanel();
    if (diagnosticsPanel) {
      activationState.filterByActiveTextEditor = diagnosticsPanel.props.filterByActiveTextEditor;
    }
  }
}

var toolBar = null;

function activate(state) {
  if (subscriptions) {
    return;
  }
  subscriptions = new _atom.CompositeDisposable();

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

function consumeDiagnosticUpdates(diagnosticUpdater) {
  getStatusBarTile().consumeDiagnosticUpdates(diagnosticUpdater);

  var _require = require('./gutter');

  var applyUpdateToEditor = _require.applyUpdateToEditor;

  var fixer = diagnosticUpdater.applyFix.bind(diagnosticUpdater);

  (0, _assert2['default'])(subscriptions);
  subscriptions.add(atom.workspace.observeTextEditors(function (editor) {
    var filePath = editor.getPath();
    if (!filePath) {
      return; // The file is likely untitled.
    }

    var callback = function callback(update) {
      applyUpdateToEditor(editor, update, fixer);
    };
    var disposable = diagnosticUpdater.onFileMessagesDidUpdate(callback, filePath);

    // Be sure to remove the subscription on the DiagnosticStore once the editor is closed.
    editor.onDidDestroy(function () {
      return disposable.dispose();
    });
  }));

  // Currently, the DiagnosticsPanel is designed to work with only one DiagnosticUpdater.
  // Therefore, we only create a DiagnosticsPanel for the first call to consumeDiagnosticUpdates.
  if (diagnosticUpdaterForTable) {
    return;
  }
  diagnosticUpdaterForTable = diagnosticUpdater;

  var lazilyCreateTable = createPanel.bind(null, diagnosticUpdater, subscriptions);

  var toggleTable = function toggleTable() {
    var bottomPanelRef = bottomPanel;
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

  var showTable = function showTable() {
    if (bottomPanel == null || !bottomPanel.isVisible()) {
      toggleTable();
    }
  };

  var fixAllInCurrentFile = function fixAllInCurrentFile() {
    var editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return;
    }
    var path = editor.getPath();
    if (path == null) {
      return;
    }
    (0, _nuclideAnalytics.track)('diagnostics-autofix-all-in-file');
    diagnosticUpdater.applyFixesForFile(path);
  };

  subscriptions.add(atom.commands.add(atom.views.getView(atom.workspace), 'nuclide-diagnostics-ui:toggle-table', toggleTable));

  subscriptions.add(atom.commands.add(atom.views.getView(atom.workspace), 'nuclide-diagnostics-ui:show-table', showTable));

  subscriptions.add(atom.commands.add(atom.views.getView(atom.workspace), 'nuclide-diagnostics-ui:fix-all-in-current-file', fixAllInCurrentFile));

  (0, _assert2['default'])(activationState);
  if (!activationState.hideDiagnosticsPanel) {
    lazilyCreateTable();
  }
}

function consumeStatusBar(statusBar) {
  getStatusBarTile().consumeStatusBar(statusBar);
}

function consumeToolBar(getToolBar) {
  toolBar = getToolBar('nuclide-diagnostics-ui');
  toolBar.addButton({
    icon: 'law',
    callback: 'nuclide-diagnostics-ui:toggle-table',
    tooltip: 'Toggle Diagnostics Table',
    priority: 200
  });
}

function deactivate() {
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
}

function serialize() {
  tryRecordActivationState();
  (0, _assert2['default'])(activationState);
  return activationState;
}

function getHomeFragments() {
  return {
    feature: {
      title: 'Diagnostics',
      icon: 'law',
      description: 'Displays diagnostics, errors, and lint warnings for your files and projects.',
      command: 'nuclide-diagnostics-ui:show-table'
    },
    priority: 4
  };
}

function getDistractionFreeModeProvider() {
  return {
    name: 'nuclide-diagnostics-ui',
    isVisible: function isVisible() {
      return bottomPanel != null && bottomPanel.isVisible();
    },
    toggle: function toggle() {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-diagnostics-ui:toggle-table');
    }
  };
}

function logPanelIsDisplayed() {
  (0, _nuclideAnalytics.track)('diagnostics-show-table');
}