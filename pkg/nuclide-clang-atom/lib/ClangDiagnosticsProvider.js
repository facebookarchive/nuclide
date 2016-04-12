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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsYW5nRGlhZ25vc3RpY3NQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O3NCQXdCc0IsUUFBUTs7Ozt5QkFDSixhQUFhOzs4Q0FDRCx5Q0FBeUM7O2dDQUM5Qyx5QkFBeUI7OzhCQUNsQyx1QkFBdUI7O3dCQUNsQixZQUFZOztvQkFDQSxNQUFNOztBQUUvQyxJQUFNLHFCQUFxQixHQUN6Qiw2REFBNkQsR0FDN0QsNkVBQTZFLENBQUM7O0FBRWhGLFNBQVMsd0JBQXdCLENBQUMsVUFBNEIsRUFBYztBQUMxRSxTQUFPLGdCQUNMLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFDaEQsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUM3QyxDQUFDO0NBQ0g7O0FBRUQsU0FBUyxxQkFBcUIsQ0FBQyxRQUF1QixFQUFjO0FBQ2xFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4QyxTQUFPLGdCQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzVDOztJQUVLLHdCQUF3QjtBQWdCakIsV0FoQlAsd0JBQXdCLENBZ0JoQixrQkFBMEMsRUFBRTswQkFoQnBELHdCQUF3Qjs7QUFpQjFCLFFBQU0sT0FBTyxHQUFHO0FBQ2QsbUJBQWEsd0JBQWE7QUFDMUIsdUJBQWlCLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ2pELDJCQUFxQixFQUFFLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQ3BFLENBQUM7QUFDRixRQUFJLENB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ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7QnVzeVNpZ25hbFByb3ZpZGVyQmFzZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1idXN5LXNpZ25hbC1wcm92aWRlci1iYXNlJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge1xuICBDbGFuZ0NvbXBpbGVSZXN1bHQsXG4gIENsYW5nU291cmNlUmFuZ2UsXG4gIENsYW5nTG9jYXRpb24sXG59IGZyb20gJy4uLy4uL251Y2xpZGUtY2xhbmcnO1xuaW1wb3J0IHR5cGUge1xuICBGaWxlRGlhZ25vc3RpY01lc3NhZ2UsXG4gIE1lc3NhZ2VVcGRhdGVDYWxsYmFjayxcbiAgTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRpYWdub3N0aWNzLWJhc2UnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0dSQU1NQVJfU0VUfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge0RpYWdub3N0aWNzUHJvdmlkZXJCYXNlfSBmcm9tICcuLi8uLi9udWNsaWRlLWRpYWdub3N0aWNzLXByb3ZpZGVyLWJhc2UnO1xuaW1wb3J0IHt0cmFjaywgdHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuaW1wb3J0IHtnZXREaWFnbm9zdGljc30gZnJvbSAnLi9saWJjbGFuZyc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIFJhbmdlfSBmcm9tICdhdG9tJztcblxuY29uc3QgREVGQVVMVF9GTEFHU19XQVJOSU5HID1cbiAgJ0RpYWdub3N0aWNzIGFyZSBkaXNhYmxlZCBkdWUgdG8gbGFjayBvZiBjb21waWxhdGlvbiBmbGFncy4gJyArXG4gICdCdWlsZCB0aGlzIGZpbGUgd2l0aCBCdWNrLCBvciBjcmVhdGUgYSBjb21waWxlX2NvbW1hbmRzLmpzb24gZmlsZSBtYW51YWxseS4nO1xuXG5mdW5jdGlvbiBhdG9tUmFuZ2VGcm9tU291cmNlUmFuZ2UoY2xhbmdSYW5nZTogQ2xhbmdTb3VyY2VSYW5nZSk6IGF0b20kUmFuZ2Uge1xuICByZXR1cm4gbmV3IFJhbmdlKFxuICAgIFtjbGFuZ1JhbmdlLnN0YXJ0LmxpbmUsIGNsYW5nUmFuZ2Uuc3RhcnQuY29sdW1uXSxcbiAgICBbY2xhbmdSYW5nZS5lbmQubGluZSwgY2xhbmdSYW5nZS5lbmQuY29sdW1uXVxuICApO1xufVxuXG5mdW5jdGlvbiBhdG9tUmFuZ2VGcm9tTG9jYXRpb24obG9jYXRpb246IENsYW5nTG9jYXRpb24pOiBhdG9tJFJhbmdlIHtcbiAgY29uc3QgbGluZSA9IE1hdGgubWF4KDAsIGxvY2F0aW9uLmxpbmUpO1xuICByZXR1cm4gbmV3IFJhbmdlKFtsaW5lLCAwXSwgW2xpbmUgKyAxLCAwXSk7XG59XG5cbmNsYXNzIENsYW5nRGlhZ25vc3RpY3NQcm92aWRlciB7XG4gIF9wcm92aWRlckJhc2U6IERpYWdub3N0aWNzUHJvdmlkZXJCYXNlO1xuICBfYnVzeVNpZ25hbFByb3ZpZGVyOiBCdXN5U2lnbmFsUHJvdmlkZXJCYXNlO1xuXG4gIC8vIEtlZXAgdHJhY2sgb2YgdGhlIGRpYWdub3N0aWNzIGNyZWF0ZWQgYnkgZWFjaCB0ZXh0IGJ1ZmZlci5cbiAgLy8gRGlhZ25vc3RpY3Mgd2lsbCBiZSByZW1vdmVkIG9uY2UgdGhlIGZpbGUgaXMgY2xvc2VkLlxuICBfYnVmZmVyRGlhZ25vc3RpY3M6IFdlYWtNYXA8YXRvbSRUZXh0QnVmZmVyLCBBcnJheTxOdWNsaWRlVXJpPj47XG4gIF9oYXNTdWJzY3JpcHRpb246IFdlYWtNYXA8YXRvbSRUZXh0QnVmZmVyLCBib29sZWFuPjtcbiAgX3N1YnNjcmlwdGlvbnM6IGF0b20kQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICAvLyBXaGVuIHdlIG9wZW4gYSBmaWxlIGZvciB0aGUgZmlyc3QgdGltZSwgbWFrZSBzdXJlIHdlIHBhc3MgJ2NsZWFuJyB0byBnZXREaWFnbm9zdGljc1xuICAvLyB0byByZXNldCBhbnkgc2VydmVyIHN0YXRlIGZvciB0aGUgZmlsZS5cbiAgLy8gVGhpcyBpcyBzbyB0aGUgdXNlciBjYW4gZWFzaWx5IHJlZnJlc2ggdGhlIENsYW5nICsgQnVjayBzdGF0ZSBieSByZWxvYWRpbmcgQXRvbS5cbiAgLy8gTm90ZSB0aGF0IHdlIGRvIG5vdCB1c2UgdGhlIFRleHRCdWZmZXIgaGVyZSwgc2luY2UgYSBjbG9zZS9yZW9wZW4gaXMgYWNjZXB0YWJsZS5cbiAgX29wZW5lZEZpbGVzOiBTZXQ8c3RyaW5nPjtcblxuICBjb25zdHJ1Y3RvcihidXN5U2lnbmFsUHJvdmlkZXI6IEJ1c3lTaWduYWxQcm92aWRlckJhc2UpIHtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgZ3JhbW1hclNjb3BlczogR1JBTU1BUl9TRVQsXG4gICAgICBvblRleHRFZGl0b3JFdmVudDogdGhpcy5ydW5EaWFnbm9zdGljcy5iaW5kKHRoaXMpLFxuICAgICAgb25OZXdVcGRhdGVTdWJzY3JpYmVyOiB0aGlzLl9yZWNlaXZlZE5ld1VwZGF0ZVN1YnNjcmliZXIuYmluZCh0aGlzKSxcbiAgICB9O1xuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZSA9IG5ldyBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZShvcHRpb25zKTtcbiAgICB0aGlzLl9idXN5U2lnbmFsUHJvdmlkZXIgPSBidXN5U2lnbmFsUHJvdmlkZXI7XG5cbiAgICB0aGlzLl9idWZmZXJEaWFnbm9zdGljcyA9IG5ldyBXZWFrTWFwKCk7XG4gICAgdGhpcy5faGFzU3Vic2NyaXB0aW9uID0gbmV3IFdlYWtNYXAoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9vcGVuZWRGaWxlcyA9IG5ldyBTZXQoKTtcbiAgfVxuXG4gIHJ1bkRpYWdub3N0aWNzKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgdGhpcy5fYnVzeVNpZ25hbFByb3ZpZGVyLnJlcG9ydEJ1c3koXG4gICAgICBgQ2xhbmc6IGNvbXBpbGluZyBcXGAke2VkaXRvci5nZXRUaXRsZSgpfVxcYGAsXG4gICAgICAoKSA9PiB0aGlzLl9ydW5EaWFnbm9zdGljc0ltcGwoZWRpdG9yKSxcbiAgICApO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdudWNsaWRlLWNsYW5nLWF0b20uZmV0Y2gtZGlhZ25vc3RpY3MnKVxuICBhc3luYyBfcnVuRGlhZ25vc3RpY3NJbXBsKHRleHRFZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGJ1ZmZlciA9IHRleHRFZGl0b3IuZ2V0QnVmZmVyKCk7XG4gICAgaWYgKCF0aGlzLl9oYXNTdWJzY3JpcHRpb24uZ2V0KGJ1ZmZlcikpIHtcbiAgICAgIGNvbnN0IGRpc3Bvc2FibGUgPSBidWZmZXIub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlQnVmZmVyKGJ1ZmZlcik7XG4gICAgICAgIHRoaXMuX2hhc1N1YnNjcmlwdGlvbi5kZWxldGUoYnVmZmVyKTtcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5yZW1vdmUoZGlzcG9zYWJsZSk7XG4gICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9oYXNTdWJzY3JpcHRpb24uc2V0KGJ1ZmZlciwgdHJ1ZSk7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChkaXNwb3NhYmxlKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgZGlhZ25vc3RpY3MgPSBhd2FpdCBnZXREaWFnbm9zdGljcyh0ZXh0RWRpdG9yLCAhdGhpcy5fb3BlbmVkRmlsZXMuaGFzKGZpbGVQYXRoKSk7XG4gICAgICB0aGlzLl9vcGVuZWRGaWxlcy5hZGQoZmlsZVBhdGgpO1xuICAgICAgLy8gSXQncyBpbXBvcnRhbnQgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGJ1ZmZlciBoYXNuJ3QgYWxyZWFkeSBiZWVuIGRlc3Ryb3llZC5cbiAgICAgIGlmIChkaWFnbm9zdGljcyA9PSBudWxsIHx8ICF0aGlzLl9oYXNTdWJzY3JpcHRpb24uZ2V0KGJ1ZmZlcikpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdHJhY2soJ251Y2xpZGUtY2xhbmctYXRvbS5mZXRjaC1kaWFnbm9zdGljcycsIHtcbiAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgIGNvdW50OiBkaWFnbm9zdGljcy5kaWFnbm9zdGljcy5sZW5ndGgudG9TdHJpbmcoKSxcbiAgICAgICAgYWNjdXJhdGVGbGFnczogZGlhZ25vc3RpY3MuYWNjdXJhdGVGbGFncy50b1N0cmluZygpLFxuICAgICAgfSk7XG4gICAgICBjb25zdCBmaWxlUGF0aFRvTWVzc2FnZXMgPSB0aGlzLl9wcm9jZXNzRGlhZ25vc3RpY3MoZGlhZ25vc3RpY3MsIHRleHRFZGl0b3IpO1xuICAgICAgdGhpcy5pbnZhbGlkYXRlQnVmZmVyKGJ1ZmZlcik7XG4gICAgICB0aGlzLl9wcm92aWRlckJhc2UucHVibGlzaE1lc3NhZ2VVcGRhdGUoe2ZpbGVQYXRoVG9NZXNzYWdlc30pO1xuICAgICAgdGhpcy5fYnVmZmVyRGlhZ25vc3RpY3Muc2V0KGJ1ZmZlciwgQXJyYXkuZnJvbShmaWxlUGF0aFRvTWVzc2FnZXMua2V5cygpKSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGdldExvZ2dlcigpLmVycm9yKGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBfcHJvY2Vzc0RpYWdub3N0aWNzKFxuICAgIGRhdGE6IENsYW5nQ29tcGlsZVJlc3VsdCxcbiAgICB0ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gICk6IE1hcDxOdWNsaWRlVXJpLCBBcnJheTxGaWxlRGlhZ25vc3RpY01lc3NhZ2U+PiB7XG4gICAgY29uc3QgZWRpdG9yUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGludmFyaWFudChlZGl0b3JQYXRoKTtcbiAgICBjb25zdCBmaWxlUGF0aFRvTWVzc2FnZXMgPSBuZXcgTWFwKCk7XG4gICAgaWYgKGRhdGEuYWNjdXJhdGVGbGFncykge1xuICAgICAgZGF0YS5kaWFnbm9zdGljcy5mb3JFYWNoKGRpYWdub3N0aWMgPT4ge1xuICAgICAgICAvLyBXZSBzaG93IG9ubHkgd2FybmluZ3MsIGVycm9ycyBhbmQgZmF0YWxzICgyLCAzIGFuZCA0LCByZXNwZWN0aXZlbHkpLlxuICAgICAgICBpZiAoZGlhZ25vc3RpYy5zZXZlcml0eSA8IDIpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDbGFuZyBhZGRzIGZpbGUtd2lkZSBlcnJvcnMgb24gbGluZSAtMSwgc28gd2UgcHV0IGl0IG9uIGxpbmUgMCBpbnN0ZWFkLlxuICAgICAgICAvLyBUaGUgdXN1YWwgZmlsZS13aWRlIGVycm9yIGlzICd0b28gbWFueSBlcnJvcnMgZW1pdHRlZCwgc3RvcHBpbmcgbm93Jy5cbiAgICAgICAgbGV0IHJhbmdlO1xuICAgICAgICBpZiAoZGlhZ25vc3RpYy5yYW5nZXMpIHtcbiAgICAgICAgICAvLyBVc2UgdGhlIGZpcnN0IHJhbmdlIGZyb20gdGhlIGRpYWdub3N0aWMgYXMgdGhlIHJhbmdlIGZvciBMaW50ZXIuXG4gICAgICAgICAgcmFuZ2UgPSBhdG9tUmFuZ2VGcm9tU291cmNlUmFuZ2UoZGlhZ25vc3RpYy5yYW5nZXNbMF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJhbmdlID0gYXRvbVJhbmdlRnJvbUxvY2F0aW9uKGRpYWdub3N0aWMubG9jYXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBkaWFnbm9zdGljLmxvY2F0aW9uLmZpbGUgfHwgZWRpdG9yUGF0aDtcbiAgICAgICAgbGV0IG1lc3NhZ2VzID0gZmlsZVBhdGhUb01lc3NhZ2VzLmdldChmaWxlUGF0aCk7XG4gICAgICAgIGlmIChtZXNzYWdlcyA9PSBudWxsKSB7XG4gICAgICAgICAgbWVzc2FnZXMgPSBbXTtcbiAgICAgICAgICBmaWxlUGF0aFRvTWVzc2FnZXMuc2V0KGZpbGVQYXRoLCBtZXNzYWdlcyk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdHJhY2U7XG4gICAgICAgIGlmIChkaWFnbm9zdGljLmNoaWxkcmVuICE9IG51bGwpIHtcbiAgICAgICAgICB0cmFjZSA9IGRpYWdub3N0aWMuY2hpbGRyZW4ubWFwKGNoaWxkID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIHR5cGU6ICdUcmFjZScsXG4gICAgICAgICAgICAgIHRleHQ6IGNoaWxkLnNwZWxsaW5nLFxuICAgICAgICAgICAgICBmaWxlUGF0aDogY2hpbGQubG9jYXRpb24uZmlsZSxcbiAgICAgICAgICAgICAgcmFuZ2U6IGF0b21SYW5nZUZyb21Mb2NhdGlvbihjaGlsZC5sb2NhdGlvbiksXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGZpeDtcbiAgICAgICAgaWYgKGRpYWdub3N0aWMuZml4aXRzICE9IG51bGwpIHtcbiAgICAgICAgICAvLyBUT0RPOiBzdXBwb3J0IG11bHRpcGxlIGZpeGl0cyAoaWYgaXQncyBldmVyIHVzZWQgYXQgYWxsKVxuICAgICAgICAgIGNvbnN0IGZpeGl0ID0gZGlhZ25vc3RpYy5maXhpdHNbMF07XG4gICAgICAgICAgaWYgKGZpeGl0ICE9IG51bGwpIHtcbiAgICAgICAgICAgIGZpeCA9IHtcbiAgICAgICAgICAgICAgb2xkUmFuZ2U6IGF0b21SYW5nZUZyb21Tb3VyY2VSYW5nZShmaXhpdC5yYW5nZSksXG4gICAgICAgICAgICAgIG5ld1RleHQ6IGZpeGl0LnZhbHVlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBtZXNzYWdlcy5wdXNoKHtcbiAgICAgICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgICAgIHByb3ZpZGVyTmFtZTogJ0NsYW5nJyxcbiAgICAgICAgICB0eXBlOiBkaWFnbm9zdGljLnNldmVyaXR5ID09PSAyID8gJ1dhcm5pbmcnIDogJ0Vycm9yJyxcbiAgICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgICB0ZXh0OiBkaWFnbm9zdGljLnNwZWxsaW5nLFxuICAgICAgICAgIHJhbmdlLFxuICAgICAgICAgIHRyYWNlLFxuICAgICAgICAgIGZpeCxcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmlsZVBhdGhUb01lc3NhZ2VzLnNldChlZGl0b3JQYXRoLCBbXG4gICAgICAgIHtcbiAgICAgICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgICAgIHByb3ZpZGVyTmFtZTogJ0NsYW5nJyxcbiAgICAgICAgICB0eXBlOiAnV2FybmluZycsXG4gICAgICAgICAgZmlsZVBhdGg6IGVkaXRvclBhdGgsXG4gICAgICAgICAgdGV4dDogREVGQVVMVF9GTEFHU19XQVJOSU5HLFxuICAgICAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoWzAsIDBdLCBbMSwgMF0pLFxuICAgICAgICB9LFxuICAgICAgXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpbGVQYXRoVG9NZXNzYWdlcztcbiAgfVxuXG4gIGludmFsaWRhdGVCdWZmZXIoYnVmZmVyOiBhdG9tJFRleHRCdWZmZXIpOiB2b2lkIHtcbiAgICBjb25zdCBmaWxlUGF0aHMgPSB0aGlzLl9idWZmZXJEaWFnbm9zdGljcy5nZXQoYnVmZmVyKTtcbiAgICBpZiAoZmlsZVBhdGhzICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5wdWJsaXNoTWVzc2FnZUludmFsaWRhdGlvbih7c2NvcGU6ICdmaWxlJywgZmlsZVBhdGhzfSk7XG4gICAgfVxuICB9XG5cbiAgX3JlY2VpdmVkTmV3VXBkYXRlU3Vic2NyaWJlcihjYWxsYmFjazogTWVzc2FnZVVwZGF0ZUNhbGxiYWNrKTogdm9pZCB7XG4gICAgY29uc3QgYWN0aXZlVGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoYWN0aXZlVGV4dEVkaXRvciAmJiBHUkFNTUFSX1NFVC5oYXMoYWN0aXZlVGV4dEVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lKSkge1xuICAgICAgdGhpcy5ydW5EaWFnbm9zdGljcyhhY3RpdmVUZXh0RWRpdG9yKTtcbiAgICB9XG4gIH1cblxuICBvbk1lc3NhZ2VVcGRhdGUoY2FsbGJhY2s6IE1lc3NhZ2VVcGRhdGVDYWxsYmFjayk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvdmlkZXJCYXNlLm9uTWVzc2FnZVVwZGF0ZShjYWxsYmFjayk7XG4gIH1cblxuICBvbk1lc3NhZ2VJbnZhbGlkYXRpb24oY2FsbGJhY2s6IE1lc3NhZ2VJbnZhbGlkYXRpb25DYWxsYmFjayk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvdmlkZXJCYXNlLm9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjayk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5kaXNwb3NlKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENsYW5nRGlhZ25vc3RpY3NQcm92aWRlcjtcbiJdfQ==