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

exports.registerDiagnostics = registerDiagnostics;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _commonsNodePromise;

function _load_commonsNodePromise() {
  return _commonsNodePromise = require('../../commons-node/promise');
}

var _nuclideDiagnosticsProviderBase;

function _load_nuclideDiagnosticsProviderBase() {
  return _nuclideDiagnosticsProviderBase = require('../../nuclide-diagnostics-provider-base');
}

var _commonsAtomProjects;

function _load_commonsAtomProjects() {
  return _commonsAtomProjects = require('../../commons-atom/projects');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _nuclideOpenFiles;

function _load_nuclideOpenFiles() {
  return _nuclideOpenFiles = require('../../nuclide-open-files');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _nuclideRemoteConnection2;

function _load_nuclideRemoteConnection2() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var _commonsNodeEvent;

function _load_commonsNodeEvent() {
  return _commonsNodeEvent = require('../../commons-node/event');
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideBusySignal;

function _load_nuclideBusySignal() {
  return _nuclideBusySignal = require('../../nuclide-busy-signal');
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var diagnosticService = 'nuclide-diagnostics-provider';

function registerDiagnostics(name, grammars, config, connectionToLanguageService) {
  var result = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default();
  var provider = undefined;
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

var FileDiagnosticsProvider = (function () {
  function FileDiagnosticsProvider(name, grammars, shouldRunOnTheFly, analyticsEventName, connectionToLanguageService) {
    var _this = this;

    var busySignalProvider = arguments.length <= 5 || arguments[5] === undefined ? new (_nuclideBusySignal || _load_nuclideBusySignal()).BusySignalProviderBase() : arguments[5];
    var ProviderBase = arguments.length <= 6 || arguments[6] === undefined ? (_nuclideDiagnosticsProviderBase || _load_nuclideDiagnosticsProviderBase()).DiagnosticsProviderBase : arguments[6];

    _classCallCheck(this, FileDiagnosticsProvider);

    this.name = name;
    this._analyticsEventName = analyticsEventName;
    this._busySignalProvider = busySignalProvider;
    this._connectionToLanguageService = connectionToLanguageService;
    var utilsOptions = {
      grammarScopes: new Set(grammars),
      shouldRunOnTheFly: shouldRunOnTheFly,
      onTextEditorEvent: function onTextEditorEvent(editor) {
        return _this._runDiagnostics(editor);
      },
      onNewUpdateSubscriber: function onNewUpdateSubscriber(callback) {
        return _this._receivedNewUpdateSubscriber(callback);
      }
    };
    this._providerBase = new ProviderBase(utilsOptions);
    this._requestSerializer = new (_commonsNodePromise || _load_commonsNodePromise()).RequestSerializer();
    this._projectRootToFilePaths = new Map();
    this._subscriptions = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default();
    this._subscriptions.add((0, (_commonsAtomProjects || _load_commonsAtomProjects()).onDidRemoveProjectPath)(function (projectPath) {
      _this.invalidateProjectPath(projectPath);
    }), this._providerBase, atom.packages.serviceHub.provide('nuclide-busy-signal', '0.1.0', busySignalProvider));
  }

  _createClass(FileDiagnosticsProvider, [{
    key: '_runDiagnostics',
    value: function _runDiagnostics(textEditor) {
      var _this2 = this;

      this._busySignalProvider.reportBusy(this.name + ': Waiting for diagnostics', function () {
        return _this2._runDiagnosticsImpl(textEditor);
      });
    }
  }, {
    key: '_runDiagnosticsImpl',
    value: function _runDiagnosticsImpl(textEditor) {
      var _this3 = this;

      return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)(this._analyticsEventName, _asyncToGenerator(function* () {
        var filePath = textEditor.getPath();
        if (filePath == null) {
          return;
        }

        // `hh_client` doesn't currently support `onTheFly` diagnosis.
        // So, currently, it would only work if there is no `hh_client` or `.hhconfig` where
        // the `HackWorker` model will diagnose with the updated editor contents.
        var diagnosisResult = yield _this3._requestSerializer.run(_this3.findDiagnostics(textEditor));
        if (diagnosisResult.status === 'success' && diagnosisResult.result == null) {
          (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('hh_client could not be reached');
        }
        if (diagnosisResult.status === 'outdated' || diagnosisResult.result == null) {
          return;
        }

        var diagnostics = diagnosisResult.result;
        filePath = textEditor.getPath();
        if (filePath == null) {
          return;
        }
        var languageService = _this3._connectionToLanguageService.getForUri(filePath);
        if (languageService == null) {
          return;
        }
        var projectRoot = yield (yield languageService).getProjectRoot(filePath);
        if (projectRoot == null) {
          return;
        }

        _this3._providerBase.publishMessageInvalidation({ scope: 'file', filePaths: [filePath] });
        _this3._invalidatePathsForProjectRoot(projectRoot);

        var pathsForHackLanguage = new Set();
        _this3._projectRootToFilePaths.set(projectRoot, pathsForHackLanguage);
        var addPath = function addPath(path) {
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

        _this3._providerBase.publishMessageUpdate(diagnostics);
      }));
    }
  }, {
    key: '_getPathsToInvalidate',
    value: function _getPathsToInvalidate(projectRoot) {
      var filePaths = this._projectRootToFilePaths.get(projectRoot);
      if (!filePaths) {
        return [];
      }
      return Array.from(filePaths);
    }
  }, {
    key: '_receivedNewUpdateSubscriber',
    value: function _receivedNewUpdateSubscriber(callback) {
      // Every time we get a new subscriber, we need to push results to them. This
      // logic is common to all providers and should be abstracted out (t7813069)
      //
      // Once we provide all diagnostics, instead of just the current file, we can
      // probably remove the activeTextEditor parameter.
      var activeTextEditor = atom.workspace.getActiveTextEditor();
      if (activeTextEditor) {
        if (this._providerBase.getGrammarScopes().has(activeTextEditor.getGrammar().scopeName)) {
          this._runDiagnostics(activeTextEditor);
        }
      }
    }
  }, {
    key: 'setRunOnTheFly',
    value: function setRunOnTheFly(runOnTheFly) {
      this._providerBase.setRunOnTheFly(runOnTheFly);
    }
  }, {
    key: 'onMessageUpdate',
    value: function onMessageUpdate(callback) {
      return this._providerBase.onMessageUpdate(callback);
    }
  }, {
    key: 'onMessageInvalidation',
    value: function onMessageInvalidation(callback) {
      return this._providerBase.onMessageInvalidation(callback);
    }

    // Called when a directory is removed from the file tree.
  }, {
    key: 'invalidateProjectPath',
    value: function invalidateProjectPath(projectPath) {
      var _this4 = this;

      Array.from(this._projectRootToFilePaths.keys())
      // This filter is over broad, the real filter should be
      // no open dir in the File Tree contains the root.
      // This will err on the side of removing messages,
      // which should be fine, as they will come back once a file is reopened
      // or edited.
      .filter(function (rootPath) {
        return (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.contains(projectPath, rootPath) || (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.contains(rootPath, projectPath);
      }).forEach(function (removedPath) {
        _this4._invalidatePathsForProjectRoot(removedPath);
      });
    }
  }, {
    key: '_invalidatePathsForProjectRoot',
    value: function _invalidatePathsForProjectRoot(projectRoot) {
      var pathsToInvalidate = this._getPathsToInvalidate(projectRoot);
      this._providerBase.publishMessageInvalidation({ scope: 'file', filePaths: pathsToInvalidate });
      this._projectRootToFilePaths.delete(projectRoot);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
    }
  }, {
    key: 'findDiagnostics',
    value: _asyncToGenerator(function* (editor) {
      var fileVersion = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);
      var languageService = this._connectionToLanguageService.getForUri(editor.getPath());
      if (languageService == null || fileVersion == null) {
        return null;
      }

      return yield (yield languageService).getDiagnostics(fileVersion);
    })
  }]);

  return FileDiagnosticsProvider;
})();

exports.FileDiagnosticsProvider = FileDiagnosticsProvider;

var ObservableDiagnosticProvider = function ObservableDiagnosticProvider(analyticsEventName, connectionToLanguageService) {
  var _this5 = this;

  _classCallCheck(this, ObservableDiagnosticProvider);

  this._analyticsEventName = analyticsEventName;
  this._connectionToLanguageService = connectionToLanguageService;
  this.updates = this._connectionToLanguageService.observeValues().switchMap(function (languageService) {
    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromPromise(languageService);
  }).mergeMap(function (language) {
    return language.observeDiagnostics().refCount();
  }).map(function (_ref) {
    var filePath = _ref.filePath;
    var messages = _ref.messages;

    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(_this5._analyticsEventName);
    return {
      filePathToMessages: new Map([[filePath, messages]])
    };
  });

  // TODO: Per file invalidations?
  this.invalidations = (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)((_nuclideRemoteConnection2 || _load_nuclideRemoteConnection2()).ServerConnection.onDidCloseServerConnection).map(function (connection) {
    return {
      scope: 'file',
      // TODO: Does this work for invalidating an entire ServerConnection?
      // TODO: What about windows?
      filePaths: [connection.getUriOfRemotePath('/')]
    };
  });
};

exports.ObservableDiagnosticProvider = ObservableDiagnosticProvider;

/**
 * Maps hack root to the set of file paths under that root for which we have
 * ever reported diagnostics.
 */