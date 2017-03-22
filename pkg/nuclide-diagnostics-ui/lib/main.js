'use strict';

var _atom = require('atom');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('../../commons-atom/text-editor');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _DiagnosticsPanelModel;

function _load_DiagnosticsPanelModel() {
  return _DiagnosticsPanelModel = require('./DiagnosticsPanelModel');
}

var _StatusBarTile;

function _load_StatusBarTile() {
  return _StatusBarTile = _interopRequireDefault(require('./StatusBarTile'));
}

var _gutter;

function _load_gutter() {
  return _gutter = require('./gutter');
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../commons-atom/go-to-location');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const LINTER_PACKAGE = 'linter';
const MAX_OPEN_ALL_FILES = 20;

function disableLinter() {
  atom.packages.disablePackage(LINTER_PACKAGE);
}

class Activation {

  constructor(state_) {
    this._diagnosticUpdaters = new _rxjsBundlesRxMinJs.BehaviorSubject(null);
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    const state = state_ || {};
    this._state = {
      filterByActiveTextEditor: state.filterByActiveTextEditor === true
    };
  }

  consumeDiagnosticUpdates(diagnosticUpdater) {
    this._getStatusBarTile().consumeDiagnosticUpdates(diagnosticUpdater);
    this._subscriptions.add(gutterConsumeDiagnosticUpdates(diagnosticUpdater));

    // Currently, the DiagnosticsPanel is designed to work with only one DiagnosticUpdater.
    if (this._diagnosticUpdaters.getValue() != null) {
      return;
    }
    this._diagnosticUpdaters.next(diagnosticUpdater);
    this._subscriptions.add(addAtomCommands(diagnosticUpdater), () => {
      if (this._diagnosticUpdaters.getValue() === diagnosticUpdater) {
        this._diagnosticUpdaters.next(null);
      }
    });
  }

  consumeStatusBar(statusBar) {
    this._getStatusBarTile().consumeStatusBar(statusBar);
  }

  consumeToolBar(getToolBar) {
    const toolBar = getToolBar('nuclide-diagnostics-ui');
    toolBar.addButton({
      icon: 'law',
      callback: 'nuclide-diagnostics-ui:toggle-table',
      tooltip: 'Toggle Diagnostics Table',
      priority: 100
    });
    const disposable = new _atom.Disposable(() => {
      toolBar.removeItems();
    });
    this._subscriptions.add(disposable);
    return disposable;
  }

  deserializeDiagnosticsPanelModel() {
    return this._createDiagnosticsPanelModel();
  }

  dispose() {
    this._subscriptions.dispose();
    if (this._statusBarTile) {
      this._statusBarTile.dispose();
      this._statusBarTile = null;
    }
  }

  serialize() {
    return this._state;
  }

  getHomeFragments() {
    return {
      feature: {
        title: 'Diagnostics',
        icon: 'law',
        description: 'Displays diagnostics, errors, and lint warnings for your files and projects.',
        command: () => {
          atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-diagnostics-ui:toggle-table', { visible: true });
        }
      },
      priority: 4
    };
  }

  _createDiagnosticsPanelModel() {
    return new (_DiagnosticsPanelModel || _load_DiagnosticsPanelModel()).DiagnosticsPanelModel(this._diagnosticUpdaters.switchMap(updater => updater == null ? _rxjsBundlesRxMinJs.Observable.of([]) : updater.allMessageUpdates), (_featureConfig || _load_featureConfig()).default.observeAsStream('nuclide-diagnostics-ui.showDiagnosticTraces'), showTraces => {
      (_featureConfig || _load_featureConfig()).default.set('nuclide-diagnostics-ui.showDiagnosticTraces', showTraces);
    }, disableLinter, observeLinterPackageEnabled(), this._state.filterByActiveTextEditor, filterByActiveTextEditor => {
      if (this._state != null) {
        this._state.filterByActiveTextEditor = filterByActiveTextEditor;
      }
    });
  }

  consumeWorkspaceViewsService(api) {
    this._subscriptions.add(api.addOpener(uri => {
      if (uri === (_DiagnosticsPanelModel || _load_DiagnosticsPanelModel()).WORKSPACE_VIEW_URI) {
        return this._createDiagnosticsPanelModel();
      }
    }), () => api.destroyWhere(item => item instanceof (_DiagnosticsPanelModel || _load_DiagnosticsPanelModel()).DiagnosticsPanelModel), atom.commands.add('atom-workspace', 'nuclide-diagnostics-ui:toggle-table', event => {
      api.toggle((_DiagnosticsPanelModel || _load_DiagnosticsPanelModel()).WORKSPACE_VIEW_URI, event.detail);
    }));
  }

  _getStatusBarTile() {
    if (!this._statusBarTile) {
      this._statusBarTile = new (_StatusBarTile || _load_StatusBarTile()).default();
    }
    return this._statusBarTile;
  }
}

function gutterConsumeDiagnosticUpdates(diagnosticUpdater) {
  const fixer = diagnosticUpdater.applyFix.bind(diagnosticUpdater);
  return (0, (_textEditor || _load_textEditor()).observeTextEditors)(editor => {
    const filePath = editor.getPath();
    if (!filePath) {
      return; // The file is likely untitled.
    }

    const callback = update => {
      // Although the subscription below should be cleaned up on editor destroy,
      // the very act of destroying the editor can trigger diagnostic updates.
      // Thus this callback can still be triggered after the editor is destroyed.
      if (!editor.isDestroyed()) {
        (0, (_gutter || _load_gutter()).applyUpdateToEditor)(editor, update, fixer);
      }
    };
    const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(diagnosticUpdater.getFileMessageUpdates(filePath).subscribe(callback));

    // Be sure to remove the subscription on the DiagnosticStore once the editor is closed.
    editor.onDidDestroy(() => disposable.dispose());
  });
}

function addAtomCommands(diagnosticUpdater) {
  const fixAllInCurrentFile = () => {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return;
    }
    const path = editor.getPath();
    if (path == null) {
      return;
    }
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diagnostics-autofix-all-in-file');
    diagnosticUpdater.applyFixesForFile(path);
  };

  const openAllFilesWithErrors = () => {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diagnostics-panel-open-all-files-with-errors');
    diagnosticUpdater.allMessageUpdates.first().subscribe(messages => {
      const errorsToOpen = getTopMostErrorLocationsByFilePath(messages);

      if (errorsToOpen.size > MAX_OPEN_ALL_FILES) {
        atom.notifications.addError(`Diagnostics: Will not open more than ${MAX_OPEN_ALL_FILES} files`);
        return;
      }

      const column = 0;
      errorsToOpen.forEach((line, uri) => (0, (_goToLocation || _load_goToLocation()).goToLocation)(uri, line, column));
    });
  };

  return new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.add('atom-workspace', 'nuclide-diagnostics-ui:fix-all-in-current-file', fixAllInCurrentFile), atom.commands.add('atom-workspace', 'nuclide-diagnostics-ui:open-all-files-with-errors', openAllFilesWithErrors), new KeyboardShortcuts(diagnosticUpdater));
}

