"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerDiagnostics = registerDiagnostics;
exports.ObservableDiagnosticProvider = exports.FileDiagnosticsProvider = void 0;

function _cache() {
  const data = require("../../../modules/nuclide-commons/cache");

  _cache = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _DiagnosticsProviderBase() {
  const data = require("./DiagnosticsProviderBase");

  _DiagnosticsProviderBase = function () {
    return data;
  };

  return data;
}

function _projects() {
  const data = require("../../../modules/nuclide-commons-atom/projects");

  _projects = function () {
    return data;
  };

  return data;
}

function _nuclideOpenFiles() {
  const data = require("../../nuclide-open-files");

  _nuclideOpenFiles = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _nuclideLanguageServiceRpc() {
  const data = require("../../nuclide-language-service-rpc");

  _nuclideLanguageServiceRpc = function () {
    return data;
  };

  return data;
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
  const result = new (_UniversalDisposable().default)();
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
      config.version;
      throw new Error('Unexpected diagnostics version');
  }

  result.add(atom.packages.serviceHub.provide('DEPRECATED-diagnostics', config.version, provider));
  return result;
}

class FileDiagnosticsProvider {
  /**
   * Maps hack root to the set of file paths under that root for which we have
   * ever reported diagnostics.
   */
  constructor(name, grammars, shouldRunOnTheFly, analyticsEventName, connectionToLanguageService, busySignalProvider, ProviderBase = _DiagnosticsProviderBase().DiagnosticsProviderBase) {
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
    this._requestSerializer = new (_promise().RequestSerializer)();
    this._projectRootToFilePaths = new Map();
    this._subscriptions = new (_UniversalDisposable().default)();

    this._subscriptions.add((0, _projects().onDidRemoveProjectPath)(projectPath => {
      this.invalidateProjectPath(projectPath);
    }), this._providerBase);
  }

  _runDiagnostics(textEditor) {
    this._busySignalProvider.reportBusyWhile(`${this.name}: Waiting for diagnostics`, () => this._runDiagnosticsImpl(textEditor));
  }

  _runDiagnosticsImpl(textEditor) {
    return (0, _nuclideAnalytics().trackTiming)(this._analyticsEventName, async () => {
      let filePath = textEditor.getPath();

      if (filePath == null) {
        return;
      }

      const diagnosisResult = await this._requestSerializer.run(this.findDiagnostics(textEditor));

      if (diagnosisResult.status === 'outdated' || diagnosisResult.result == null) {
        return;
      }

      const diagnostics = diagnosisResult.result;
      filePath = textEditor.getPath();

      if (filePath == null) {
        return;
      }

      const languageService = this._connectionToLanguageService.getForUri(filePath);

      if (languageService == null) {
        return;
      }

      const projectRoot = await (await languageService).getProjectRoot(filePath);

      if (projectRoot == null) {
        return;
      }

      this._providerBase.publishMessageInvalidation({
        scope: 'file',
        filePaths: [filePath]
      });

      this._invalidatePathsForProjectRoot(projectRoot);

      const pathsForHackLanguage = new Set();

      this._projectRootToFilePaths.set(projectRoot, pathsForHackLanguage);

      const addPath = path => {
        if (path != null) {
          pathsForHackLanguage.add(path);
        }
      };

      diagnostics.forEach((messages, messagePath) => {
        addPath(messagePath);
        messages.forEach(message => {
          addPath(message.filePath);

          if (message.trace != null) {
            message.trace.forEach(trace => {
              addPath(trace.filePath);
            });
          }
        });
      });

      this._providerBase.publishMessageUpdate(diagnostics);
    });
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
  } // Called when a directory is removed from the file tree.


  invalidateProjectPath(projectPath) {
    Array.from(this._projectRootToFilePaths.keys()) // This filter is over broad, the real filter should be
    // no open dir in the File Tree contains the root.
    // This will err on the side of removing messages,
    // which should be fine, as they will come back once a file is reopened
    // or edited.
    .filter(rootPath => _nuclideUri().default.contains(projectPath, rootPath) || _nuclideUri().default.contains(rootPath, projectPath)).forEach(removedPath => {
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

  async findDiagnostics(editor) {
    const fileVersion = await (0, _nuclideOpenFiles().getFileVersionOfEditor)(editor);

    const languageService = this._connectionToLanguageService.getForUri(editor.getPath());

    if (languageService == null || fileVersion == null) {
      return null;
    }

    return (await languageService).getDiagnostics(fileVersion);
  }

}

exports.FileDiagnosticsProvider = FileDiagnosticsProvider;

class ObservableDiagnosticProvider {
  constructor(analyticsEventName, grammars, logger, connectionToLanguageService) {
    this._grammarScopes = new Set(grammars);
    this._logger = logger;
    this._analyticsEventName = analyticsEventName;
    this._connectionToFiles = new (_cache().Cache)(connection => new Set());
    this._connectionToLanguageService = connectionToLanguageService;
    this.updates = this._connectionToLanguageService.observeEntries().mergeMap(([connection, languageService]) => {
      const connectionName = _nuclideRemoteConnection().ServerConnection.toDebugString(connection);

      this._logger.debug(`Starting observing diagnostics ${connectionName}, ${this._analyticsEventName}`);

      return _RxMin.Observable.fromPromise(languageService).catch(error => {
        this._logger.error(`Error: languageService, ${this._analyticsEventName}`, error);

        return _RxMin.Observable.empty();
      }).mergeMap(language => {
        this._logger.debug(`Observing diagnostics ${connectionName}, ${this._analyticsEventName}`);

        return (0, _nuclideLanguageServiceRpc().ensureInvalidations)(this._logger, language.observeDiagnostics().refCount().catch(error => {
          this._logger.error(`Error: observeDiagnostics, ${this._analyticsEventName}`, error);

          return _RxMin.Observable.empty();
        }));
      }).map(updates => {
        const filePathToMessages = new Map();
        updates.forEach((messages, filePath) => {
          const fileCache = this._connectionToFiles.get(connection);

          if (messages.length === 0) {
            fileCache.delete(filePath);
          } else {
            fileCache.add(filePath);
          }

          filePathToMessages.set(filePath, messages);
        });
        return filePathToMessages;
      });
    }).catch(error => {
      this._logger.error(`Error: observeEntries, ${this._analyticsEventName}`, error);

      throw error;
    });
    this.invalidations = (0, _event().observableFromSubscribeFunction)(_nuclideRemoteConnection().ServerConnection.onDidCloseServerConnection).map(connection => {
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
    }); // this._connectionToFiles is lazy, but diagnostics should appear as soon as
    // a file belonging to the connection is open.
    // Monitor open text editors and trigger a connection for each one, if needed.

    this._subscriptions = new (_UniversalDisposable().default)(atom.workspace.observeTextEditors(editor => {
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