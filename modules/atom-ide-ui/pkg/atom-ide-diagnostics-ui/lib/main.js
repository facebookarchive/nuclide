'use strict';

var _analytics;

function _load_analytics() {
  return _analytics = _interopRequireDefault(require('nuclide-commons-atom/analytics'));
}

var _idx;

function _load_idx() {
  return _idx = _interopRequireDefault(require('idx'));
}

var _AtomLinter;

function _load_AtomLinter() {
  return _AtomLinter = _interopRequireWildcard(require('./AtomLinter'));
}

var _KeyboardShortcuts;

function _load_KeyboardShortcuts() {
  return _KeyboardShortcuts = _interopRequireDefault(require('./KeyboardShortcuts'));
}

var _Model;

function _load_Model() {
  return _Model = _interopRequireDefault(require('nuclide-commons/Model'));
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
  return _StatusBarTile = _interopRequireDefault(require('./ui/StatusBarTile'));
}

var _gutter;

function _load_gutter() {
  return _gutter = require('./gutter');
}

var _getDiagnosticDatatip;

function _load_getDiagnosticDatatip() {
  return _getDiagnosticDatatip = _interopRequireDefault(require('./getDiagnosticDatatip'));
}

var _paneUtils;

function _load_paneUtils() {
  return _paneUtils = require('./paneUtils');
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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const MAX_OPEN_ALL_FILES = 20; /**
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

const SHOW_TRACES_SETTING = 'atom-ide-diagnostics-ui.showDiagnosticTraces';

class Activation {

  constructor(state) {
    var _ref;

    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(this.registerOpenerAndCommand());
    this._model = new (_Model || _load_Model()).default({
      filterByActiveTextEditor: ((_ref = state) != null ? _ref.filterByActiveTextEditor : _ref) === true,
      diagnosticUpdater: null
    });
    this._fileDiagnostics = new WeakMap();
  }

  consumeDatatipService(service) {
    const datatipProvider = {
      // show this datatip for every type of file
      providerName: 'diagnostics-datatip',
      // Diagnostic datatips should have higher priority than most other datatips.
      priority: 10,
      datatip: (editor, position) => {
        const messagesForFile = this._fileDiagnostics.get(editor);
        if (messagesForFile == null) {
          return Promise.resolve(null);
        }
        return (0, (_getDiagnosticDatatip || _load_getDiagnosticDatatip()).default)(editor, position, messagesForFile, message => {
          const updater = this._model.state.diagnosticUpdater;
          if (updater != null) {
            updater.applyFix(message);
          }
        }, this._codeActionFetcher);
      }
    };
    const disposable = service.addProvider(datatipProvider);
    this._subscriptions.add(disposable);
    return disposable;
  }

  consumeDiagnosticUpdates(diagnosticUpdater) {
    this._getStatusBarTile().consumeDiagnosticUpdates(diagnosticUpdater);
    this._subscriptions.add(gutterConsumeDiagnosticUpdates(diagnosticUpdater));

    // Currently, the DiagnosticsView is designed to work with only one DiagnosticUpdater.
    if (this._model.state.diagnosticUpdater != null) {
      return new (_UniversalDisposable || _load_UniversalDisposable()).default();
    }
    this._model.setState({ diagnosticUpdater });
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
      if (!(this._model.state.diagnosticUpdater === diagnosticUpdater)) {
        throw new Error('Invariant violation: "this._model.state.diagnosticUpdater === diagnosticUpdater"');
      }

      this._model.setState({ diagnosticUpdater: null });
    });
  }

  consumeCodeActionFetcher(fetcher) {
    this._codeActionFetcher = fetcher;
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
    const { filterByActiveTextEditor } = this._model.state;
    return {
      filterByActiveTextEditor
    };
  }

  _createDiagnosticsViewModel() {
    return new (_DiagnosticsViewModel || _load_DiagnosticsViewModel()).DiagnosticsViewModel(this._getGlobalViewStates());
  }

  /**
   * An observable of the state that's shared between all panel copies. State that's unique to a
   * single copy of the diagnostics panel is managed in DiagnosticsViewModel. Generally, users will
   * only have one copy of the diagnostics panel so this is mostly a theoretical distinction,
   * however, each copy should have its own sorting, filtering, etc.
   */
  _getGlobalViewStates() {
    if (this._globalViewStates == null) {
      const packageStates = this._model.toObservable();

      const diagnosticsStream = packageStates.map(state => state.diagnosticUpdater).distinctUntilChanged().switchMap(updater => updater == null ? _rxjsBundlesRxMinJs.Observable.of([]) : (0, (_event || _load_event()).observableFromSubscribeFunction)(updater.observeMessages)).debounceTime(100)
      // FIXME: It's not good for UX or perf that we're providing a default sort here (that users
      // can't return to). We should remove this and have the table sorting be more intelligent.
      // For example, sorting by type means sorting by [type, filename, description].
      .map(diagnostics => diagnostics.slice().sort((_paneUtils || _load_paneUtils()).compareMessagesByFile)).startWith([]);

      const showTracesStream = (_featureConfig || _load_featureConfig()).default.observeAsStream(SHOW_TRACES_SETTING);
      const setShowTraces = showTraces => {
        (_featureConfig || _load_featureConfig()).default.set(SHOW_TRACES_SETTING, showTraces);
      };

      const warnAboutLinterStream = (_AtomLinter || _load_AtomLinter()).observePackageIsEnabled();
      const disableLinter = () => {
        (_AtomLinter || _load_AtomLinter()).disable();
      };

      const pathToActiveTextEditorStream = getActiveEditorPaths();

      const filterByActiveTextEditorStream = packageStates.map(state => state.filterByActiveTextEditor).distinctUntilChanged();
      const setFilterByActiveTextEditor = filterByActiveTextEditor => {
        this._model.setState({ filterByActiveTextEditor });
      };

      this._globalViewStates = _rxjsBundlesRxMinJs.Observable.combineLatest(diagnosticsStream, filterByActiveTextEditorStream, pathToActiveTextEditorStream, warnAboutLinterStream, showTracesStream, (diagnostics, filterByActiveTextEditor, pathToActiveTextEditor, warnAboutLinter, showTraces) => ({
        diagnostics,
        filterByActiveTextEditor,
        pathToActiveTextEditor,
        warnAboutLinter,
        showTraces,
        onShowTracesChange: setShowTraces,
        disableLinter,
        onFilterByActiveTextEditorChange: setFilterByActiveTextEditor
      }));
    }
    return this._globalViewStates;
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
    (0, (_event || _load_event()).observableFromSubscribeFunction)(diagnosticUpdater.observeMessages).first().subscribe(messages => {
      const errorsToOpen = getTopMostErrorLocationsByFilePath(messages);

      if (errorsToOpen.size > MAX_OPEN_ALL_FILES) {
        atom.notifications.addError(`Diagnostics: Will not open more than ${MAX_OPEN_ALL_FILES} files`);
        return;
      }

      const column = 0;
      errorsToOpen.forEach((line, uri) => (0, (_goToLocation || _load_goToLocation()).goToLocation)(uri, line, column));
    });
  };

  return new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.add('atom-workspace', 'diagnostics:fix-all-in-current-file', fixAllInCurrentFile), atom.commands.add('atom-workspace', 'diagnostics:open-all-files-with-errors', openAllFilesWithErrors), new (_KeyboardShortcuts || _load_KeyboardShortcuts()).default(diagnosticUpdater));
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

function getActiveEditorPaths() {
  const center = atom.workspace.getCenter();
  return (0, (_event || _load_event()).observableFromSubscribeFunction)(center.observeActivePaneItem.bind(center)).filter(paneItem => (0, (_textEditor || _load_textEditor()).isValidTextEditor)(paneItem)).switchMap(textEditor_ => {
    const textEditor = textEditor_;
    // An observable that emits the editor path and then, when the editor's destroyed, null.
    return _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of(textEditor.getPath()), (0, (_event || _load_event()).observableFromSubscribeFunction)(textEditor.onDidDestroy.bind(textEditor)).take(1).mapTo(null));
  }).distinctUntilChanged();
}

function getEditorDiagnosticUpdates(editor, diagnosticUpdater) {
  return (0, (_event || _load_event()).observableFromSubscribeFunction)(editor.onDidChangePath.bind(editor)).startWith(editor.getPath()).switchMap(filePath => filePath != null ? (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => diagnosticUpdater.observeFileMessages(filePath, cb)) : _rxjsBundlesRxMinJs.Observable.empty()).takeUntil((0, (_event || _load_event()).observableFromSubscribeFunction)(editor.onDidDestroy.bind(editor)));
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);