'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ObservableDiagnosticProvider = exports.FileDiagnosticsProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.registerDiagnostics = registerDiagnostics;

var _cache;

function _load_cache() {
  return _cache = require('nuclide-commons/cache');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _DiagnosticsProviderBase;

function _load_DiagnosticsProviderBase() {
  return _DiagnosticsProviderBase = require('./DiagnosticsProviderBase');
}

var _projects;

function _load_projects() {
  return _projects = require('nuclide-commons-atom/projects');
}

var _nuclideOpenFiles;

function _load_nuclideOpenFiles() {
  return _nuclideOpenFiles = require('../../nuclide-open-files');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('nuclide-commons-atom/text-editor');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _nuclideLanguageServiceRpc;

function _load_nuclideLanguageServiceRpc() {
  return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function registerDiagnostics(name, grammars, config, logger, connectionToLanguageService, busySignalProvider) {
  const result = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  let provider;
  switch (config.version) {
    case '0.1.0':
      provider = new FileDiagnosticsProvider(name, grammars, config.shouldRunOnTheFly, config.analyticsEventName, connectionToLanguageService, busySignalProvider);
      result.add(provider);
      break;
    case '0.2.0':
      provider = new ObservableDiagnosticProvider(config.analyticsEventName, grammars, logger, connectionToLanguageService);
      break;
    default:
      throw new Error('Unexpected diagnostics version');
  }
  result.add(atom.packages.serviceHub.provide('DEPRECATED-diagnostics', config.version, provider));
  return result;
}

class FileDiagnosticsProvider {

  constructor(name, grammars, shouldRunOnTheFly, analyticsEventName, connectionToLanguageService, busySignalProvider, ProviderBase = (_DiagnosticsProviderBase || _load_DiagnosticsProviderBase()).DiagnosticsProviderBase) {
    this.name = name;
    this._analyticsEventName = analyticsEventName;
    this._busySignalProvider = busySignalProvider;
    this._connectionToLanguageService = connectionToLanguageService;
    const utilsOptions = {
      grammarScopes: new Set(grammars),
      shouldRunOnTheFly,
      onTextEditorEvent: editor => this._runDiagnostics(editor),
      onNewUpdateSubscriber: callback => this._receivedNewUpdateSubscriber(callback)
    };
    this._providerBase = new ProviderBase(utilsOptions);
    this._requestSerializer = new (_promise || _load_promise()).RequestSerializer();
    this._projectRootToFilePaths = new Map();
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._subscriptions.add((0, (_projects || _load_projects()).onDidRemoveProjectPath)(projectPath => {
      this.invalidateProjectPath(projectPath);
    }), this._providerBase);
  }

  /**
   * Maps hack root to the set of file paths under that root for which we have
   * ever reported diagnostics.
   */


  _runDiagnostics(textEditor) {
    this._busySignalProvider.reportBusyWhile(`${this.name}: Waiting for diagnostics`, () => this._runDiagnosticsImpl(textEditor));
  }

  _runDiagnosticsImpl(textEditor) {
    var _this = this;

    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(this._analyticsEventName, (0, _asyncToGenerator.default)(function* () {
      let filePath = textEditor.getPath();
      if (filePath == null) {
        return;
      }

      const diagnosisResult = yield _this._requestSerializer.run(_this.findDiagnostics(textEditor));
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

      _this._providerBase.publishMessageInvalidation({
        scope: 'file',
        filePaths: [filePath]
      });
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
    if (activeTextEditor && !(_nuclideUri || _load_nuclideUri()).default.isBrokenDeserializedUri(activeTextEditor.getPath())) {
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
    this._providerBase.publishMessageInvalidation({
      scope: 'file',
      filePaths: pathsToInvalidate
    });
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

      return (yield languageService).getDiagnostics(fileVersion);
    })();
  }
}

exports.FileDiagnosticsProvider = FileDiagnosticsProvider;
class ObservableDiagnosticProvider {

  constructor(analyticsEventName, grammars, logger, connectionToLanguageService) {
    this._grammarScopes = new Set(grammars);
    this._logger = logger;
    this._analyticsEventName = analyticsEventName;
    this._connectionToFiles = new (_cache || _load_cache()).Cache(connection => new Set());
    this._connectionToLanguageService = connectionToLanguageService;
    this.updates = this._connectionToLanguageService.observeEntries().mergeMap(([connection, languageService]) => {
      const connectionName = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.toDebugString(connection);
      this._logger.debug(`Starting observing diagnostics ${connectionName}, ${this._analyticsEventName}`);
      return _rxjsBundlesRxMinJs.Observable.fromPromise(languageService).catch(error => {
        this._logger.error(`Error: languageService, ${this._analyticsEventName} ${error}`);
        return _rxjsBundlesRxMinJs.Observable.empty();
      }).mergeMap(language => {
        this._logger.debug(`Observing diagnostics ${connectionName}, ${this._analyticsEventName}`);
        return (0, (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).ensureInvalidations)(this._logger, language.observeDiagnostics().refCount().catch(error => {
          this._logger.error(`Error: observeDiagnostics, ${this._analyticsEventName}`, error);
          return _rxjsBundlesRxMinJs.Observable.empty();
        }));
      }).map(updates => {
        const filePathToMessages = new Map();
        updates.forEach(update => {
          const { filePath, messages } = update;
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(this._analyticsEventName);
          const fileCache = this._connectionToFiles.get(connection);
          if (messages.length === 0) {
            this._logger.debug(`Observing diagnostics: removing ${filePath}, ${this._analyticsEventName}`);
            fileCache.delete(filePath);
          } else {
            this._logger.debug(`Observing diagnostics: adding ${filePath}, ${this._analyticsEventName}`);
            fileCache.add(filePath);
          }
          filePathToMessages.set(filePath, messages);
        });
        return {
          filePathToMessages
        };
      });
    }).catch(error => {
      this._logger.error(`Error: observeEntries, ${this._analyticsEventName}`, error);
      throw error;
    });

    this.invalidations = (0, (_event || _load_event()).observableFromSubscribeFunction)((_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.onDidCloseServerConnection).map(connection => {
      this._logger.debug(`Diagnostics closing ${connection.getRemoteHostname()}, ${this._analyticsEventName}`);
      const files = Array.from(this._connectionToFiles.get(connection));
      this._connectionToFiles.delete(connection);
      return {
        scope: 'file',
        filePaths: files
      };
    }).catch(error => {
      this._logger.error(`Error: invalidations, ${this._analyticsEventName} ${error}`);
      throw error;
    });

    // this._connectionToFiles is lazy, but diagnostics should appear as soon as
    // a file belonging to the connection is open.
    // Monitor open text editors and trigger a connection for each one, if needed.
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default((0, (_textEditor || _load_textEditor()).observeTextEditors)(editor => {
      const path = editor.getPath();
      if (path != null && this._grammarScopes.has(editor.getGrammar().scopeName)) {
        this._connectionToLanguageService.getForUri(path);
      }
    }));
  }

  dispose() {
    this._subscriptions.dispose();
  }
}
exports.ObservableDiagnosticProvider = ObservableDiagnosticProvider;