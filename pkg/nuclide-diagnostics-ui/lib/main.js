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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.consumeDiagnosticUpdates = consumeDiagnosticUpdates;
exports.consumeStatusBar = consumeStatusBar;
exports.consumeToolBar = consumeToolBar;
exports.deactivate = deactivate;
exports.serialize = serialize;
exports.getHomeFragments = getHomeFragments;
exports.getDistractionFreeModeProvider = getDistractionFreeModeProvider;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _commonsNodeUniversalDisposable2;

function _commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable2 = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _createPanel2;

function _createPanel() {
  return _createPanel2 = _interopRequireDefault(require('./createPanel'));
}

var _StatusBarTile2;

function _StatusBarTile() {
  return _StatusBarTile2 = _interopRequireDefault(require('./StatusBarTile'));
}

var _gutter2;

function _gutter() {
  return _gutter2 = require('./gutter');
}

var _commonsAtomGoToLocation2;

function _commonsAtomGoToLocation() {
  return _commonsAtomGoToLocation2 = require('../../commons-atom/go-to-location');
}

var DEFAULT_HIDE_DIAGNOSTICS_PANEL = true;
var DEFAULT_TABLE_HEIGHT = 200;
var DEFAULT_FILTER_BY_ACTIVE_EDITOR = false;
var LINTER_PACKAGE = 'linter';

var subscriptions = null;
var bottomPanel = null;
var statusBarTile = undefined;

var activationState = null;

var consumeUpdatesCalled = false;

function createPanel(diagnosticUpdater) {
  (0, (_assert2 || _assert()).default)(activationState);

  var _ref = (0, (_createPanel2 || _createPanel()).default)(diagnosticUpdater.allMessageUpdates, activationState.diagnosticsPanelHeight, activationState.filterByActiveTextEditor, disableLinter, function (filterByActiveTextEditor) {
    if (activationState != null) {
      activationState.filterByActiveTextEditor = filterByActiveTextEditor;
    }
  });

  var panel = _ref.atomPanel;
  var setWarnAboutLinter = _ref.setWarnAboutLinter;

  logPanelIsDisplayed();
  bottomPanel = panel;

  return new (_atom2 || _atom()).CompositeDisposable(panel.onDidChangeVisible(function (visible) {
    (0, (_assert2 || _assert()).default)(activationState);
    activationState.hideDiagnosticsPanel = !visible;
  }), watchForLinter(setWarnAboutLinter));
}

function disableLinter() {
  atom.packages.disablePackage(LINTER_PACKAGE);
}

function watchForLinter(setWarnAboutLinter) {
  if (atom.packages.isPackageActive(LINTER_PACKAGE)) {
    setWarnAboutLinter(true);
  }
  return new (_atom2 || _atom()).CompositeDisposable(atom.packages.onDidActivatePackage(function (pkg) {
    if (pkg.name === LINTER_PACKAGE) {
      setWarnAboutLinter(true);
    }
  }), atom.packages.onDidDeactivatePackage(function (pkg) {
    if (pkg.name === LINTER_PACKAGE) {
      setWarnAboutLinter(false);
    }
  }));
}

function getStatusBarTile() {
  if (!statusBarTile) {
    statusBarTile = new (_StatusBarTile2 || _StatusBarTile()).default();
  }
  return statusBarTile;
}

function tryRecordActivationState() {
  (0, (_assert2 || _assert()).default)(activationState);
  if (bottomPanel && bottomPanel.isVisible()) {
    activationState.diagnosticsPanelHeight = bottomPanel.getItem().clientHeight;
  }
}

function activate(state_) {
  var state = state_;
  if (subscriptions) {
    return;
  }
  subscriptions = new (_atom2 || _atom()).CompositeDisposable();

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
  gutterConsumeDiagnosticUpdates(diagnosticUpdater);

  // Currently, the DiagnosticsPanel is designed to work with only one DiagnosticUpdater.
  if (consumeUpdatesCalled) {
    return;
  }
  consumeUpdatesCalled = true;

  tableConsumeDiagnosticUpdates(diagnosticUpdater);
  addAtomCommands(diagnosticUpdater);
}

function gutterConsumeDiagnosticUpdates(diagnosticUpdater) {
  var fixer = diagnosticUpdater.applyFix.bind(diagnosticUpdater);

  (0, (_assert2 || _assert()).default)(subscriptions != null);
  subscriptions.add(atom.workspace.observeTextEditors(function (editor) {
    var filePath = editor.getPath();
    if (!filePath) {
      return; // The file is likely untitled.
    }

    var callback = function callback(update) {
      (0, (_gutter2 || _gutter()).applyUpdateToEditor)(editor, update, fixer);
    };
    var disposable = new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default(diagnosticUpdater.getFileMessageUpdates(filePath).subscribe(callback));

    // Be sure to remove the subscription on the DiagnosticStore once the editor is closed.
    editor.onDidDestroy(function () {
      return disposable.dispose();
    });
  }));
}

