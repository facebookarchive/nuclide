var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var findDiagnostics = _asyncToGenerator(function* (editor) {
  var filePath = editor.getPath();
  var hackLanguage = yield (0, (_HackLanguage2 || _HackLanguage()).getHackLanguageForUri)(filePath);
  if (!hackLanguage || !filePath) {
    return [];
  }

  (0, (_assert2 || _assert()).default)(filePath);
  var contents = editor.getText();

  return yield hackLanguage.getDiagnostics(filePath, contents);
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _HackLanguage2;

function _HackLanguage() {
  return _HackLanguage2 = require('./HackLanguage');
}

var _commonsNodePromise2;

function _commonsNodePromise() {
  return _commonsNodePromise2 = require('../../commons-node/promise');
}

var _nuclideDiagnosticsProviderBase2;

function _nuclideDiagnosticsProviderBase() {
  return _nuclideDiagnosticsProviderBase2 = require('../../nuclide-diagnostics-provider-base');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideHackCommon2;

function _nuclideHackCommon() {
  return _nuclideHackCommon2 = require('../../nuclide-hack-common');
}

/**
 * Currently, a diagnostic from Hack is an object with a "message" property.
 * Each item in the "message" array is an object with the following fields:
 *     - path (string) File that contains the error.
 *     - descr (string) Description of the error.
 *     - line (number) Start line.
 *     - endline (number) End line.
 *     - start (number) Start column.
 *     - end (number) End column.
 *     - code (number) Presumably an error code.
 * The message array may have more than one item. For example, if there is a
 * type incompatibility error, the first item in the message array blames the
 * usage of the wrong type and the second blames the declaration of the type
 * with which the usage disagrees. Note that these could occur in different
 * files.
 */
function extractRange(message) {
  // It's unclear why the 1-based to 0-based indexing works the way that it
  // does, but this has the desired effect in the UI, in practice.
  return new (_atom2 || _atom()).Range([message.line - 1, message.start - 1], [message.line - 1, message.end]);
}

// A trace object is very similar to an error object.
function hackMessageToTrace(traceError) {
  return {
    type: 'Trace',
    text: traceError.descr,
    filePath: traceError.path,
    range: extractRange(traceError)
  };
}

function hackMessageToDiagnosticMessage(hackDiagnostic) {
  var hackMessages = hackDiagnostic.message;

  var causeMessage = hackMessages[0];
  (0, (_assert2 || _assert()).default)(causeMessage.path != null);
  var diagnosticMessage = {
    scope: 'file',
    providerName: 'Hack: ' + hackMessages[0].code,
    type: 'Error',
    text: causeMessage.descr,
    filePath: causeMessage.path,
    range: extractRange(causeMessage)
  };

  // When the message is an array with multiple elements, the second element
  // onwards comprise the trace for the error.
  if (hackMessages.length > 1) {
    diagnosticMessage.trace = hackMessages.slice(1).map(hackMessageToTrace);
  }

  return diagnosticMessage;
}

var HackDiagnosticsProvider = (function () {
  function HackDiagnosticsProvider(shouldRunOnTheFly, busySignalProvider) {
    var _this = this;

    var ProviderBase = arguments.length <= 2 || arguments[2] === undefined ? (_nuclideDiagnosticsProviderBase2 || _nuclideDiagnosticsProviderBase()).DiagnosticsProviderBase : arguments[2];

    _classCallCheck(this, HackDiagnosticsProvider);

    this._busySignalProvider = busySignalProvider;
    var utilsOptions = {
      grammarScopes: (_nuclideHackCommon2 || _nuclideHackCommon()).HACK_GRAMMARS_SET,
      shouldRunOnTheFly: shouldRunOnTheFly,
      onTextEditorEvent: function onTextEditorEvent(editor) {
        return _this._runDiagnostics(editor);
      },
      onNewUpdateSubscriber: function onNewUpdateSubscriber(callback) {
        return _this._receivedNewUpdateSubscriber(callback);
      }
    };
    this._providerBase = new ProviderBase(utilsOptions);
    this._requestSerializer = new (_commonsNodePromise2 || _commonsNodePromise()).RequestSerializer();
    this._hackLanguageToFilePaths = new Map();
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
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('hack.run-diagnostics')],
    value: _asyncToGenerator(function* (textEditor) {
      var filePath = textEditor.getPath();
      if (!filePath) {
        return;
      }

      // `hh_client` doesn't currently support `onTheFly` diagnosis.
      // So, currently, it would only work if there is no `hh_client` or `.hhconfig` where
      // the `HackWorker` model will diagnose with the updated editor contents.
      var diagnosisResult = yield this._requestSerializer.run(findDiagnostics(textEditor));
      if (diagnosisResult.status === 'outdated' || diagnosisResult.result == null) {
        return;
      }

      var diagnostics = diagnosisResult.result;
      var hackLanguage = yield (0, (_HackLanguage2 || _HackLanguage()).getHackLanguageForUri)(textEditor.getPath());
      if (!hackLanguage) {
        return;
      }

      this._providerBase.publishMessageInvalidation({ scope: 'file', filePaths: [filePath] });
      this._invalidatePathsForHackLanguage(hackLanguage);

      var pathsForHackLanguage = new Set();
      this._hackLanguageToFilePaths.set(hackLanguage, pathsForHackLanguage);
      for (var diagnostic of diagnostics) {
        /*
         * Each message consists of several different components, each with its
         * own text and path.
         */
        for (var diagnosticMessage of diagnostic.message) {
          pathsForHackLanguage.add(diagnosticMessage.path);
        }
      }

      this._providerBase.publishMessageUpdate(this._processDiagnostics(diagnostics));
    })
  }, {
    key: '_processDiagnostics',
    value: function _processDiagnostics(diagnostics) {
      // Convert array messages to Error Objects with Traces.
      var fileDiagnostics = diagnostics.map(hackMessageToDiagnosticMessage);

      var filePathToMessages = new Map();
      for (var diagnostic of fileDiagnostics) {
        var path = diagnostic.filePath;
        var diagnosticArray = filePathToMessages.get(path);
        if (!diagnosticArray) {
          diagnosticArray = [];
          filePathToMessages.set(path, diagnosticArray);
        }
        diagnosticArray.push(diagnostic);
      }

      return { filePathToMessages: filePathToMessages };
    }
  }, {
    key: '_getPathsToInvalidate',
    value: function _getPathsToInvalidate(hackLanguage) {
      if (!hackLanguage.isHackAvailable()) {
        return [];
      }
      var filePaths = this._hackLanguageToFilePaths.get(hackLanguage);
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
        if ((_nuclideHackCommon2 || _nuclideHackCommon()).HACK_GRAMMARS_SET.has(activeTextEditor.getGrammar().scopeName)) {
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
  }, {
    key: 'invalidateProjectPath',
    value: function invalidateProjectPath(projectPath) {
      var hackLanguage = (0, (_HackLanguage2 || _HackLanguage()).getCachedHackLanguageForUri)(projectPath);
      if (!hackLanguage) {
        return;
      }
      this._invalidatePathsForHackLanguage(hackLanguage);
    }
  }, {
    key: '_invalidatePathsForHackLanguage',
    value: function _invalidatePathsForHackLanguage(hackLanguage) {
      var pathsToInvalidate = this._getPathsToInvalidate(hackLanguage);
      this._providerBase.publishMessageInvalidation({ scope: 'file', filePaths: pathsToInvalidate });
      this._hackLanguageToFilePaths.delete(hackLanguage);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._providerBase.dispose();
    }
  }]);

  return HackDiagnosticsProvider;
})();

module.exports = HackDiagnosticsProvider;

/**
 * Maps hack root to the set of file paths under that root for which we have
 * ever reported diagnostics.
 */