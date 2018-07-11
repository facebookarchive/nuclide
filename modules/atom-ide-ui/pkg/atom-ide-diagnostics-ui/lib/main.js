"use strict";

function _analytics() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/analytics"));

  _analytics = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../../nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../../nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _KeyboardShortcuts() {
  const data = _interopRequireDefault(require("./KeyboardShortcuts"));

  _KeyboardShortcuts = function () {
    return data;
  };

  return data;
}

function _Model() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/Model"));

  _Model = function () {
    return data;
  };

  return data;
}

function _createPackage() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _DiagnosticsViewModel() {
  const data = require("./DiagnosticsViewModel");

  _DiagnosticsViewModel = function () {
    return data;
  };

  return data;
}

function _StatusBarTile() {
  const data = _interopRequireDefault(require("./ui/StatusBarTile"));

  _StatusBarTile = function () {
    return data;
  };

  return data;
}

function _gutter() {
  const data = require("./gutter");

  _gutter = function () {
    return data;
  };

  return data;
}

function _getDiagnosticDatatip() {
  const data = _interopRequireDefault(require("./getDiagnosticDatatip"));

  _getDiagnosticDatatip = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../../../../nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _destroyItemWhere() {
  const data = require("../../../../nuclide-commons-atom/destroyItemWhere");

  _destroyItemWhere = function () {
    return data;
  };

  return data;
}

function _textEditor() {
  const data = require("../../../../nuclide-commons-atom/text-editor");

  _textEditor = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _showActionsMenu() {
  const data = _interopRequireDefault(require("./showActionsMenu"));

  _showActionsMenu = function () {
    return data;
  };

  return data;
}

function _showAtomLinterWarning() {
  const data = _interopRequireDefault(require("./showAtomLinterWarning"));

  _showAtomLinterWarning = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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
const SHOW_TRACES_SETTING = 'atom-ide-diagnostics-ui.showDiagnosticTraces';

class Activation {
  constructor(state) {
    var _ref;

    this._subscriptions = new (_UniversalDisposable().default)(this.registerOpenerAndCommand(), this._registerActionsMenu(), (0, _showAtomLinterWarning().default)());
    this._model = new (_Model().default)({
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
        const messagesAtPosition = this._getMessagesAtPosition(editor, position);

        const {
          diagnosticUpdater
        } = this._model.state;

        if (messagesAtPosition.length === 0 || diagnosticUpdater == null) {
          return Promise.resolve(null);
        }

        return (0, _getDiagnosticDatatip().default)(editor, position, messagesAtPosition, diagnosticUpdater);
      }
    };
    const disposable = service.addProvider(datatipProvider);

    this._subscriptions.add(disposable);

    return disposable;
  }

  consumeDiagnosticUpdates(diagnosticUpdater) {
    this._getStatusBarTile().consumeDiagnosticUpdates(diagnosticUpdater);

    this._subscriptions.add(gutterConsumeDiagnosticUpdates(diagnosticUpdater)); // Currently, the DiagnosticsView is designed to work with only one DiagnosticUpdater.


    if (this._model.state.diagnosticUpdater != null) {
      return new (_UniversalDisposable().default)();
    }

    this._model.setState({
      diagnosticUpdater
    });

    const atomCommandsDisposable = addAtomCommands(diagnosticUpdater);

    this._subscriptions.add(atomCommandsDisposable);

    this._subscriptions.add( // Track diagnostics for all active editors.
    atom.workspace.observeTextEditors(editor => {
      this._fileDiagnostics.set(editor, []); // TODO: this is actually inefficient - this filters all file events
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

    return new (_UniversalDisposable().default)(atomCommandsDisposable, () => {
      if (!(this._model.state.diagnosticUpdater === diagnosticUpdater)) {
        throw new Error("Invariant violation: \"this._model.state.diagnosticUpdater === diagnosticUpdater\"");
      }

      this._model.setState({
        diagnosticUpdater: null
      });
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
    const {
      filterByActiveTextEditor
    } = this._model.state;
    return {
      filterByActiveTextEditor
    };
  }

  _createDiagnosticsViewModel() {
    return new (_DiagnosticsViewModel().DiagnosticsViewModel)(this._getGlobalViewStates());
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

      const updaters = packageStates.map(state => state.diagnosticUpdater).distinctUntilChanged();
      const diagnosticsStream = updaters.switchMap(updater => updater == null ? _RxMin.Observable.of([]) : (0, _event().observableFromSubscribeFunction)(updater.observeMessages)).map(diagnostics => diagnostics.filter(d => d.type !== 'Hint')).let((0, _observable().fastDebounce)(100)).startWith([]);

      const showTracesStream = _featureConfig().default.observeAsStream(SHOW_TRACES_SETTING);

      const setShowTraces = showTraces => {
        _featureConfig().default.set(SHOW_TRACES_SETTING, showTraces);
      };

      const showDirectoryColumnStream = _featureConfig().default.observeAsStream('atom-ide-diagnostics-ui.showDirectoryColumn');

      const autoVisibilityStream = _featureConfig().default.observeAsStream('atom-ide-diagnostics-ui.autoVisibility');

      const pathToActiveTextEditorStream = getActiveEditorPaths();
      const filterByActiveTextEditorStream = packageStates.map(state => state.filterByActiveTextEditor).distinctUntilChanged();

      const setFilterByActiveTextEditor = filterByActiveTextEditor => {
        this._model.setState({
          filterByActiveTextEditor
        });
      };

      const supportedMessageKindsStream = updaters.switchMap(updater => updater == null ? _RxMin.Observable.of(new Set(['lint'])) : (0, _event().observableFromSubscribeFunction)(updater.observeSupportedMessageKinds.bind(updater))).distinctUntilChanged(_collection().areSetsEqual);
      const uiConfigStream = updaters.switchMap(updater => updater == null ? _RxMin.Observable.of([]) : (0, _event().observableFromSubscribeFunction)(updater.observeUiConfig.bind(updater)));
      this._globalViewStates = _RxMin.Observable.combineLatest(diagnosticsStream, filterByActiveTextEditorStream, pathToActiveTextEditorStream, showTracesStream, showDirectoryColumnStream, autoVisibilityStream, supportedMessageKindsStream, uiConfigStream, // $FlowFixMe
      (diagnostics, filterByActiveTextEditor, pathToActiveTextEditor, showTraces, showDirectoryColumn, autoVisibility, supportedMessageKinds, uiConfig) => ({
        diagnostics,
        filterByActiveTextEditor,
        pathToActiveTextEditor,
        showTraces,
        showDirectoryColumn,
        autoVisibility,
        onShowTracesChange: setShowTraces,
        onFilterByActiveTextEditorChange: setFilterByActiveTextEditor,
        supportedMessageKinds,
        uiConfig
      }));
    }

    return this._globalViewStates;
  }

  registerOpenerAndCommand() {
    const commandDisposable = atom.commands.add('atom-workspace', 'diagnostics:toggle-table', () => {
      atom.workspace.toggle(_DiagnosticsViewModel().WORKSPACE_VIEW_URI);
    });
    return new (_UniversalDisposable().default)(atom.workspace.addOpener(uri => {
      if (uri === _DiagnosticsViewModel().WORKSPACE_VIEW_URI) {
        return this._createDiagnosticsViewModel();
      }
    }), () => {
      (0, _destroyItemWhere().destroyItemWhere)(item => item instanceof _DiagnosticsViewModel().DiagnosticsViewModel);
    }, commandDisposable);
  }

  _registerActionsMenu() {
    return atom.commands.add('atom-text-editor', 'diagnostics:show-actions-at-position', () => {
      const editor = atom.workspace.getActiveTextEditor();
      const {
        diagnosticUpdater
      } = this._model.state;

      if (editor == null || diagnosticUpdater == null) {
        return;
      }

      const position = editor.getCursorBufferPosition();

      const messagesAtPosition = this._getMessagesAtPosition(editor, position);

      if (messagesAtPosition.length === 0) {
        return;
      }

      (0, _showActionsMenu().default)(editor, position, messagesAtPosition, diagnosticUpdater);
    });
  }

  _getStatusBarTile() {
    if (!this._statusBarTile) {
      this._statusBarTile = new (_StatusBarTile().default)();
    }

    return this._statusBarTile;
  }

  _getMessagesAtPosition(editor, position) {
    const messagesForFile = this._fileDiagnostics.get(editor);

    if (messagesForFile == null) {
      return [];
    }

    return messagesForFile.filter(message => message.range != null && message.range.containsPoint(position));
  }

}

function gutterConsumeDiagnosticUpdates(diagnosticUpdater) {
  const subscriptions = new (_UniversalDisposable().default)();
  subscriptions.add(atom.workspace.observeTextEditors(editor => {
    const subscription = getEditorDiagnosticUpdates(editor, diagnosticUpdater).finally(() => {
      subscriptions.remove(subscription);
    }).subscribe(update => {
      // Although the subscription should be cleaned up on editor destroy,
      // the very act of destroying the editor can trigger diagnostic updates.
      // Thus this callback can still be triggered after the editor is destroyed.
      if (!editor.isDestroyed()) {
        (0, _gutter().applyUpdateToEditor)(editor, update, diagnosticUpdater);
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

    _analytics().default.track('diagnostics-autofix-all-in-file');

    diagnosticUpdater.applyFixesForFile(path);
  };

  const openAllFilesWithErrors = () => {
    _analytics().default.track('diagnostics-panel-open-all-files-with-errors');

    (0, _event().observableFromSubscribeFunction)(diagnosticUpdater.observeMessages).first().subscribe(messages => {
      const errorsToOpen = getTopMostErrorLocationsByFilePath(messages);

      if (errorsToOpen.size > MAX_OPEN_ALL_FILES) {
        atom.notifications.addError(`Diagnostics: Will not open more than ${MAX_OPEN_ALL_FILES} files`);
        return;
      }

      const column = 0;
      errorsToOpen.forEach((line, uri) => (0, _goToLocation().goToLocation)(uri, {
        line,
        column
      }));
    });
  };

  return new (_UniversalDisposable().default)(atom.commands.add('atom-workspace', 'diagnostics:fix-all-in-current-file', fixAllInCurrentFile), atom.commands.add('atom-workspace', 'diagnostics:open-all-files-with-errors', openAllFilesWithErrors), new (_KeyboardShortcuts().default)(diagnosticUpdater));
}

function getTopMostErrorLocationsByFilePath(messages) {
  const errorLocations = new Map();
  messages.forEach(message => {
    const filePath = message.filePath;

    if (_nuclideUri().default.endsWithSeparator(filePath)) {
      return;
    } // If initialLine is N, Atom will navigate to line N+1.
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
  return (0, _event().observableFromSubscribeFunction)(center.observeActivePaneItem.bind(center)).map(paneItem => (0, _textEditor().isValidTextEditor)(paneItem) ? paneItem : null) // We want the stream to contain the last valid text editor. Normally that means just ignoring
  // non-editors, except initially, when there hasn't been an active editor yet.
  .filter((paneItem, index) => paneItem != null || index === 0).switchMap(textEditor_ => {
    const textEditor = textEditor_;

    if (textEditor == null) {
      return _RxMin.Observable.of(null);
    } // An observable that emits the editor path and then, when the editor's destroyed, null.


    return _RxMin.Observable.concat(_RxMin.Observable.of(textEditor.getPath()), (0, _event().observableFromSubscribeFunction)(textEditor.onDidDestroy.bind(textEditor)).take(1).mapTo(null));
  }).distinctUntilChanged();
}

function getEditorDiagnosticUpdates(editor, diagnosticUpdater) {
  return (0, _event().observableFromSubscribeFunction)(editor.onDidChangePath.bind(editor)).startWith(editor.getPath()).switchMap(filePath => filePath != null ? (0, _event().observableFromSubscribeFunction)(cb => diagnosticUpdater.observeFileMessages(filePath, cb)) : _RxMin.Observable.empty()).map(diagnosticMessages => {
    return Object.assign({}, diagnosticMessages, {
      messages: diagnosticMessages.messages.filter(diagnostic => diagnostic.type !== 'Hint')
    });
  }).takeUntil((0, _event().observableFromSubscribeFunction)(editor.onDidDestroy.bind(editor)));
}

(0, _createPackage().default)(module.exports, Activation);