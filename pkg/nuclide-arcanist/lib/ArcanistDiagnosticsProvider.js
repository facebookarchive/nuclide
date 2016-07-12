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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideDiagnosticsProviderBase2;

function _nuclideDiagnosticsProviderBase() {
  return _nuclideDiagnosticsProviderBase2 = require('../../nuclide-diagnostics-provider-base');
}

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _commonsAtomOnWillDestroyTextBuffer2;

function _commonsAtomOnWillDestroyTextBuffer() {
  return _commonsAtomOnWillDestroyTextBuffer2 = _interopRequireDefault(require('../../commons-atom/on-will-destroy-text-buffer'));
}

var _commonsNodePromise2;

function _commonsNodePromise() {
  return _commonsNodePromise2 = require('../../commons-node/promise');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var ArcanistDiagnosticsProvider = (function () {
  function ArcanistDiagnosticsProvider(busySignalProvider) {
    var _this = this;

    _classCallCheck(this, ArcanistDiagnosticsProvider);

    this._busySignalProvider = busySignalProvider;
    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();
    var baseOptions = {
      enableForAllGrammars: true,
      shouldRunOnTheFly: false,
      onTextEditorEvent: this._runLintWithBusyMessage.bind(this),
      onNewUpdateSubscriber: this._receivedNewUpdateSubscriber.bind(this)
    };
    this._providerBase = new (_nuclideDiagnosticsProviderBase2 || _nuclideDiagnosticsProviderBase()).DiagnosticsProviderBase(baseOptions);
    this._subscriptions.add(this._providerBase);
    this._requestSerializer = new (_commonsNodePromise2 || _commonsNodePromise()).RequestSerializer();
    this._subscriptions.add((0, (_commonsAtomOnWillDestroyTextBuffer2 || _commonsAtomOnWillDestroyTextBuffer()).default)(function (buffer) {
      var path = buffer.getPath();
      if (!path) {
        return;
      }
      _this._providerBase.publishMessageInvalidation({ scope: 'file', filePaths: [path] });
    }));
  }

  _createDecoratedClass(ArcanistDiagnosticsProvider, [{
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
    }

    /** The returned Promise will resolve when results have been published. */
  }, {
    key: '_runLintWithBusyMessage',
    value: function _runLintWithBusyMessage(textEditor) {
      var _this2 = this;

      var path = textEditor.getPath();
      if (path == null) {
        return Promise.resolve();
      }
      return this._busySignalProvider.reportBusy('Waiting for arc lint results for `' + textEditor.getTitle() + '`', function () {
        return _this2._runLint(textEditor);
      }, { onlyForFile: path });
    }

    /** Do not call this directly -- call _runLintWithBusyMessage */
  }, {
    key: '_runLint',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('nuclide-arcanist:lint')],
    value: _asyncToGenerator(function* (textEditor) {
      var _this3 = this;

      var filePath = textEditor.getPath();
      (0, (_assert2 || _assert()).default)(filePath);
      try {
        var blacklistedLinters = (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get('nuclide-arcanist.blacklistedLinters');
        var result = yield this._requestSerializer.run(require('../../nuclide-arcanist-client').findDiagnostics([filePath], blacklistedLinters));
        if (result.status === 'outdated') {
          return;
        }
        var diagnostics = result.result;
        var fileDiagnostics = diagnostics.map(function (diagnostic) {
          var range = new (_atom2 || _atom()).Range([diagnostic.row, diagnostic.col], [diagnostic.row, textEditor.getBuffer().lineLengthForRow(diagnostic.row)]);
          var text = undefined;
          if (Array.isArray(diagnostic.text)) {
            // Sometimes `arc lint` returns an array of strings for the text, rather than just a
            // string :(.
            text = diagnostic.text.join(' ');
          } else {
            text = diagnostic.text;
          }
          var maybeProperties = {};
          if (diagnostic.original != null && diagnostic.replacement != null &&
          // Sometimes linters set original and replacement to the same value. Obviously that won't
          // fix anything.
          diagnostic.original !== diagnostic.replacement) {
            maybeProperties.fix = {
              oldRange: _this3._getRangeForFix(diagnostic.row, diagnostic.col, diagnostic.original),
              newText: diagnostic.replacement,
              oldText: diagnostic.original
            };
          }
          return _extends({
            scope: 'file',
            providerName: 'Arc' + (diagnostic.code ? ': ' + diagnostic.code : ''),
            type: diagnostic.type,
            text: text,
            filePath: diagnostic.filePath,
            range: range
          }, maybeProperties);
        });
        var diagnosticsUpdate = {
          filePathToMessages: new Map([[filePath, fileDiagnostics]])
        };
        // If the editor has been closed since we made the request, we don't want to display the
        // errors. This ties in with the fact that we invalidate errors for a file when it is closed.
        if (!textEditor.isDestroyed()) {
          this._providerBase.publishMessageUpdate(diagnosticsUpdate);
        }
      } catch (error) {
        var logger = require('../../nuclide-logging').getLogger();
        logger.error(error);
        return;
      }
    })
  }, {
    key: '_getRangeForFix',
    value: function _getRangeForFix(startRow, startCol, originalText) {
      var newlineCount = 0;
      for (var char of originalText) {
        if (char === '\n') {
          newlineCount++;
        }
      }
      var endRow = startRow + newlineCount;
      var lastNewlineIndex = originalText.lastIndexOf('\n');
      var endCol = undefined;
      if (lastNewlineIndex === -1) {
        endCol = startCol + originalText.length;
      } else {
        endCol = originalText.length - lastNewlineIndex - 1;
      }

      return new (_atom2 || _atom()).Range([startRow, startCol], [endRow, endCol]);
    }
  }, {
    key: '_receivedNewUpdateSubscriber',
    value: function _receivedNewUpdateSubscriber() {
      var activeTextEditor = atom.workspace.getActiveTextEditor();
      if (activeTextEditor) {
        this._runLintWithBusyMessage(activeTextEditor);
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

  return ArcanistDiagnosticsProvider;
})();

exports.ArcanistDiagnosticsProvider = ArcanistDiagnosticsProvider;