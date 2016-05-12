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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _HackLanguage2;

function _HackLanguage() {
  return _HackLanguage2 = require('./HackLanguage');
}

var _nuclideDiagnosticsProviderBase2;

function _nuclideDiagnosticsProviderBase() {
  return _nuclideDiagnosticsProviderBase2 = require('../../nuclide-diagnostics-provider-base');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _nuclideCommons2;

function _nuclideCommons() {
  return _nuclideCommons2 = require('../../nuclide-commons');
}

var _nuclideAtomHelpers2;

function _nuclideAtomHelpers() {
  return _nuclideAtomHelpers2 = require('../../nuclide-atom-helpers');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideHackCommon2;

function _nuclideHackCommon() {
  return _nuclideHackCommon2 = require('../../nuclide-hack-common');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

var RequestSerializer = (_nuclideCommons2 || _nuclideCommons()).promises.RequestSerializer;

// Provides Diagnostics for un-typed regions of Hack code.

var TypeCoverageProvider = (function () {
  function TypeCoverageProvider(busySignalProvider) {
    var _this = this;

    _classCallCheck(this, TypeCoverageProvider);

    this._busySignalProvider = busySignalProvider;
    var shouldRunOnTheFly = false;
    var utilsOptions = {
      grammarScopes: (_nuclideHackCommon2 || _nuclideHackCommon()).HACK_GRAMMARS_SET,
      shouldRunOnTheFly: shouldRunOnTheFly,
      onTextEditorEvent: function onTextEditorEvent(editor) {
        return _this._runTypeCoverage(editor);
      },
      onNewUpdateSubscriber: function onNewUpdateSubscriber(callback) {
        return _this._receivedNewUpdateSubscriber(callback);
      }
    };
    this._providerBase = new (_nuclideDiagnosticsProviderBase2 || _nuclideDiagnosticsProviderBase()).DiagnosticsProviderBase(utilsOptions);
    this._requestSerializer = new RequestSerializer();
    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();
    this._subscriptions.add((0, (_nuclideAtomHelpers2 || _nuclideAtomHelpers()).onWillDestroyTextBuffer)(function (buffer) {
      var path = buffer.getPath();
      if (!path) {
        return;
      }
      _this._providerBase.publishMessageInvalidation({ scope: 'file', filePaths: [path] });
    }));

    this._checkExistingBuffers();
  }

  _createDecoratedClass(TypeCoverageProvider, [{
    key: '_checkExistingBuffers',
    value: _asyncToGenerator(function* () {
      var existingEditors = atom.project.getBuffers().map(function (buffer) {
        var path = buffer.getPath();
        if (path == null || path === '') {
          return null;
        }
        return (0, (_nuclideAtomHelpers2 || _nuclideAtomHelpers()).existingEditorForUri)(buffer.getPath());
      }).filter(function (editor) {
        return editor != null && (_nuclideHackCommon2 || _nuclideHackCommon()).HACK_GRAMMARS_SET.has(editor.getGrammar().scopeName);
      });
      for (var editor of existingEditors) {
        (0, (_assert2 || _assert()).default)(editor);
        /* eslint-disable babel/no-await-in-loop */
        yield this._runTypeCoverage(editor);
        /* eslint-enable babel/no-await-in-loop */
      }
    })
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
      this._providerBase.dispose();
    }
  }, {
    key: '_runTypeCoverage',
    value: function _runTypeCoverage(textEditor) {
      var _this2 = this;

      return this._busySignalProvider.reportBusy('Hack: Waiting for type coverage results', function () {
        return _this2._runTypeCoverageImpl(textEditor);
      }).catch(_asyncToGenerator(function* (e) {
        logger.error(e);
      }));
    }
  }, {
    key: '_runTypeCoverageImpl',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('hack:run-type-coverage')],
    value: _asyncToGenerator(function* (textEditor) {
      var filePath = textEditor.getPath();
      if (filePath == null) {
        return;
      }

      var hackLanguage = yield (0, (_HackLanguage2 || _HackLanguage()).getHackLanguageForUri)(textEditor.getPath());
      if (hackLanguage == null) {
        return;
      }

      var result = yield this._requestSerializer.run(hackLanguage.getTypeCoverage(filePath));
      if (result.status === 'outdated') {
        return;
      }

      var regions = result.result;
      var diagnostics = regions.map(function (region) {
        return convertRegionToDiagnostic(filePath, region);
      });
      var diagnosticsUpdate = {
        filePathToMessages: new Map([[filePath, diagnostics]])
      };
      this._providerBase.publishMessageUpdate(diagnosticsUpdate);
    })
  }, {
    key: '_receivedNewUpdateSubscriber',
    value: function _receivedNewUpdateSubscriber() {
      // Every time we get a new subscriber, we need to push results to them. This
      // logic is common to all providers and should be abstracted out (t7813069)
      //
      // Once we provide all diagnostics, instead of just the current file, we can
      // probably remove the activeTextEditor parameter.
      var activeTextEditor = atom.workspace.getActiveTextEditor();
      if (activeTextEditor) {
        if ((_nuclideHackCommon2 || _nuclideHackCommon()).HACK_GRAMMARS_SET.has(activeTextEditor.getGrammar().scopeName)) {
          this._runTypeCoverage(activeTextEditor);
        }
      }
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
  }]);

  return TypeCoverageProvider;
})();

exports.TypeCoverageProvider = TypeCoverageProvider;

var ERROR_MESSAGE = 'Un-type checked code. Consider adding type annotations.';
var WARNING_MESSAGE = 'Partially type checked code. Consider adding type annotations.';

function convertRegionToDiagnostic(filePath, region) {
  var isWarning = region.type === 'partial';
  var line = region.line - 1;
  return {
    scope: 'file',
    providerName: 'Hack',
    type: isWarning ? 'Warning' : 'Error',
    text: isWarning ? WARNING_MESSAGE : ERROR_MESSAGE,
    filePath: filePath,
    range: new (_atom2 || _atom()).Range([line, region.start - 1], [line, region.end])
  };
}