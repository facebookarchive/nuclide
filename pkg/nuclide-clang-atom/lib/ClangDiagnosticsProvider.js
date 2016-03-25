var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _constants = require('./constants');

var _nuclideDiagnosticsProviderBase = require('../../nuclide-diagnostics-provider-base');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideLogging = require('../../nuclide-logging');

var _libclang = require('./libclang');

var _atom = require('atom');

var DEFAULT_FLAGS_WARNING = 'Diagnostics are disabled due to lack of compilation flags. ' + 'Build this file with Buck, or create a compile_commands.json file manually.';

function atomRangeFromSourceRange(clangRange) {
  return new _atom.Range([clangRange.start.line, clangRange.start.column], [clangRange.end.line, clangRange.end.column]);
}

function atomRangeFromLocation(location) {
  var line = Math.max(0, location.line);
  return new _atom.Range([line, 0], [line + 1, 0]);
}

var ClangDiagnosticsProvider = (function () {
  function ClangDiagnosticsProvider(busySignalProvider) {
    _classCallCheck(this, ClangDiagnosticsProvider);

    var options = {
      grammarScopes: _constants.GRAMMAR_SET,
      onTextEditorEvent: this.runDiagnostics.bind(this),
      onNewUpdateSubscriber: this._receivedNewUpdateSubscriber.bind(this)
    };
    this._providerBase = new _nuclideDiagnosticsProviderBase.DiagnosticsProviderBase(options);
    this._busySignalProvider = busySignalProvider;

    this._bufferDiagnostics = new WeakMap();
    this._hasSubscription = new WeakMap();
    this._subscriptions = new _atom.CompositeDisposable();
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
    decorators: [(0, _nuclideAnalytics.trackTiming)('nuclide-clang-atom.fetch-diagnostics')],
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
            _this2._hasSubscription['delete'](buffer);
            _this2._subscriptions.remove(disposable);
            disposable.dispose();
          });
          _this2._hasSubscription.set(buffer, true);
          _this2._subscriptions.add(disposable);
        })();
      }

      try {
        var diagnostics = yield (0, _libclang.getDiagnostics)(textEditor);
        // It's important to make sure that the buffer hasn't already been destroyed.
        if (diagnostics == null || !this._hasSubscription.get(buffer)) {
          return;
        }
        (0, _nuclideAnalytics.track)('nuclide-clang-atom.fetch-diagnostics', {
          filePath: filePath,
          count: diagnostics.diagnostics.length.toString(),
          accurateFlags: diagnostics.accurateFlags.toString()
        });
        var filePathToMessages = this._processDiagnostics(diagnostics, textEditor);
        this.invalidateBuffer(buffer);
        this._providerBase.publishMessageUpdate({ filePathToMessages: filePathToMessages });
        this._bufferDiagnostics.set(buffer, _nuclideCommons.array.from(filePathToMessages.keys()));
      } catch (error) {
        (0, _nuclideLogging.getLogger)().error(error);
      }
    })
  }, {
    key: '_processDiagnostics',
    value: function _processDiagnostics(data, textEditor) {
      var editorPath = textEditor.getPath();
      (0, _assert2['default'])(editorPath);
      var filePathToMessages = new Map();
      if (data.accurateFlags) {
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
          range: new _atom.Range([0, 0], [1, 0])
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
      if (activeTextEditor && _constants.GRAMMAR_SET.has(activeTextEditor.getGrammar().scopeName)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsYW5nRGlhZ25vc3RpY3NQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O3NCQXdCc0IsUUFBUTs7Ozt5QkFDSixhQUFhOzs4Q0FDRCx5Q0FBeUM7O2dDQUM5Qyx5QkFBeUI7OzhCQUN0Qyx1QkFBdUI7OzhCQUNuQix1QkFBdUI7O3dCQUNsQixZQUFZOztvQkFDQSxNQUFNOztBQUUvQyxJQUFNLHFCQUFxQixHQUN6Qiw2REFBNkQsR0FDN0QsNkVBQTZFLENBQUM7O0FBRWhGLFNBQVMsd0JBQXdCLENBQUMsVUFBNEIsRUFBYztBQUMxRSxTQUFPLGdCQUNMLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFDaEQsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUM3QyxDQUFDO0NBQ0g7O0FBRUQsU0FBUyxxQkFBcUIsQ0FBQyxRQUF1QixFQUFjO0FBQ2xFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4QyxTQUFPLGdCQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzVDOztJQUVLLHdCQUF3QjtBQVVqQixXQVZQLHdCQUF3QixDQVVoQixrQkFBMEMsRUFBRTswQkFWcEQsd0JBQXdCOztBQVcxQixRQUFNLE9BQU8sR0FBRztBQUNkLG1CQUFhLHdCQUFhO0FBQzFCLHVCQUFpQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUNqRCwyQkFBcUIsRUFBRSxJQUFJLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztLQUNwRSxDQUFDO0FB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Q0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdEQsVUFBSSxTQUFTLElBQUksSUFBSSxFQUFFO0FBQ3JCLFlBQUksQ0FBQyxhQUFhLENBQUMsMEJBQTBCLENBQUMsRUFBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBVCxTQUFTLEVBQUMsQ0FBQyxDQUFDO09BQzNFO0tBQ0Y7OztXQUUyQixzQ0FBQyxRQUErQixFQUFRO0FBQ2xFLFVBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzlELFVBQUksZ0JBQWdCLElBQUksdUJBQVksR0FBRyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQ2hGLFlBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztPQUN2QztLQUNGOzs7V0FFYyx5QkFBQyxRQUErQixFQUFlO0FBQzVELGFBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDckQ7OztXQUVvQiwrQkFBQyxRQUFxQyxFQUFlO0FBQ3hFLGFBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUMzRDs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzdCLFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDL0I7OztTQWpMRyx3QkFBd0I7OztBQXFMOUIsTUFBTSxDQUFDLE9BQU8sR0FBRyx3QkFBd0IsQ0FBQyIsImZpbGUiOiJDbGFuZ0RpYWdub3N0aWNzUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7QnVzeVNpZ25hbFByb3ZpZGVyQmFzZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1idXN5LXNpZ25hbC1wcm92aWRlci1iYXNlJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge1xuICBDbGFuZ0NvbXBpbGVSZXN1bHQsXG4gIENsYW5nU291cmNlUmFuZ2UsXG4gIENsYW5nTG9jYXRpb24sXG59IGZyb20gJy4uLy4uL251Y2xpZGUtY2xhbmcnO1xuaW1wb3J0IHR5cGUge1xuICBGaWxlRGlhZ25vc3RpY01lc3NhZ2UsXG4gIE1lc3NhZ2VVcGRhdGVDYWxsYmFjayxcbiAgTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRpYWdub3N0aWNzLWJhc2UnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0dSQU1NQVJfU0VUfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge0RpYWdub3N0aWNzUHJvdmlkZXJCYXNlfSBmcm9tICcuLi8uLi9udWNsaWRlLWRpYWdub3N0aWNzLXByb3ZpZGVyLWJhc2UnO1xuaW1wb3J0IHt0cmFjaywgdHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCB7YXJyYXl9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJztcbmltcG9ydCB7Z2V0RGlhZ25vc3RpY3N9IGZyb20gJy4vbGliY2xhbmcnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBSYW5nZX0gZnJvbSAnYXRvbSc7XG5cbmNvbnN0IERFRkFVTFRfRkxBR1NfV0FSTklORyA9XG4gICdEaWFnbm9zdGljcyBhcmUgZGlzYWJsZWQgZHVlIHRvIGxhY2sgb2YgY29tcGlsYXRpb24gZmxhZ3MuICcgK1xuICAnQnVpbGQgdGhpcyBmaWxlIHdpdGggQnVjaywgb3IgY3JlYXRlIGEgY29tcGlsZV9jb21tYW5kcy5qc29uIGZpbGUgbWFudWFsbHkuJztcblxuZnVuY3Rpb24gYXRvbVJhbmdlRnJvbVNvdXJjZVJhbmdlKGNsYW5nUmFuZ2U6IENsYW5nU291cmNlUmFuZ2UpOiBhdG9tJFJhbmdlIHtcbiAgcmV0dXJuIG5ldyBSYW5nZShcbiAgICBbY2xhbmdSYW5nZS5zdGFydC5saW5lLCBjbGFuZ1JhbmdlLnN0YXJ0LmNvbHVtbl0sXG4gICAgW2NsYW5nUmFuZ2UuZW5kLmxpbmUsIGNsYW5nUmFuZ2UuZW5kLmNvbHVtbl1cbiAgKTtcbn1cblxuZnVuY3Rpb24gYXRvbVJhbmdlRnJvbUxvY2F0aW9uKGxvY2F0aW9uOiBDbGFuZ0xvY2F0aW9uKTogYXRvbSRSYW5nZSB7XG4gIGNvbnN0IGxpbmUgPSBNYXRoLm1heCgwLCBsb2NhdGlvbi5saW5lKTtcbiAgcmV0dXJuIG5ldyBSYW5nZShbbGluZSwgMF0sIFtsaW5lICsgMSwgMF0pO1xufVxuXG5jbGFzcyBDbGFuZ0RpYWdub3N0aWNzUHJvdmlkZXIge1xuICBfcHJvdmlkZXJCYXNlOiBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZTtcbiAgX2J1c3lTaWduYWxQcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyQmFzZTtcblxuICAvLyBLZWVwIHRyYWNrIG9mIHRoZSBkaWFnbm9zdGljcyBjcmVhdGVkIGJ5IGVhY2ggdGV4dCBidWZmZXIuXG4gIC8vIERpYWdub3N0aWNzIHdpbGwgYmUgcmVtb3ZlZCBvbmNlIHRoZSBmaWxlIGlzIGNsb3NlZC5cbiAgX2J1ZmZlckRpYWdub3N0aWNzOiBXZWFrTWFwPGF0b20kVGV4dEJ1ZmZlciwgQXJyYXk8TnVjbGlkZVVyaT4+O1xuICBfaGFzU3Vic2NyaXB0aW9uOiBXZWFrTWFwPGF0b20kVGV4dEJ1ZmZlciwgYm9vbGVhbj47XG4gIF9zdWJzY3JpcHRpb25zOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoYnVzeVNpZ25hbFByb3ZpZGVyOiBCdXN5U2lnbmFsUHJvdmlkZXJCYXNlKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIGdyYW1tYXJTY29wZXM6IEdSQU1NQVJfU0VULFxuICAgICAgb25UZXh0RWRpdG9yRXZlbnQ6IHRoaXMucnVuRGlhZ25vc3RpY3MuYmluZCh0aGlzKSxcbiAgICAgIG9uTmV3VXBkYXRlU3Vic2NyaWJlcjogdGhpcy5fcmVjZWl2ZWROZXdVcGRhdGVTdWJzY3JpYmVyLmJpbmQodGhpcyksXG4gICAgfTtcbiAgICB0aGlzLl9wcm92aWRlckJhc2UgPSBuZXcgRGlhZ25vc3RpY3NQcm92aWRlckJhc2Uob3B0aW9ucyk7XG4gICAgdGhpcy5fYnVzeVNpZ25hbFByb3ZpZGVyID0gYnVzeVNpZ25hbFByb3ZpZGVyO1xuXG4gICAgdGhpcy5fYnVmZmVyRGlhZ25vc3RpY3MgPSBuZXcgV2Vha01hcCgpO1xuICAgIHRoaXMuX2hhc1N1YnNjcmlwdGlvbiA9IG5ldyBXZWFrTWFwKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gIH1cblxuICBydW5EaWFnbm9zdGljcyhlZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IHZvaWQge1xuICAgIHRoaXMuX2J1c3lTaWduYWxQcm92aWRlci5yZXBvcnRCdXN5KFxuICAgICAgYENsYW5nOiBjb21waWxpbmcgXFxgJHtlZGl0b3IuZ2V0VGl0bGUoKX1cXGBgLFxuICAgICAgKCkgPT4gdGhpcy5fcnVuRGlhZ25vc3RpY3NJbXBsKGVkaXRvciksXG4gICAgKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnbnVjbGlkZS1jbGFuZy1hdG9tLmZldGNoLWRpYWdub3N0aWNzJylcbiAgYXN5bmMgX3J1bkRpYWdub3N0aWNzSW1wbCh0ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBidWZmZXIgPSB0ZXh0RWRpdG9yLmdldEJ1ZmZlcigpO1xuICAgIGlmICghdGhpcy5faGFzU3Vic2NyaXB0aW9uLmdldChidWZmZXIpKSB7XG4gICAgICBjb25zdCBkaXNwb3NhYmxlID0gYnVmZmVyLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZUJ1ZmZlcihidWZmZXIpO1xuICAgICAgICB0aGlzLl9oYXNTdWJzY3JpcHRpb24uZGVsZXRlKGJ1ZmZlcik7XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMucmVtb3ZlKGRpc3Bvc2FibGUpO1xuICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5faGFzU3Vic2NyaXB0aW9uLnNldChidWZmZXIsIHRydWUpO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoZGlzcG9zYWJsZSk7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRpYWdub3N0aWNzID0gYXdhaXQgZ2V0RGlhZ25vc3RpY3ModGV4dEVkaXRvcik7XG4gICAgICAvLyBJdCdzIGltcG9ydGFudCB0byBtYWtlIHN1cmUgdGhhdCB0aGUgYnVmZmVyIGhhc24ndCBhbHJlYWR5IGJlZW4gZGVzdHJveWVkLlxuICAgICAgaWYgKGRpYWdub3N0aWNzID09IG51bGwgfHwgIXRoaXMuX2hhc1N1YnNjcmlwdGlvbi5nZXQoYnVmZmVyKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0cmFjaygnbnVjbGlkZS1jbGFuZy1hdG9tLmZldGNoLWRpYWdub3N0aWNzJywge1xuICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgY291bnQ6IGRpYWdub3N0aWNzLmRpYWdub3N0aWNzLmxlbmd0aC50b1N0cmluZygpLFxuICAgICAgICBhY2N1cmF0ZUZsYWdzOiBkaWFnbm9zdGljcy5hY2N1cmF0ZUZsYWdzLnRvU3RyaW5nKCksXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGZpbGVQYXRoVG9NZXNzYWdlcyA9IHRoaXMuX3Byb2Nlc3NEaWFnbm9zdGljcyhkaWFnbm9zdGljcywgdGV4dEVkaXRvcik7XG4gICAgICB0aGlzLmludmFsaWRhdGVCdWZmZXIoYnVmZmVyKTtcbiAgICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5wdWJsaXNoTWVzc2FnZVVwZGF0ZSh7ZmlsZVBhdGhUb01lc3NhZ2VzfSk7XG4gICAgICB0aGlzLl9idWZmZXJEaWFnbm9zdGljcy5zZXQoYnVmZmVyLCBhcnJheS5mcm9tKGZpbGVQYXRoVG9NZXNzYWdlcy5rZXlzKCkpKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIF9wcm9jZXNzRGlhZ25vc3RpY3MoXG4gICAgZGF0YTogQ2xhbmdDb21waWxlUmVzdWx0LFxuICAgIHRleHRFZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbiAgKTogTWFwPE51Y2xpZGVVcmksIEFycmF5PEZpbGVEaWFnbm9zdGljTWVzc2FnZT4+IHtcbiAgICBjb25zdCBlZGl0b3JQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgaW52YXJpYW50KGVkaXRvclBhdGgpO1xuICAgIGNvbnN0IGZpbGVQYXRoVG9NZXNzYWdlcyA9IG5ldyBNYXAoKTtcbiAgICBpZiAoZGF0YS5hY2N1cmF0ZUZsYWdzKSB7XG4gICAgICBkYXRhLmRpYWdub3N0aWNzLmZvckVhY2goZGlhZ25vc3RpYyA9PiB7XG4gICAgICAgIC8vIFdlIHNob3cgb25seSB3YXJuaW5ncywgZXJyb3JzIGFuZCBmYXRhbHMgKDIsIDMgYW5kIDQsIHJlc3BlY3RpdmVseSkuXG4gICAgICAgIGlmIChkaWFnbm9zdGljLnNldmVyaXR5IDwgMikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENsYW5nIGFkZHMgZmlsZS13aWRlIGVycm9ycyBvbiBsaW5lIC0xLCBzbyB3ZSBwdXQgaXQgb24gbGluZSAwIGluc3RlYWQuXG4gICAgICAgIC8vIFRoZSB1c3VhbCBmaWxlLXdpZGUgZXJyb3IgaXMgJ3RvbyBtYW55IGVycm9ycyBlbWl0dGVkLCBzdG9wcGluZyBub3cnLlxuICAgICAgICBsZXQgcmFuZ2U7XG4gICAgICAgIGlmIChkaWFnbm9zdGljLnJhbmdlcykge1xuICAgICAgICAgIC8vIFVzZSB0aGUgZmlyc3QgcmFuZ2UgZnJvbSB0aGUgZGlhZ25vc3RpYyBhcyB0aGUgcmFuZ2UgZm9yIExpbnRlci5cbiAgICAgICAgICByYW5nZSA9IGF0b21SYW5nZUZyb21Tb3VyY2VSYW5nZShkaWFnbm9zdGljLnJhbmdlc1swXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmFuZ2UgPSBhdG9tUmFuZ2VGcm9tTG9jYXRpb24oZGlhZ25vc3RpYy5sb2NhdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGRpYWdub3N0aWMubG9jYXRpb24uZmlsZSB8fCBlZGl0b3JQYXRoO1xuICAgICAgICBsZXQgbWVzc2FnZXMgPSBmaWxlUGF0aFRvTWVzc2FnZXMuZ2V0KGZpbGVQYXRoKTtcbiAgICAgICAgaWYgKG1lc3NhZ2VzID09IG51bGwpIHtcbiAgICAgICAgICBtZXNzYWdlcyA9IFtdO1xuICAgICAgICAgIGZpbGVQYXRoVG9NZXNzYWdlcy5zZXQoZmlsZVBhdGgsIG1lc3NhZ2VzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0cmFjZTtcbiAgICAgICAgaWYgKGRpYWdub3N0aWMuY2hpbGRyZW4gIT0gbnVsbCkge1xuICAgICAgICAgIHRyYWNlID0gZGlhZ25vc3RpYy5jaGlsZHJlbi5tYXAoY2hpbGQgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgdHlwZTogJ1RyYWNlJyxcbiAgICAgICAgICAgICAgdGV4dDogY2hpbGQuc3BlbGxpbmcsXG4gICAgICAgICAgICAgIGZpbGVQYXRoOiBjaGlsZC5sb2NhdGlvbi5maWxlLFxuICAgICAgICAgICAgICByYW5nZTogYXRvbVJhbmdlRnJvbUxvY2F0aW9uKGNoaWxkLmxvY2F0aW9uKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZml4O1xuICAgICAgICBpZiAoZGlhZ25vc3RpYy5maXhpdHMgIT0gbnVsbCkge1xuICAgICAgICAgIC8vIFRPRE86IHN1cHBvcnQgbXVsdGlwbGUgZml4aXRzIChpZiBpdCdzIGV2ZXIgdXNlZCBhdCBhbGwpXG4gICAgICAgICAgY29uc3QgZml4aXQgPSBkaWFnbm9zdGljLmZpeGl0c1swXTtcbiAgICAgICAgICBpZiAoZml4aXQgIT0gbnVsbCkge1xuICAgICAgICAgICAgZml4ID0ge1xuICAgICAgICAgICAgICBvbGRSYW5nZTogYXRvbVJhbmdlRnJvbVNvdXJjZVJhbmdlKGZpeGl0LnJhbmdlKSxcbiAgICAgICAgICAgICAgbmV3VGV4dDogZml4aXQudmFsdWUsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIG1lc3NhZ2VzLnB1c2goe1xuICAgICAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICAgICAgcHJvdmlkZXJOYW1lOiAnQ2xhbmcnLFxuICAgICAgICAgIHR5cGU6IGRpYWdub3N0aWMuc2V2ZXJpdHkgPT09IDIgPyAnV2FybmluZycgOiAnRXJyb3InLFxuICAgICAgICAgIGZpbGVQYXRoLFxuICAgICAgICAgIHRleHQ6IGRpYWdub3N0aWMuc3BlbGxpbmcsXG4gICAgICAgICAgcmFuZ2UsXG4gICAgICAgICAgdHJhY2UsXG4gICAgICAgICAgZml4LFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBmaWxlUGF0aFRvTWVzc2FnZXMuc2V0KGVkaXRvclBhdGgsIFtcbiAgICAgICAge1xuICAgICAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICAgICAgcHJvdmlkZXJOYW1lOiAnQ2xhbmcnLFxuICAgICAgICAgIHR5cGU6ICdXYXJuaW5nJyxcbiAgICAgICAgICBmaWxlUGF0aDogZWRpdG9yUGF0aCxcbiAgICAgICAgICB0ZXh0OiBERUZBVUxUX0ZMQUdTX1dBUk5JTkcsXG4gICAgICAgICAgcmFuZ2U6IG5ldyBSYW5nZShbMCwgMF0sIFsxLCAwXSksXG4gICAgICAgIH0sXG4gICAgICBdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmlsZVBhdGhUb01lc3NhZ2VzO1xuICB9XG5cbiAgaW52YWxpZGF0ZUJ1ZmZlcihidWZmZXI6IGF0b20kVGV4dEJ1ZmZlcik6IHZvaWQge1xuICAgIGNvbnN0IGZpbGVQYXRocyA9IHRoaXMuX2J1ZmZlckRpYWdub3N0aWNzLmdldChidWZmZXIpO1xuICAgIGlmIChmaWxlUGF0aHMgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlSW52YWxpZGF0aW9uKHtzY29wZTogJ2ZpbGUnLCBmaWxlUGF0aHN9KTtcbiAgICB9XG4gIH1cblxuICBfcmVjZWl2ZWROZXdVcGRhdGVTdWJzY3JpYmVyKGNhbGxiYWNrOiBNZXNzYWdlVXBkYXRlQ2FsbGJhY2spOiB2b2lkIHtcbiAgICBjb25zdCBhY3RpdmVUZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmIChhY3RpdmVUZXh0RWRpdG9yICYmIEdSQU1NQVJfU0VULmhhcyhhY3RpdmVUZXh0RWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUpKSB7XG4gICAgICB0aGlzLnJ1bkRpYWdub3N0aWNzKGFjdGl2ZVRleHRFZGl0b3IpO1xuICAgIH1cbiAgfVxuXG4gIG9uTWVzc2FnZVVwZGF0ZShjYWxsYmFjazogTWVzc2FnZVVwZGF0ZUNhbGxiYWNrKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9wcm92aWRlckJhc2Uub25NZXNzYWdlVXBkYXRlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjazogTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9wcm92aWRlckJhc2Uub25NZXNzYWdlSW52YWxpZGF0aW9uKGNhbGxiYWNrKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2xhbmdEaWFnbm9zdGljc1Byb3ZpZGVyO1xuIl19