function getTopMostErrorLocationsByFilePath(messages) {
  const errorLocations = new Map();

  messages.forEach(message => {
    if (message.scope !== 'file' || message.filePath == null) {
      return;
    }
    const filePath = message.filePath;
    // If initialLine is N, Atom will navigate to line N+1.
    // Flow sometimes reports a row of -1, so this ensures the line is at least one.
    let line = Math.max(message.range ? message.range.start.row : 0, 0);

    const prevMinLine = errorLocations.get(filePath);
    if (prevMinLine != null) {
      line = Math.min(prevMinLine, line);
    }

    errorLocations.set(filePath, line);
  });

  return errorLocations;
}

// TODO(peterhal): The current index should really live in the DiagnosticStore.
class KeyboardShortcuts {

  constructor(diagnosticUpdater) {
    this._index = null;
    this._diagnostics = [];

    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();

    const first = () => this.setIndex(0);
    const last = () => this.setIndex(this._diagnostics.length - 1);
    this._subscriptions.add(diagnosticUpdater.allMessageUpdates.subscribe(diagnostics => {
      this._diagnostics = diagnostics.filter(diagnostic => diagnostic.scope === 'file');
      this._index = null;
      this._traceIndex = null;
    }), atom.commands.add('atom-workspace', 'nuclide-diagnostics-ui:go-to-first-diagnostic', first), atom.commands.add('atom-workspace', 'nuclide-diagnostics-ui:go-to-last-diagnostic', last), atom.commands.add('atom-workspace', 'nuclide-diagnostics-ui:go-to-next-diagnostic', () => {
      this._index == null ? first() : this.setIndex(this._index + 1);
    }), atom.commands.add('atom-workspace', 'nuclide-diagnostics-ui:go-to-previous-diagnostic', () => {
      this._index == null ? last() : this.setIndex(this._index - 1);
    }), atom.commands.add('atom-workspace', 'nuclide-diagnostics-ui:go-to-next-diagnostic-trace', () => {
      this.nextTrace();
    }), atom.commands.add('atom-workspace', 'nuclide-diagnostics-ui:go-to-previous-diagnostic-trace', () => {
      this.previousTrace();
    }));
  }

