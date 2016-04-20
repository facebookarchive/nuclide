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
        var diagnostics = yield (0, _libclang.getDiagnostics)(textEditor, !this._openedFiles.has(filePath));
        this._openedFiles.add(filePath);
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
        this._bufferDiagnostics.set(buffer, Array.from(filePathToMessages.keys()));
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

// When we open a file for the first time, make sure we pass 'clean' to getDiagnostics
// to reset any server state for the file.
// This is so the user can easily refresh the Clang + Buck state by reloading Atom.
// Note that we do not use the TextBuffer here, since a close/reopen is acceptable.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsYW5nRGlhZ25vc3RpY3NQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O3NCQXdCc0IsUUFBUTs7Ozt5QkFDSixhQUFhOzs4Q0FDRCx5Q0FBeUM7O2dDQUM5Qyx5QkFBeUI7OzhCQUNsQyx1QkFBdUI7O3dCQUNsQixZQUFZOztvQkFDQSxNQUFNOztBQUUvQyxJQUFNLHFCQUFxQixHQUN6Qiw2REFBNkQsR0FDN0QsNkVBQTZFLENBQUM7O0FBRWhGLFNBQVMsd0JBQXdCLENBQUMsVUFBNEIsRUFBYztBQUMxRSxTQUFPLGdCQUNMLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFDaEQsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUM3QyxDQUFDO0NBQ0g7O0FBRUQsU0FBUyxxQkFBcUIsQ0FBQyxRQUF1QixFQUFjO0FBQ2xFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4QyxTQUFPLGdCQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzVDOztJQUVLLHdCQUF3QjtBQWdCakIsV0FoQlAsd0JBQXdCLENBZ0JoQixrQkFBMEMsRUFBRTswQkFoQnBELHdCQUF3Qjs7QUFpQjFCLFFBQU0sT0FBTyxHQUFHO0FBQ2QsbUJBQWEsd0JBQWE7QUFDMUIsdUJBQWlCLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ2pELDJCQUFxQixFQUFFLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQ3BFLENBQUM7QUFDRixRQUFJLENB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ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7QnVzeVNpZ25hbFByb3ZpZGVyQmFzZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1idXN5LXNpZ25hbCc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtcbiAgQ2xhbmdDb21waWxlUmVzdWx0LFxuICBDbGFuZ1NvdXJjZVJhbmdlLFxuICBDbGFuZ0xvY2F0aW9uLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWNsYW5nJztcbmltcG9ydCB0eXBlIHtcbiAgRmlsZURpYWdub3N0aWNNZXNzYWdlLFxuICBNZXNzYWdlVXBkYXRlQ2FsbGJhY2ssXG4gIE1lc3NhZ2VJbnZhbGlkYXRpb25DYWxsYmFjayxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kaWFnbm9zdGljcy1iYXNlJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtHUkFNTUFSX1NFVH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kaWFnbm9zdGljcy1wcm92aWRlci1iYXNlJztcbmltcG9ydCB7dHJhY2ssIHRyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJztcbmltcG9ydCB7Z2V0RGlhZ25vc3RpY3N9IGZyb20gJy4vbGliY2xhbmcnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBSYW5nZX0gZnJvbSAnYXRvbSc7XG5cbmNvbnN0IERFRkFVTFRfRkxBR1NfV0FSTklORyA9XG4gICdEaWFnbm9zdGljcyBhcmUgZGlzYWJsZWQgZHVlIHRvIGxhY2sgb2YgY29tcGlsYXRpb24gZmxhZ3MuICcgK1xuICAnQnVpbGQgdGhpcyBmaWxlIHdpdGggQnVjaywgb3IgY3JlYXRlIGEgY29tcGlsZV9jb21tYW5kcy5qc29uIGZpbGUgbWFudWFsbHkuJztcblxuZnVuY3Rpb24gYXRvbVJhbmdlRnJvbVNvdXJjZVJhbmdlKGNsYW5nUmFuZ2U6IENsYW5nU291cmNlUmFuZ2UpOiBhdG9tJFJhbmdlIHtcbiAgcmV0dXJuIG5ldyBSYW5nZShcbiAgICBbY2xhbmdSYW5nZS5zdGFydC5saW5lLCBjbGFuZ1JhbmdlLnN0YXJ0LmNvbHVtbl0sXG4gICAgW2NsYW5nUmFuZ2UuZW5kLmxpbmUsIGNsYW5nUmFuZ2UuZW5kLmNvbHVtbl1cbiAgKTtcbn1cblxuZnVuY3Rpb24gYXRvbVJhbmdlRnJvbUxvY2F0aW9uKGxvY2F0aW9uOiBDbGFuZ0xvY2F0aW9uKTogYXRvbSRSYW5nZSB7XG4gIGNvbnN0IGxpbmUgPSBNYXRoLm1heCgwLCBsb2NhdGlvbi5saW5lKTtcbiAgcmV0dXJuIG5ldyBSYW5nZShbbGluZSwgMF0sIFtsaW5lICsgMSwgMF0pO1xufVxuXG5jbGFzcyBDbGFuZ0RpYWdub3N0aWNzUHJvdmlkZXIge1xuICBfcHJvdmlkZXJCYXNlOiBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZTtcbiAgX2J1c3lTaWduYWxQcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyQmFzZTtcblxuICAvLyBLZWVwIHRyYWNrIG9mIHRoZSBkaWFnbm9zdGljcyBjcmVhdGVkIGJ5IGVhY2ggdGV4dCBidWZmZXIuXG4gIC8vIERpYWdub3N0aWNzIHdpbGwgYmUgcmVtb3ZlZCBvbmNlIHRoZSBmaWxlIGlzIGNsb3NlZC5cbiAgX2J1ZmZlckRpYWdub3N0aWNzOiBXZWFrTWFwPGF0b20kVGV4dEJ1ZmZlciwgQXJyYXk8TnVjbGlkZVVyaT4+O1xuICBfaGFzU3Vic2NyaXB0aW9uOiBXZWFrTWFwPGF0b20kVGV4dEJ1ZmZlciwgYm9vbGVhbj47XG4gIF9zdWJzY3JpcHRpb25zOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgLy8gV2hlbiB3ZSBvcGVuIGEgZmlsZSBmb3IgdGhlIGZpcnN0IHRpbWUsIG1ha2Ugc3VyZSB3ZSBwYXNzICdjbGVhbicgdG8gZ2V0RGlhZ25vc3RpY3NcbiAgLy8gdG8gcmVzZXQgYW55IHNlcnZlciBzdGF0ZSBmb3IgdGhlIGZpbGUuXG4gIC8vIFRoaXMgaXMgc28gdGhlIHVzZXIgY2FuIGVhc2lseSByZWZyZXNoIHRoZSBDbGFuZyArIEJ1Y2sgc3RhdGUgYnkgcmVsb2FkaW5nIEF0b20uXG4gIC8vIE5vdGUgdGhhdCB3ZSBkbyBub3QgdXNlIHRoZSBUZXh0QnVmZmVyIGhlcmUsIHNpbmNlIGEgY2xvc2UvcmVvcGVuIGlzIGFjY2VwdGFibGUuXG4gIF9vcGVuZWRGaWxlczogU2V0PHN0cmluZz47XG5cbiAgY29uc3RydWN0b3IoYnVzeVNpZ25hbFByb3ZpZGVyOiBCdXN5U2lnbmFsUHJvdmlkZXJCYXNlKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIGdyYW1tYXJTY29wZXM6IEdSQU1NQVJfU0VULFxuICAgICAgb25UZXh0RWRpdG9yRXZlbnQ6IHRoaXMucnVuRGlhZ25vc3RpY3MuYmluZCh0aGlzKSxcbiAgICAgIG9uTmV3VXBkYXRlU3Vic2NyaWJlcjogdGhpcy5fcmVjZWl2ZWROZXdVcGRhdGVTdWJzY3JpYmVyLmJpbmQodGhpcyksXG4gICAgfTtcbiAgICB0aGlzLl9wcm92aWRlckJhc2UgPSBuZXcgRGlhZ25vc3RpY3NQcm92aWRlckJhc2Uob3B0aW9ucyk7XG4gICAgdGhpcy5fYnVzeVNpZ25hbFByb3ZpZGVyID0gYnVzeVNpZ25hbFByb3ZpZGVyO1xuXG4gICAgdGhpcy5fYnVmZmVyRGlhZ25vc3RpY3MgPSBuZXcgV2Vha01hcCgpO1xuICAgIHRoaXMuX2hhc1N1YnNjcmlwdGlvbiA9IG5ldyBXZWFrTWFwKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fb3BlbmVkRmlsZXMgPSBuZXcgU2V0KCk7XG4gIH1cblxuICBydW5EaWFnbm9zdGljcyhlZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IHZvaWQge1xuICAgIHRoaXMuX2J1c3lTaWduYWxQcm92aWRlci5yZXBvcnRCdXN5KFxuICAgICAgYENsYW5nOiBjb21waWxpbmcgXFxgJHtlZGl0b3IuZ2V0VGl0bGUoKX1cXGBgLFxuICAgICAgKCkgPT4gdGhpcy5fcnVuRGlhZ25vc3RpY3NJbXBsKGVkaXRvciksXG4gICAgKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnbnVjbGlkZS1jbGFuZy1hdG9tLmZldGNoLWRpYWdub3N0aWNzJylcbiAgYXN5bmMgX3J1bkRpYWdub3N0aWNzSW1wbCh0ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBidWZmZXIgPSB0ZXh0RWRpdG9yLmdldEJ1ZmZlcigpO1xuICAgIGlmICghdGhpcy5faGFzU3Vic2NyaXB0aW9uLmdldChidWZmZXIpKSB7XG4gICAgICBjb25zdCBkaXNwb3NhYmxlID0gYnVmZmVyLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZUJ1ZmZlcihidWZmZXIpO1xuICAgICAgICB0aGlzLl9oYXNTdWJzY3JpcHRpb24uZGVsZXRlKGJ1ZmZlcik7XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMucmVtb3ZlKGRpc3Bvc2FibGUpO1xuICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5faGFzU3Vic2NyaXB0aW9uLnNldChidWZmZXIsIHRydWUpO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoZGlzcG9zYWJsZSk7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRpYWdub3N0aWNzID0gYXdhaXQgZ2V0RGlhZ25vc3RpY3ModGV4dEVkaXRvciwgIXRoaXMuX29wZW5lZEZpbGVzLmhhcyhmaWxlUGF0aCkpO1xuICAgICAgdGhpcy5fb3BlbmVkRmlsZXMuYWRkKGZpbGVQYXRoKTtcbiAgICAgIC8vIEl0J3MgaW1wb3J0YW50IHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBidWZmZXIgaGFzbid0IGFscmVhZHkgYmVlbiBkZXN0cm95ZWQuXG4gICAgICBpZiAoZGlhZ25vc3RpY3MgPT0gbnVsbCB8fCAhdGhpcy5faGFzU3Vic2NyaXB0aW9uLmdldChidWZmZXIpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRyYWNrKCdudWNsaWRlLWNsYW5nLWF0b20uZmV0Y2gtZGlhZ25vc3RpY3MnLCB7XG4gICAgICAgIGZpbGVQYXRoLFxuICAgICAgICBjb3VudDogZGlhZ25vc3RpY3MuZGlhZ25vc3RpY3MubGVuZ3RoLnRvU3RyaW5nKCksXG4gICAgICAgIGFjY3VyYXRlRmxhZ3M6IGRpYWdub3N0aWNzLmFjY3VyYXRlRmxhZ3MudG9TdHJpbmcoKSxcbiAgICAgIH0pO1xuICAgICAgY29uc3QgZmlsZVBhdGhUb01lc3NhZ2VzID0gdGhpcy5fcHJvY2Vzc0RpYWdub3N0aWNzKGRpYWdub3N0aWNzLCB0ZXh0RWRpdG9yKTtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZUJ1ZmZlcihidWZmZXIpO1xuICAgICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlVXBkYXRlKHtmaWxlUGF0aFRvTWVzc2FnZXN9KTtcbiAgICAgIHRoaXMuX2J1ZmZlckRpYWdub3N0aWNzLnNldChidWZmZXIsIEFycmF5LmZyb20oZmlsZVBhdGhUb01lc3NhZ2VzLmtleXMoKSkpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBnZXRMb2dnZXIoKS5lcnJvcihlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgX3Byb2Nlc3NEaWFnbm9zdGljcyhcbiAgICBkYXRhOiBDbGFuZ0NvbXBpbGVSZXN1bHQsXG4gICAgdGV4dEVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLFxuICApOiBNYXA8TnVjbGlkZVVyaSwgQXJyYXk8RmlsZURpYWdub3N0aWNNZXNzYWdlPj4ge1xuICAgIGNvbnN0IGVkaXRvclBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICBpbnZhcmlhbnQoZWRpdG9yUGF0aCk7XG4gICAgY29uc3QgZmlsZVBhdGhUb01lc3NhZ2VzID0gbmV3IE1hcCgpO1xuICAgIGlmIChkYXRhLmFjY3VyYXRlRmxhZ3MpIHtcbiAgICAgIGRhdGEuZGlhZ25vc3RpY3MuZm9yRWFjaChkaWFnbm9zdGljID0+IHtcbiAgICAgICAgLy8gV2Ugc2hvdyBvbmx5IHdhcm5pbmdzLCBlcnJvcnMgYW5kIGZhdGFscyAoMiwgMyBhbmQgNCwgcmVzcGVjdGl2ZWx5KS5cbiAgICAgICAgaWYgKGRpYWdub3N0aWMuc2V2ZXJpdHkgPCAyKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2xhbmcgYWRkcyBmaWxlLXdpZGUgZXJyb3JzIG9uIGxpbmUgLTEsIHNvIHdlIHB1dCBpdCBvbiBsaW5lIDAgaW5zdGVhZC5cbiAgICAgICAgLy8gVGhlIHVzdWFsIGZpbGUtd2lkZSBlcnJvciBpcyAndG9vIG1hbnkgZXJyb3JzIGVtaXR0ZWQsIHN0b3BwaW5nIG5vdycuXG4gICAgICAgIGxldCByYW5nZTtcbiAgICAgICAgaWYgKGRpYWdub3N0aWMucmFuZ2VzKSB7XG4gICAgICAgICAgLy8gVXNlIHRoZSBmaXJzdCByYW5nZSBmcm9tIHRoZSBkaWFnbm9zdGljIGFzIHRoZSByYW5nZSBmb3IgTGludGVyLlxuICAgICAgICAgIHJhbmdlID0gYXRvbVJhbmdlRnJvbVNvdXJjZVJhbmdlKGRpYWdub3N0aWMucmFuZ2VzWzBdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByYW5nZSA9IGF0b21SYW5nZUZyb21Mb2NhdGlvbihkaWFnbm9zdGljLmxvY2F0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gZGlhZ25vc3RpYy5sb2NhdGlvbi5maWxlIHx8IGVkaXRvclBhdGg7XG4gICAgICAgIGxldCBtZXNzYWdlcyA9IGZpbGVQYXRoVG9NZXNzYWdlcy5nZXQoZmlsZVBhdGgpO1xuICAgICAgICBpZiAobWVzc2FnZXMgPT0gbnVsbCkge1xuICAgICAgICAgIG1lc3NhZ2VzID0gW107XG4gICAgICAgICAgZmlsZVBhdGhUb01lc3NhZ2VzLnNldChmaWxlUGF0aCwgbWVzc2FnZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRyYWNlO1xuICAgICAgICBpZiAoZGlhZ25vc3RpYy5jaGlsZHJlbiAhPSBudWxsKSB7XG4gICAgICAgICAgdHJhY2UgPSBkaWFnbm9zdGljLmNoaWxkcmVuLm1hcChjaGlsZCA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICB0eXBlOiAnVHJhY2UnLFxuICAgICAgICAgICAgICB0ZXh0OiBjaGlsZC5zcGVsbGluZyxcbiAgICAgICAgICAgICAgZmlsZVBhdGg6IGNoaWxkLmxvY2F0aW9uLmZpbGUsXG4gICAgICAgICAgICAgIHJhbmdlOiBhdG9tUmFuZ2VGcm9tTG9jYXRpb24oY2hpbGQubG9jYXRpb24pLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBmaXg7XG4gICAgICAgIGlmIChkaWFnbm9zdGljLmZpeGl0cyAhPSBudWxsKSB7XG4gICAgICAgICAgLy8gVE9ETzogc3VwcG9ydCBtdWx0aXBsZSBmaXhpdHMgKGlmIGl0J3MgZXZlciB1c2VkIGF0IGFsbClcbiAgICAgICAgICBjb25zdCBmaXhpdCA9IGRpYWdub3N0aWMuZml4aXRzWzBdO1xuICAgICAgICAgIGlmIChmaXhpdCAhPSBudWxsKSB7XG4gICAgICAgICAgICBmaXggPSB7XG4gICAgICAgICAgICAgIG9sZFJhbmdlOiBhdG9tUmFuZ2VGcm9tU291cmNlUmFuZ2UoZml4aXQucmFuZ2UpLFxuICAgICAgICAgICAgICBuZXdUZXh0OiBmaXhpdC52YWx1ZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbWVzc2FnZXMucHVzaCh7XG4gICAgICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgICAgICBwcm92aWRlck5hbWU6ICdDbGFuZycsXG4gICAgICAgICAgdHlwZTogZGlhZ25vc3RpYy5zZXZlcml0eSA9PT0gMiA/ICdXYXJuaW5nJyA6ICdFcnJvcicsXG4gICAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgICAgdGV4dDogZGlhZ25vc3RpYy5zcGVsbGluZyxcbiAgICAgICAgICByYW5nZSxcbiAgICAgICAgICB0cmFjZSxcbiAgICAgICAgICBmaXgsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZpbGVQYXRoVG9NZXNzYWdlcy5zZXQoZWRpdG9yUGF0aCwgW1xuICAgICAgICB7XG4gICAgICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgICAgICBwcm92aWRlck5hbWU6ICdDbGFuZycsXG4gICAgICAgICAgdHlwZTogJ1dhcm5pbmcnLFxuICAgICAgICAgIGZpbGVQYXRoOiBlZGl0b3JQYXRoLFxuICAgICAgICAgIHRleHQ6IERFRkFVTFRfRkxBR1NfV0FSTklORyxcbiAgICAgICAgICByYW5nZTogbmV3IFJhbmdlKFswLCAwXSwgWzEsIDBdKSxcbiAgICAgICAgfSxcbiAgICAgIF0pO1xuICAgIH1cblxuICAgIHJldHVybiBmaWxlUGF0aFRvTWVzc2FnZXM7XG4gIH1cblxuICBpbnZhbGlkYXRlQnVmZmVyKGJ1ZmZlcjogYXRvbSRUZXh0QnVmZmVyKTogdm9pZCB7XG4gICAgY29uc3QgZmlsZVBhdGhzID0gdGhpcy5fYnVmZmVyRGlhZ25vc3RpY3MuZ2V0KGJ1ZmZlcik7XG4gICAgaWYgKGZpbGVQYXRocyAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9wcm92aWRlckJhc2UucHVibGlzaE1lc3NhZ2VJbnZhbGlkYXRpb24oe3Njb3BlOiAnZmlsZScsIGZpbGVQYXRoc30pO1xuICAgIH1cbiAgfVxuXG4gIF9yZWNlaXZlZE5ld1VwZGF0ZVN1YnNjcmliZXIoY2FsbGJhY2s6IE1lc3NhZ2VVcGRhdGVDYWxsYmFjayk6IHZvaWQge1xuICAgIGNvbnN0IGFjdGl2ZVRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgaWYgKGFjdGl2ZVRleHRFZGl0b3IgJiYgR1JBTU1BUl9TRVQuaGFzKGFjdGl2ZVRleHRFZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSkpIHtcbiAgICAgIHRoaXMucnVuRGlhZ25vc3RpY3MoYWN0aXZlVGV4dEVkaXRvcik7XG4gICAgfVxuICB9XG5cbiAgb25NZXNzYWdlVXBkYXRlKGNhbGxiYWNrOiBNZXNzYWdlVXBkYXRlQ2FsbGJhY2spOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3ZpZGVyQmFzZS5vbk1lc3NhZ2VVcGRhdGUoY2FsbGJhY2spO1xuICB9XG5cbiAgb25NZXNzYWdlSW52YWxpZGF0aW9uKGNhbGxiYWNrOiBNZXNzYWdlSW52YWxpZGF0aW9uQ2FsbGJhY2spOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3ZpZGVyQmFzZS5vbk1lc3NhZ2VJbnZhbGlkYXRpb24oY2FsbGJhY2spO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9wcm92aWRlckJhc2UuZGlzcG9zZSgpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDbGFuZ0RpYWdub3N0aWNzUHJvdmlkZXI7XG4iXX0=