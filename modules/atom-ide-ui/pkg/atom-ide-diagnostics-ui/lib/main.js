'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _analytics;

function _load_analytics() {
  return _analytics = _interopRequireDefault(require('nuclide-commons-atom/analytics'));
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('nuclide-commons-atom/text-editor');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

var _DiagnosticsViewModel;

function _load_DiagnosticsViewModel() {
  return _DiagnosticsViewModel = require('./DiagnosticsViewModel');
}

var _StatusBarTile;

function _load_StatusBarTile() {
  return _StatusBarTile = _interopRequireDefault(require('./StatusBarTile'));
}

var _gutter;

function _load_gutter() {
  return _gutter = require('./gutter');
}

var _DiagnosticsDatatipComponent;

function _load_DiagnosticsDatatipComponent() {
  return _DiagnosticsDatatipComponent = require('./DiagnosticsDatatipComponent');
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _destroyItemWhere;

function _load_destroyItemWhere() {
  return _destroyItemWhere = require('nuclide-commons-atom/destroyItemWhere');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const LINTER_PACKAGE = 'linter'; /**
                                  * Copyright (c) 2017-present, Facebook, Inc.
                                  * All rights reserved.
                                  *
                                  * This source code is licensed under the BSD-style license found in the
                                  * LICENSE file in the root directory of this source tree. An additional grant
                                  * of patent rights can be found in the PATENTS file in the same directory.
                                  *
                                  * 
                                  * @format
                                  */

const MAX_OPEN_ALL_FILES = 20;

function disableLinter() {
  atom.packages.disablePackage(LINTER_PACKAGE);
}

function getEditorDiagnosticUpdates(editor, diagnosticUpdater) {
  return (0, (_event || _load_event()).observableFromSubscribeFunction)(editor.onDidChangePath.bind(editor)).startWith(editor.getPath()).switchMap(filePath => filePath != null ? diagnosticUpdater.getFileMessageUpdates(filePath) : _rxjsBundlesRxMinJs.Observable.empty()).takeUntil((0, (_event || _load_event()).observableFromSubscribeFunction)(editor.onDidDestroy.bind(editor)));
}

class Activation {

  constructor(state_) {
    this._diagnosticUpdaters = new _rxjsBundlesRxMinJs.BehaviorSubject(null);
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(this.registerOpenerAndCommand());
    const state = state_ || {};
    this._state = {
      filterByActiveTextEditor: state.filterByActiveTextEditor === true
    };
    this._fileDiagnostics = new WeakMap();
  }

  consumeDatatipService(service) {
    const datatipProvider = {
      // show this datatip for every type of file
      providerName: 'nuclide-diagnostics-datatip',
      priority: 1,
      datatip: this._datatip.bind(this)
    };
    const disposable = service.addProvider(datatipProvider);
    this._subscriptions.add(disposable);
    return disposable;
  }

  _datatip(editor, position) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const messagesForFile = _this._fileDiagnostics.get(editor);
      if (messagesForFile == null) {
        return null;
      }
      const messagesAtPosition = messagesForFile.filter(function (message) {
        return message.range != null && message.range.containsPoint(position);
      });
      if (messagesAtPosition.length === 0) {
        return null;
      }
      const [message] = messagesAtPosition;
      const { range } = message;

      if (!range) {
        throw new Error('Invariant violation: "range"');
      }

      return {
        component: (0, (_DiagnosticsDatatipComponent || _load_DiagnosticsDatatipComponent()).makeDiagnosticsDatatipComponent)(message),
        pinnable: false,
        range
      };
    })();
  }

  consumeDiagnosticUpdates(diagnosticUpdater) {
    this._getStatusBarTile().consumeDiagnosticUpdates(diagnosticUpdater);
    this._subscriptions.add(gutterConsumeDiagnosticUpdates(diagnosticUpdater));

    // Currently, the DiagnosticsView is designed to work with only one DiagnosticUpdater.
    if (this._diagnosticUpdaters.getValue() != null) {
      return new (_UniversalDisposable || _load_UniversalDisposable()).default();
    }
    this._diagnosticUpdaters.next(diagnosticUpdater);
    const atomCommandsDisposable = addAtomCommands(diagnosticUpdater);
    this._subscriptions.add(atomCommandsDisposable);
    this._subscriptions.add(
    // Track diagnostics for all active editors.
    (0, (_textEditor || _load_textEditor()).observeTextEditors)(editor => {
      this._fileDiagnostics.set(editor, []);
      // TODO: this is actually inefficient - this filters all file events
      // by their path, so this is actually O(N^2) in the number of editors.
      // We should merge the store and UI packages to get direct access.
      const subscription = getEditorDiagnosticUpdates(editor, diagnosticUpdater).finally(() => {
        this._subscriptions.remove(subscription);
        this._fileDiagnostics.delete(editor);
      }).subscribe(update => {
        this._fileDiagnostics.set(editor, update.messages);
      });
      this._subscriptions.add(subscription);
    }));
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(atomCommandsDisposable, () => {
      if (!(this._diagnosticUpdaters.getValue() === diagnosticUpdater)) {
        throw new Error('Invariant violation: "this._diagnosticUpdaters.getValue() === diagnosticUpdater"');
      }

      this._diagnosticUpdaters.next(null);
    });
  }

  consumeStatusBar(statusBar) {
    this._getStatusBarTile().consumeStatusBar(statusBar);
  }

  deserializeDiagnosticsViewModel() {
    return this._createDiagnosticsViewModel();
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

  _createDiagnosticsViewModel() {
    return new (_DiagnosticsViewModel || _load_DiagnosticsViewModel()).DiagnosticsViewModel(this._diagnosticUpdaters.switchMap(updater => updater == null ? _rxjsBundlesRxMinJs.Observable.of([]) : updater.allMessageUpdates), (_featureConfig || _load_featureConfig()).default.observeAsStream('atom-ide-diagnostics-ui.showDiagnosticTraces'), showTraces => {
      (_featureConfig || _load_featureConfig()).default.set('atom-ide-diagnostics-ui.showDiagnosticTraces', showTraces);
    }, disableLinter, observeLinterPackageEnabled(), this._state.filterByActiveTextEditor, filterByActiveTextEditor => {
      if (this._state != null) {
        this._state.filterByActiveTextEditor = filterByActiveTextEditor;
      }
    });
  }

  registerOpenerAndCommand() {
    const commandDisposable = atom.commands.add('atom-workspace', 'diagnostics:toggle-table', () => {
      atom.workspace.toggle((_DiagnosticsViewModel || _load_DiagnosticsViewModel()).WORKSPACE_VIEW_URI);
    });
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.workspace.addOpener(uri => {
      if (uri === (_DiagnosticsViewModel || _load_DiagnosticsViewModel()).WORKSPACE_VIEW_URI) {
        return this._createDiagnosticsViewModel();
      }
    }), () => {
      (0, (_destroyItemWhere || _load_destroyItemWhere()).destroyItemWhere)(item => item instanceof (_DiagnosticsViewModel || _load_DiagnosticsViewModel()).DiagnosticsViewModel);
    }, commandDisposable);
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
  const subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  subscriptions.add((0, (_textEditor || _load_textEditor()).observeTextEditors)(editor => {
    const subscription = getEditorDiagnosticUpdates(editor, diagnosticUpdater).finally(() => {
      subscriptions.remove(subscription);
    }).subscribe(update => {
      // Although the subscription should be cleaned up on editor destroy,
      // the very act of destroying the editor can trigger diagnostic updates.
      // Thus this callback can still be triggered after the editor is destroyed.
      if (!editor.isDestroyed()) {
        (0, (_gutter || _load_gutter()).applyUpdateToEditor)(editor, update, fixer);
      }
    });
    subscriptions.add(subscription);
  }));
  return subscriptions;
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
    (_analytics || _load_analytics()).default.track('diagnostics-autofix-all-in-file');
    diagnosticUpdater.applyFixesForFile(path);
  };

  const openAllFilesWithErrors = () => {
    (_analytics || _load_analytics()).default.track('diagnostics-panel-open-all-files-with-errors');
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

  return new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.add('atom-workspace', 'diagnostics:fix-all-in-current-file', fixAllInCurrentFile), atom.commands.add('atom-workspace', 'diagnostics:open-all-files-with-errors', openAllFilesWithErrors), new KeyboardShortcuts(diagnosticUpdater));
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
    }), atom.commands.add('atom-workspace', 'diagnostics:go-to-first-diagnostic', first), atom.commands.add('atom-workspace', 'diagnostics:go-to-last-diagnostic', last), atom.commands.add('atom-workspace', 'diagnostics:go-to-next-diagnostic', () => {
      this._index == null ? first() : this.setIndex(this._index + 1);
    }), atom.commands.add('atom-workspace', 'diagnostics:go-to-previous-diagnostic', () => {
      this._index == null ? last() : this.setIndex(this._index - 1);
    }), atom.commands.add('atom-workspace', 'diagnostics:go-to-next-diagnostic-trace', () => {
      this.nextTrace();
    }), atom.commands.add('atom-workspace', 'diagnostics:go-to-previous-diagnostic-trace', () => {
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