  setIndex(index) {
    this._traceIndex = null;
    if (this._diagnostics.length === 0) {
      this._index = null;
      return;
    }
    this._index = Math.max(0, Math.min(index, this._diagnostics.length - 1));
    this.gotoCurrentIndex();
  }

  gotoCurrentIndex() {
    if (!(this._index != null)) {
      throw new Error('Invariant violation: "this._index != null"');
    }

    if (!(this._traceIndex == null)) {
      throw new Error('Invariant violation: "this._traceIndex == null"');
    }

    const diagnostic = this._diagnostics[this._index];
    const range = diagnostic.range;
    if (range == null) {
      (0, (_goToLocation || _load_goToLocation()).goToLocation)(diagnostic.filePath);
    } else {
      (0, (_goToLocation || _load_goToLocation()).goToLocation)(diagnostic.filePath, range.start.row, range.start.column);
    }
  }

  nextTrace() {
    const traces = this.currentTraces();
    if (traces == null) {
      return;
    }
    let candidateTrace = this._traceIndex == null ? 0 : this._traceIndex + 1;
    while (candidateTrace < traces.length) {
      if (this.trySetCurrentTrace(traces, candidateTrace)) {
        return;
      }
      candidateTrace++;
    }
    this._traceIndex = null;
    this.gotoCurrentIndex();
  }

  previousTrace() {
    const traces = this.currentTraces();
    if (traces == null) {
      return;
    }
    let candidateTrace = this._traceIndex == null ? traces.length - 1 : this._traceIndex - 1;
    while (candidateTrace >= 0) {
      if (this.trySetCurrentTrace(traces, candidateTrace)) {
        return;
      }
      candidateTrace--;
    }
    this._traceIndex = null;
    this.gotoCurrentIndex();
  }

  currentTraces() {
    if (this._index == null) {
      return null;
    }
    const diagnostic = this._diagnostics[this._index];
    return diagnostic.trace;
  }

  // TODO: Should filter out traces whose location matches the main diagnostic's location?
  trySetCurrentTrace(traces, traceIndex) {
    const trace = traces[traceIndex];
    if (trace.filePath != null && trace.range != null) {
      this._traceIndex = traceIndex;
      (0, (_goToLocation || _load_goToLocation()).goToLocation)(trace.filePath, trace.range.start.row, trace.range.start.column);
      return true;
    }
    return false;
  }

  dispose() {
    this._subscriptions.dispose();
  }
}

function observeLinterPackageEnabled() {
  return _rxjsBundlesRxMinJs.Observable.merge(_rxjsBundlesRxMinJs.Observable.of(atom.packages.isPackageActive(LINTER_PACKAGE)), (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.packages.onDidActivatePackage.bind(atom.packages)).filter(pkg => pkg.name === LINTER_PACKAGE).mapTo(true), (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.packages.onDidDeactivatePackage.bind(atom.packages)).filter(pkg => pkg.name === LINTER_PACKAGE).mapTo(false));
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);