var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var _nuclideDiagnosticsProviderBase2;

function _nuclideDiagnosticsProviderBase() {
  return _nuclideDiagnosticsProviderBase2 = require('../../nuclide-diagnostics-provider-base');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _libclang2;

function _libclang() {
  return _libclang2 = require('./libclang');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var DEFAULT_FLAGS_WARNING = 'Diagnostics are disabled due to lack of compilation flags. ' + 'Build this file with Buck, or create a compile_commands.json file manually.';

function atomRangeFromSourceRange(clangRange) {
  return new (_atom2 || _atom()).Range([clangRange.start.line, clangRange.start.column], [clangRange.end.line, clangRange.end.column]);
}

function atomRangeFromLocation(location) {
  var line = Math.max(0, location.line);
  return new (_atom2 || _atom()).Range([line, 0], [line + 1, 0]);
}

var ClangDiagnosticsProvider = (function () {
  function ClangDiagnosticsProvider(busySignalProvider) {
    _classCallCheck(this, ClangDiagnosticsProvider);

    var options = {
      grammarScopes: (_constants2 || _constants()).GRAMMAR_SET,
      onTextEditorEvent: this.runDiagnostics.bind(this),
      onNewUpdateSubscriber: this._receivedNewUpdateSubscriber.bind(this)
    };
    this._providerBase = new (_nuclideDiagnosticsProviderBase2 || _nuclideDiagnosticsProviderBase()).DiagnosticsProviderBase(options);
    this._busySignalProvider = busySignalProvider;

    this._bufferDiagnostics = new WeakMap();
    this._hasSubscription = new WeakMap();
    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();
    this._openedFiles = new Set();
  }

  _createDecoratedClass(ClangDiagnosticsProvider, [{
    key: 'runDiagnostics',
    value: function runDiagnostics(editor) {
      var _this = this;

      this._busySignalProvider.reportBusy('Clang: compiling `' + editor.getTitle() + '`', function () {
        return _this._runDiagnosticsImpl(editor);
      });
    }
  }, {
    key: '_runDiagnosticsImpl',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('nuclide-clang-atom.fetch-diagnostics')],
    value: _asyncToGenerator(function* (textEditor) {
      var _this2 = this;

      var filePath = textEditor.getPath();
      if (!filePath) {
        return;
      }

      var buffer = textEditor.getBuffer();
      if (!this._hasSubscription.get(buffer)) {
        (function () {
          var disposable = buffer.onDidDestroy(function () {
            _this2.invalidateBuffer(buffer);
            _this2._hasSubscription.delete(buffer);
            _this2._subscriptions.remove(disposable);
            disposable.dispose();
          });
          _this2._hasSubscription.set(buffer, true);
          _this2._subscriptions.add(disposable);
        })();
      }

      try {
        var diagnostics = yield (0, (_libclang2 || _libclang()).getDiagnostics)(textEditor, !this._openedFiles.has(filePath));
        this._openedFiles.add(filePath);
        // It's important to make sure that the buffer hasn't already been destroyed.
        if (diagnostics == null || !this._hasSubscription.get(buffer)) {
          return;
        }
        var accurateFlags = diagnostics.accurateFlags;
        (0, (_assert2 || _assert()).default)(accurateFlags != null);
        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('nuclide-clang-atom.fetch-diagnostics', {
          filePath: filePath,
          count: diagnostics.diagnostics.length.toString(),
          accurateFlags: accurateFlags.toString()
        });
        var filePathToMessages = this._processDiagnostics(diagnostics, textEditor);
        this.invalidateBuffer(buffer);
        this._providerBase.publishMessageUpdate({ filePathToMessages: filePathToMessages });
        this._bufferDiagnostics.set(buffer, Array.from(filePathToMessages.keys()));
      } catch (error) {
        (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error(error);
      }
    })
  }, {
    key: '_processDiagnostics',
    value: function _processDiagnostics(data, textEditor) {
      var editorPath = textEditor.getPath();
      (0, (_assert2 || _assert()).default)(editorPath);
      var filePathToMessages = new Map();
      if (data.accurateFlags || (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get('nuclide-clang-atom.defaultDiagnostics')) {
        data.diagnostics.forEach(function (diagnostic) {
          // We show only warnings, errors and fatals (2, 3 and 4, respectively).
          if (diagnostic.severity < 2) {
            return;
          }

          // Clang adds file-wide errors on line -1, so we put it on line 0 instead.
          // The usual file-wide error is 'too many errors emitted, stopping now'.
          var range = undefined;
          if (diagnostic.ranges) {
            // Use the first range from the diagnostic as the range for Linter.
            range = atomRangeFromSourceRange(diagnostic.ranges[0]);
          } else {
            range = atomRangeFromLocation(diagnostic.location);
          }

          var filePath = diagnostic.location.file || editorPath;
          var messages = filePathToMessages.get(filePath);
          if (messages == null) {
            messages = [];
            filePathToMessages.set(filePath, messages);
          }

          var trace = undefined;
          if (diagnostic.children != null) {
            trace = diagnostic.children.map(function (child) {
              return {
                type: 'Trace',
                text: child.spelling,
                filePath: child.location.file,
                range: atomRangeFromLocation(child.location)
              };
            });
          }

          var fix = undefined;
          if (diagnostic.fixits != null) {
            // TODO: support multiple fixits (if it's ever used at all)
            var fixit = diagnostic.fixits[0];
            if (fixit != null) {
              fix = {
                oldRange: atomRangeFromSourceRange(fixit.range),
                newText: fixit.value
              };
            }
          }

          messages.push({
            scope: 'file',
            providerName: 'Clang',
            type: diagnostic.severity === 2 ? 'Warning' : 'Error',
            filePath: filePath,
            text: diagnostic.spelling,
            range: range,
            trace: trace,
            fix: fix
          });
        });
      } else {
        filePathToMessages.set(editorPath, [{
          scope: 'file',
          providerName: 'Clang',
          type: 'Warning',
          filePath: editorPath,
          text: DEFAULT_FLAGS_WARNING,
          range: new (_atom2 || _atom()).Range([0, 0], [1, 0])
        }]);
      }

      return filePathToMessages;
    }
  }, {
    key: 'invalidateBuffer',
    value: function invalidateBuffer(buffer) {
      var filePaths = this._bufferDiagnostics.get(buffer);
      if (filePaths != null) {
        this._providerBase.publishMessageInvalidation({ scope: 'file', filePaths: filePaths });
      }
    }
  }, {
    key: '_receivedNewUpdateSubscriber',
    value: function _receivedNewUpdateSubscriber(callback) {
      var activeTextEditor = atom.workspace.getActiveTextEditor();
      if (activeTextEditor && (_constants2 || _constants()).GRAMMAR_SET.has(activeTextEditor.getGrammar().scopeName)) {
        this.runDiagnostics(activeTextEditor);
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
  }, {
    key: 'dispose',
    value: function dispose() {
      this._providerBase.dispose();
      this._subscriptions.dispose();
    }
  }]);

  return ClangDiagnosticsProvider;
})();

module.exports = ClangDiagnosticsProvider;

// Keep track of the diagnostics created by each text buffer.
// Diagnostics will be removed once the file is closed.

// When we open a file for the first time, make sure we pass 'clean' to getDiagnostics
// to reset any server state for the file.
// This is so the user can easily refresh the Clang + Buck state by reloading Atom.
// Note that we do not use the TextBuffer here, since a close/reopen is acceptable.