'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ObservableDiagnosticProvider = exports.FileDiagnosticsProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports


exports.registerDiagnostics = registerDiagnostics;

var _Cache;

function _load_Cache() {
  return _Cache = require('../../commons-node/Cache');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _promise;

function _load_promise() {
  return _promise = require('../../commons-node/promise');
}

var _nuclideDiagnosticsProviderBase;

function _load_nuclideDiagnosticsProviderBase() {
  return _nuclideDiagnosticsProviderBase = require('../../nuclide-diagnostics-provider-base');
}

var _projects;

function _load_projects() {
  return _projects = require('../../commons-atom/projects');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _nuclideOpenFiles;

function _load_nuclideOpenFiles() {
  return _nuclideOpenFiles = require('../../nuclide-open-files');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _nuclideBusySignal;

function _load_nuclideBusySignal() {
  return _nuclideBusySignal = require('../../nuclide-busy-signal');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

const diagnosticService = 'nuclide-diagnostics-provider';

function registerDiagnostics(name, grammars, config, connectionToLanguageService) {
  const result = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  let provider;
  switch (config.version) {
    case '0.1.0':
      provider = new FileDiagnosticsProvider(name, grammars, config.shouldRunOnTheFly, config.analyticsEventName, connectionToLanguageService);
      result.add(provider);
      break;
    case '0.2.0':
      provider = new ObservableDiagnosticProvider(config.analyticsEventName, connectionToLanguageService);
      break;
    default:
      throw new Error('Unexpected diagnostics version');
  }
  result.add(atom.packages.serviceHub.provide(diagnosticService, config.version, provider));
  return result;
}

let FileDiagnosticsProvider = exports.FileDiagnosticsProvider = class FileDiagnosticsProvider {

  constructor(name, grammars, shouldRunOnTheFly, analyticsEventName, connectionToLanguageService) {
    let busySignalProvider = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : new (_nuclideBusySignal || _load_nuclideBusySignal()).BusySignalProviderBase();
    let ProviderBase = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : (_nuclideDiagnosticsProviderBase || _load_nuclideDiagnosticsProviderBase()).DiagnosticsProviderBase;

    this.name = name;
    this._analyticsEventName = analyticsEventName;
    this._busySignalProvider = busySignalProvider;
    this._connectionToLanguageService = connectionToLanguageService;
    const utilsOptions = {
      grammarScopes: new Set(grammars),
      shouldRunOnTheFly: shouldRunOnTheFly,
      onTextEditorEvent: editor => this._runDiagnostics(editor),
      onNewUpdateSubscriber: callback => this._receivedNewUpdateSubscriber(callback)
    };
    this._providerBase = new ProviderBase(utilsOptions);
    this._requestSerializer = new (_promise || _load_promise()).RequestSerializer();
    this._projectRootToFilePaths = new Map();
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._subscriptions.add((0, (_projects || _load_projects()).onDidRemoveProjectPath)(projectPath => {
      this.invalidateProjectPath(projectPath);
    }), this._providerBase, atom.packages.serviceHub.provide('nuclide-busy-signal', '0.1.0', busySignalProvider));
  }

  /**
   * Maps hack root to the set of file paths under that root for which we have
   * ever reported diagnostics.
   */


  _runDiagnostics(textEditor) {
    this._busySignalProvider.reportBusy(`${ this.name }: Waiting for diagnostics`, () => this._runDiagnosticsImpl(textEditor));
  }

  _runDiagnosticsImpl(textEditor) {
    var _this = this;

    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)(this._analyticsEventName, (0, _asyncToGenerator.default)(function* () {
      let filePath = textEditor.getPath();
      if (filePath == null) {
        return;
      }

      // `hh_client` doesn't currently support `onTheFly` diagnosis.
      // So, currently, it would only work if there is no `hh_client` or `.hhconfig` where
      // the `HackWorker` model will diagnose with the updated editor contents.
      const diagnosisResult = yield _this._requestSerializer.run(_this.findDiagnostics(textEditor));
      if (diagnosisResult.status === 'success' && diagnosisResult.result == null) {
        logger.error('hh_client could not be reached');
      }
      if (diagnosisResult.status === 'outdated' || diagnosisResult.result == null) {
        return;
      }

      const diagnostics = diagnosisResult.result;
      filePath = textEditor.getPath();
      if (filePath == null) {
        return;
      }
      const languageService = _this._connectionToLanguageService.getForUri(filePath);
      if (languageService == null) {
        return;
      }
      const projectRoot = yield (yield languageService).getProjectRoot(filePath);
      if (projectRoot == null) {
        return;
      }

      _this._providerBase.publishMessageInvalidation({ scope: 'file', filePaths: [filePath] });
      _this._invalidatePathsForProjectRoot(projectRoot);

      const pathsForHackLanguage = new Set();
      _this._projectRootToFilePaths.set(projectRoot, pathsForHackLanguage);
      const addPath = function (path) {
        if (path != null) {
          pathsForHackLanguage.add(path);
        }
      };
      if (diagnostics.filePathToMessages != null) {
        diagnostics.filePathToMessages.forEach(function (messages, messagePath) {
          addPath(messagePath);
          messages.forEach(function (message) {
            addPath(message.filePath);
            if (message.trace != null) {
              message.trace.forEach(function (trace) {
                addPath(trace.filePath);
              });
            }
          });
        });
      }

      _this._providerBase.publishMessageUpdate(diagnostics);
    }));
  }

  _getPathsToInvalidate(projectRoot) {
    const filePaths = this._projectRootToFilePaths.get(projectRoot);
    if (!filePaths) {
      return [];
    }
    return Array.from(filePaths);
  }

  _receivedNewUpdateSubscriber(callback) {
    // Every time we get a new subscriber, we need to push results to them. This
    // logic is common to all providers and should be abstracted out (t7813069)
    //
    // Once we provide all diagnostics, instead of just the current file, we can
    // probably remove the activeTextEditor parameter.
    const activeTextEditor = atom.workspace.getActiveTextEditor();
    if (activeTextEditor) {
      if (this._providerBase.getGrammarScopes().has(activeTextEditor.getGrammar().scopeName)) {
        this._runDiagnostics(activeTextEditor);
      }
    }
  }

  setRunOnTheFly(runOnTheFly) {
    this._providerBase.setRunOnTheFly(runOnTheFly);
  }

  onMessageUpdate(callback) {
    return this._providerBase.onMessageUpdate(callback);
  }

  onMessageInvalidation(callback) {
    return this._providerBase.onMessageInvalidation(callback);
  }

  // Called when a directory is removed from the file tree.
  invalidateProjectPath(projectPath) {
    Array.from(this._projectRootToFilePaths.keys())
    // This filter is over broad, the real filter should be
    // no open dir in the File Tree contains the root.
    // This will err on the side of removing messages,
    // which should be fine, as they will come back once a file is reopened
    // or edited.
    .filter(rootPath => (_nuclideUri || _load_nuclideUri()).default.contains(projectPath, rootPath) || (_nuclideUri || _load_nuclideUri()).default.contains(rootPath, projectPath)).forEach(removedPath => {
      this._invalidatePathsForProjectRoot(removedPath);
    });
  }

  _invalidatePathsForProjectRoot(projectRoot) {
    const pathsToInvalidate = this._getPathsToInvalidate(projectRoot);
    this._providerBase.publishMessageInvalidation({ scope: 'file', filePaths: pathsToInvalidate });
    this._projectRootToFilePaths.delete(projectRoot);
  }

  dispose() {
    this._subscriptions.dispose();
  }

  findDiagnostics(editor) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const fileVersion = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);
      const languageService = _this2._connectionToLanguageService.getForUri(editor.getPath());
      if (languageService == null || fileVersion == null) {
        return null;
      }

      return yield (yield languageService).getDiagnostics(fileVersion);
    })();
  }
};
let ObservableDiagnosticProvider = exports.ObservableDiagnosticProvider = class ObservableDiagnosticProvider {

  constructor(analyticsEventName, connectionToLanguageService) {
    this._analyticsEventName = analyticsEventName;
    this._connectionToFiles = new (_Cache || _load_Cache()).Cache(connection => new Set());
    this._connectionToLanguageService = connectionToLanguageService;
    this.updates = this._connectionToLanguageService.observeEntries().mergeMap((_ref2) => {
      var _ref3 = _slicedToArray(_ref2, 2);

      let connection = _ref3[0],
          languageService = _ref3[1];

      return _rxjsBundlesRxMinJs.Observable.fromPromise(languageService).catch(error => _rxjsBundlesRxMinJs.Observable.empty()).mergeMap(language => {
        return language.observeDiagnostics().refCount().catch(error => _rxjsBundlesRxMinJs.Observable.empty());
      }).map((_ref4) => {
        let filePath = _ref4.filePath,
            messages = _ref4.messages;

        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(this._analyticsEventName);
        const fileCache = this._connectionToFiles.get(connection);
        if (messages.length === 0) {
          fileCache.delete(filePath);
        } else {
          fileCache.add(filePath);
        }
        return {
          filePathToMessages: new Map([[filePath, messages]])
        };
      });
    });

    this.invalidations = (0, (_event || _load_event()).observableFromSubscribeFunction)((_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.onDidCloseServerConnection).map(connection => {
      const files = Array.from(this._connectionToFiles.get(connection));
      this._connectionToFiles.delete(connection);
      return {
        scope: 'file',
        filePaths: files
      };
    });
  }
};