function tableConsumeDiagnosticUpdates(diagnosticUpdater) {
  (0, (_assert2 || _assert()).default)(subscriptions != null);

  var toggleTable = function toggleTable() {
    var bottomPanelRef = bottomPanel;
    if (bottomPanelRef == null) {
      (0, (_assert2 || _assert()).default)(subscriptions != null);
      subscriptions.add(createPanel(diagnosticUpdater));
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

  subscriptions.add(atom.commands.add(atom.views.getView(atom.workspace), 'nuclide-diagnostics-ui:toggle-table', toggleTable));

  subscriptions.add(atom.commands.add(atom.views.getView(atom.workspace), 'nuclide-diagnostics-ui:show-table', showTable));

  (0, (_assert2 || _assert()).default)(activationState);
  if (!activationState.hideDiagnosticsPanel) {
    (0, (_assert2 || _assert()).default)(subscriptions != null);
    subscriptions.add(createPanel(diagnosticUpdater));
  }
}

function addAtomCommands(diagnosticUpdater) {
  var fixAllInCurrentFile = function fixAllInCurrentFile() {
    var editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return;
    }
    var path = editor.getPath();
    if (path == null) {
      return;
    }
    (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('diagnostics-autofix-all-in-file');
    diagnosticUpdater.applyFixesForFile(path);
  };

  (0, (_assert2 || _assert()).default)(subscriptions != null);

  subscriptions.add(atom.commands.add(atom.views.getView(atom.workspace), 'nuclide-diagnostics-ui:fix-all-in-current-file', fixAllInCurrentFile));

  subscriptions.add(new KeyboardShortcuts(diagnosticUpdater));
}

// TODO(peterhal): The current index should really live in the DiagnosticStore.

var KeyboardShortcuts = (function () {
  function KeyboardShortcuts(diagnosticUpdater) {
    var _this = this;

    _classCallCheck(this, KeyboardShortcuts);

    this._index = null;
    this._diagnostics = [];

    this._subscriptions = new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default();

    var first = function first() {
      return _this.setIndex(0);
    };
    var last = function last() {
      return _this.setIndex(_this._diagnostics.length - 1);
    };
    this._subscriptions.add(diagnosticUpdater.allMessageUpdates.subscribe(function (diagnostics) {
      _this._diagnostics = diagnostics.filter(function (diagnostic) {
        return diagnostic.scope === 'file';
      });
      _this._index = null;
    }), atom.commands.add(atom.views.getView(atom.workspace), 'nuclide-diagnostics-ui:go-to-first-diagnostic', first), atom.commands.add(atom.views.getView(atom.workspace), 'nuclide-diagnostics-ui:go-to-last-diagnostic', last), atom.commands.add(atom.views.getView(atom.workspace), 'nuclide-diagnostics-ui:go-to-next-diagnostic', function () {
      _this._index == null ? first() : _this.setIndex(_this._index + 1);
    }), atom.commands.add(atom.views.getView(atom.workspace), 'nuclide-diagnostics-ui:go-to-previous-diagnostic', function () {
      _this._index == null ? last() : _this.setIndex(_this._index - 1);
    }));
  }

  _createClass(KeyboardShortcuts, [{
    key: 'setIndex',
    value: function setIndex(index) {
      if (this._diagnostics.length === 0) {
        this._index = null;
        return;
      }
      this._index = Math.max(0, Math.min(index, this._diagnostics.length - 1));
      var diagnostic = this._diagnostics[this._index];
      var range = diagnostic.range;
      if (range == null) {
        (0, (_commonsAtomGoToLocation2 || _commonsAtomGoToLocation()).goToLocation)(diagnostic.filePath);
      } else {
        (0, (_commonsAtomGoToLocation2 || _commonsAtomGoToLocation()).goToLocation)(diagnostic.filePath, range.start.row, range.start.column);
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
    }
  }]);

  return KeyboardShortcuts;
})();

function consumeStatusBar(statusBar) {
  getStatusBarTile().consumeStatusBar(statusBar);
}

function consumeToolBar(getToolBar) {
  var toolBar = getToolBar('nuclide-diagnostics-ui');
  toolBar.addButton({
    icon: 'law',
    callback: 'nuclide-diagnostics-ui:toggle-table',
    tooltip: 'Toggle Diagnostics Table',
    priority: 200
  });
  var disposable = new (_atom2 || _atom()).Disposable(function () {
    toolBar.removeItems();
  });
  (0, (_assert2 || _assert()).default)(subscriptions != null);
  subscriptions.add(disposable);
  return disposable;
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

  consumeUpdatesCalled = false;
}

function serialize() {
  tryRecordActivationState();
  (0, (_assert2 || _assert()).default)(activationState);
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
  (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('diagnostics-show-table');
}