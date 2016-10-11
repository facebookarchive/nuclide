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

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

var findDiagnostics = _asyncToGenerator(function* (editor) {
  var fileVersion = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);
  var hackLanguage = yield (0, (_HackLanguage || _load_HackLanguage()).getHackLanguageForUri)(editor.getPath());
  if (hackLanguage == null || fileVersion == null) {
    return null;
  }

  return yield hackLanguage.getDiagnostics(fileVersion);
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _HackLanguage;

function _load_HackLanguage() {
  return _HackLanguage = require('./HackLanguage');
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

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _commonsNodeEvent;

function _load_commonsNodeEvent() {
  return _commonsNodeEvent = require('../../commons-node/event');
}

var _nuclideHackCommon;

function _load_nuclideHackCommon() {
  return _nuclideHackCommon = require('../../nuclide-hack-common');
}

var HackDiagnosticsProvider = (function () {
  function HackDiagnosticsProvider(shouldRunOnTheFly, busySignalProvider) {
    var _this = this;

    var ProviderBase = arguments.length <= 2 || arguments[2] === undefined ? (_nuclideDiagnosticsProviderBase || _load_nuclideDiagnosticsProviderBase()).DiagnosticsProviderBase : arguments[2];

    _classCallCheck(this, HackDiagnosticsProvider);

    this._busySignalProvider = busySignalProvider;
    var utilsOptions = {
      grammarScopes: (_nuclideHackCommon || _load_nuclideHackCommon()).HACK_GRAMMARS_SET,
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
    this._subscription = (0, (_commonsAtomProjects || _load_commonsAtomProjects()).onDidRemoveProjectPath)(function (projectPath) {
      _this.invalidateProjectPath(projectPath);
    });
  }

  _createDecoratedClass(HackDiagnosticsProvider, [{
    key: '_runDiagnostics',
    value: function _runDiagnostics(textEditor) {
      var _this2 = this;

      this._busySignalProvider.reportBusy('Hack: Waiting for diagnostics', function () {
        return _this2._runDiagnosticsImpl(textEditor);
      });
    }
  }, {
    key: '_runDiagnosticsImpl',
    decorators: [(0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('hack.run-diagnostics')],
    value: _asyncToGenerator(function* (textEditor) {
      var filePath = textEditor.getPath();
      if (filePath == null) {
        return;
      }

      // `hh_client` doesn't currently support `onTheFly` diagnosis.
      // So, currently, it would only work if there is no `hh_client` or `.hhconfig` where
      // the `HackWorker` model will diagnose with the updated editor contents.
      var diagnosisResult = yield this._requestSerializer.run(findDiagnostics(textEditor));
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
      var hackLanguage = yield (0, (_HackLanguage || _load_HackLanguage()).getHackLanguageForUri)(filePath);
      if (hackLanguage == null) {
        return;
      }
      var projectRoot = yield hackLanguage.getProjectRoot(filePath);
      if (projectRoot == null) {
        return;
      }

      this._providerBase.publishMessageInvalidation({ scope: 'file', filePaths: [filePath] });
      this._invalidatePathsForProjectRoot(projectRoot);

      var pathsForHackLanguage = new Set();
      this._projectRootToFilePaths.set(projectRoot, pathsForHackLanguage);
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

      this._providerBase.publishMessageUpdate(diagnostics);
    })
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
        if ((_nuclideHackCommon || _load_nuclideHackCommon()).HACK_GRAMMARS_SET.has(activeTextEditor.getGrammar().scopeName)) {
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
      var _this3 = this;

      Array.from(this._projectRootToFilePaths.keys())
      // This filter is over broad, the real filter should be
      // no open dir in the File Tree contains the root.
      // This will err on the side of removing messages,
      // which should be fine, as they will come back once a file is reopened
      // or edited.
      .filter(function (rootPath) {
        return (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.contains(projectPath, rootPath) || (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.contains(rootPath, projectPath);
      }).forEach(function (removedPath) {
        _this3._invalidatePathsForProjectRoot(removedPath);
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
      this._subscription.dispose();
      this._providerBase.dispose();
    }
  }]);

  return HackDiagnosticsProvider;
})();

exports.HackDiagnosticsProvider = HackDiagnosticsProvider;

var ObservableDiagnosticProvider = function ObservableDiagnosticProvider() {
  _classCallCheck(this, ObservableDiagnosticProvider);

  this.updates = (0, (_HackLanguage || _load_HackLanguage()).observeHackLanguages)().mergeMap(function (language) {
    return language.observeDiagnostics();
  }).map(function (_ref) {
    var filePath = _ref.filePath;
    var messages = _ref.messages;
    return {
      filePathToMessages: new Map([[filePath, messages]])
    };
  });

  // TODO: Per file invalidations?
  this.invalidations = (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)((_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.onDidCloseServerConnection).map(function (connection) {
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