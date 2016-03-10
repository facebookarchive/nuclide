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

var _diagnosticsProviderBase = require('../../diagnostics/provider-base');

var _analytics = require('../../analytics');

var _commons = require('../../commons');

var _logging = require('../../logging');

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
    this._providerBase = new _diagnosticsProviderBase.DiagnosticsProviderBase(options);
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
    decorators: [(0, _analytics.trackTiming)('nuclide-clang-atom.fetch-diagnostics')],
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
        var filePathToMessages = this._processDiagnostics(diagnostics, textEditor);
        this.invalidateBuffer(buffer);
        this._providerBase.publishMessageUpdate({ filePathToMessages: filePathToMessages });
        this._bufferDiagnostics.set(buffer, _commons.array.from(filePathToMessages.keys()));
      } catch (error) {
        (0, _logging.getLogger)().error(error);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsYW5nRGlhZ25vc3RpY3NQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O3NCQXdCc0IsUUFBUTs7Ozt5QkFDSixhQUFhOzt1Q0FDRCxpQ0FBaUM7O3lCQUM3QyxpQkFBaUI7O3VCQUN2QixlQUFlOzt1QkFDWCxlQUFlOzt3QkFDVixZQUFZOztvQkFDQSxNQUFNOztBQUUvQyxJQUFNLHFCQUFxQixHQUN6Qiw2REFBNkQsR0FDN0QsNkVBQTZFLENBQUM7O0FBRWhGLFNBQVMsd0JBQXdCLENBQUMsVUFBNEIsRUFBYztBQUMxRSxTQUFPLGdCQUNMLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFDaEQsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUM3QyxDQUFDO0NBQ0g7O0FBRUQsU0FBUyxxQkFBcUIsQ0FBQyxRQUF1QixFQUFjO0FBQ2xFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4QyxTQUFPLGdCQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzVDOztJQUVLLHdCQUF3QjtBQVVqQixXQVZQLHdCQUF3QixDQVVoQixrQkFBMEMsRUFBRTswQkFWcEQsd0JBQXdCOztBQVcxQixRQUFNLE9BQU8sR0FBRztBQUNkLG1CQUFhLHdCQUFhO0FBQzFCLHVCQUFpQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUNqRCwyQkFBcUIsRUFBRSxJQUFJLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztLQUNwRSxDQUFDO0FBQ0YsUUFB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RTtLQUNGOzs7V0FFMkIsc0NBQUMsUUFBK0IsRUFBUTtBQUNsRSxVQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUM5RCxVQUFJLGdCQUFnQixJQUFJLHVCQUFZLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRTtBQUNoRixZQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUM7T0FDdkM7S0FDRjs7O1dBRWMseUJBQUMsUUFBK0IsRUFBZTtBQUM1RCxhQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3JEOzs7V0FFb0IsK0JBQUMsUUFBcUMsRUFBZTtBQUN4RSxhQUFPLElBQUksQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDM0Q7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM3QixVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQy9COzs7U0E1S0csd0JBQXdCOzs7QUFnTDlCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsd0JBQXdCLENBQUMiLCJmaWxlIjoiQ2xhbmdEaWFnbm9zdGljc1Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0J1c3lTaWduYWxQcm92aWRlckJhc2V9IGZyb20gJy4uLy4uL2J1c3ktc2lnbmFsLXByb3ZpZGVyLWJhc2UnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge1xuICBDbGFuZ0NvbXBpbGVSZXN1bHQsXG4gIENsYW5nU291cmNlUmFuZ2UsXG4gIENsYW5nTG9jYXRpb24sXG59IGZyb20gJy4uLy4uL2NsYW5nJztcbmltcG9ydCB0eXBlIHtcbiAgRmlsZURpYWdub3N0aWNNZXNzYWdlLFxuICBNZXNzYWdlVXBkYXRlQ2FsbGJhY2ssXG4gIE1lc3NhZ2VJbnZhbGlkYXRpb25DYWxsYmFjayxcbn0gZnJvbSAnLi4vLi4vZGlhZ25vc3RpY3MvYmFzZSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7R1JBTU1BUl9TRVR9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7RGlhZ25vc3RpY3NQcm92aWRlckJhc2V9IGZyb20gJy4uLy4uL2RpYWdub3N0aWNzL3Byb3ZpZGVyLWJhc2UnO1xuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcbmltcG9ydCB7YXJyYXl9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuaW1wb3J0IHtnZXREaWFnbm9zdGljc30gZnJvbSAnLi9saWJjbGFuZyc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIFJhbmdlfSBmcm9tICdhdG9tJztcblxuY29uc3QgREVGQVVMVF9GTEFHU19XQVJOSU5HID1cbiAgJ0RpYWdub3N0aWNzIGFyZSBkaXNhYmxlZCBkdWUgdG8gbGFjayBvZiBjb21waWxhdGlvbiBmbGFncy4gJyArXG4gICdCdWlsZCB0aGlzIGZpbGUgd2l0aCBCdWNrLCBvciBjcmVhdGUgYSBjb21waWxlX2NvbW1hbmRzLmpzb24gZmlsZSBtYW51YWxseS4nO1xuXG5mdW5jdGlvbiBhdG9tUmFuZ2VGcm9tU291cmNlUmFuZ2UoY2xhbmdSYW5nZTogQ2xhbmdTb3VyY2VSYW5nZSk6IGF0b20kUmFuZ2Uge1xuICByZXR1cm4gbmV3IFJhbmdlKFxuICAgIFtjbGFuZ1JhbmdlLnN0YXJ0LmxpbmUsIGNsYW5nUmFuZ2Uuc3RhcnQuY29sdW1uXSxcbiAgICBbY2xhbmdSYW5nZS5lbmQubGluZSwgY2xhbmdSYW5nZS5lbmQuY29sdW1uXVxuICApO1xufVxuXG5mdW5jdGlvbiBhdG9tUmFuZ2VGcm9tTG9jYXRpb24obG9jYXRpb246IENsYW5nTG9jYXRpb24pOiBhdG9tJFJhbmdlIHtcbiAgY29uc3QgbGluZSA9IE1hdGgubWF4KDAsIGxvY2F0aW9uLmxpbmUpO1xuICByZXR1cm4gbmV3IFJhbmdlKFtsaW5lLCAwXSwgW2xpbmUgKyAxLCAwXSk7XG59XG5cbmNsYXNzIENsYW5nRGlhZ25vc3RpY3NQcm92aWRlciB7XG4gIF9wcm92aWRlckJhc2U6IERpYWdub3N0aWNzUHJvdmlkZXJCYXNlO1xuICBfYnVzeVNpZ25hbFByb3ZpZGVyOiBCdXN5U2lnbmFsUHJvdmlkZXJCYXNlO1xuXG4gIC8vIEtlZXAgdHJhY2sgb2YgdGhlIGRpYWdub3N0aWNzIGNyZWF0ZWQgYnkgZWFjaCB0ZXh0IGJ1ZmZlci5cbiAgLy8gRGlhZ25vc3RpY3Mgd2lsbCBiZSByZW1vdmVkIG9uY2UgdGhlIGZpbGUgaXMgY2xvc2VkLlxuICBfYnVmZmVyRGlhZ25vc3RpY3M6IFdlYWtNYXA8YXRvbSRUZXh0QnVmZmVyLCBBcnJheTxOdWNsaWRlVXJpPj47XG4gIF9oYXNTdWJzY3JpcHRpb246IFdlYWtNYXA8YXRvbSRUZXh0QnVmZmVyLCBib29sZWFuPjtcbiAgX3N1YnNjcmlwdGlvbnM6IGF0b20kQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcihidXN5U2lnbmFsUHJvdmlkZXI6IEJ1c3lTaWduYWxQcm92aWRlckJhc2UpIHtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgZ3JhbW1hclNjb3BlczogR1JBTU1BUl9TRVQsXG4gICAgICBvblRleHRFZGl0b3JFdmVudDogdGhpcy5ydW5EaWFnbm9zdGljcy5iaW5kKHRoaXMpLFxuICAgICAgb25OZXdVcGRhdGVTdWJzY3JpYmVyOiB0aGlzLl9yZWNlaXZlZE5ld1VwZGF0ZVN1YnNjcmliZXIuYmluZCh0aGlzKSxcbiAgICB9O1xuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZSA9IG5ldyBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZShvcHRpb25zKTtcbiAgICB0aGlzLl9idXN5U2lnbmFsUHJvdmlkZXIgPSBidXN5U2lnbmFsUHJvdmlkZXI7XG5cbiAgICB0aGlzLl9idWZmZXJEaWFnbm9zdGljcyA9IG5ldyBXZWFrTWFwKCk7XG4gICAgdGhpcy5faGFzU3Vic2NyaXB0aW9uID0gbmV3IFdlYWtNYXAoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgfVxuXG4gIHJ1bkRpYWdub3N0aWNzKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgdGhpcy5fYnVzeVNpZ25hbFByb3ZpZGVyLnJlcG9ydEJ1c3koXG4gICAgICBgQ2xhbmc6IGNvbXBpbGluZyBcXGAke2VkaXRvci5nZXRUaXRsZSgpfVxcYGAsXG4gICAgICAoKSA9PiB0aGlzLl9ydW5EaWFnbm9zdGljc0ltcGwoZWRpdG9yKSxcbiAgICApO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdudWNsaWRlLWNsYW5nLWF0b20uZmV0Y2gtZGlhZ25vc3RpY3MnKVxuICBhc3luYyBfcnVuRGlhZ25vc3RpY3NJbXBsKHRleHRFZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGJ1ZmZlciA9IHRleHRFZGl0b3IuZ2V0QnVmZmVyKCk7XG4gICAgaWYgKCF0aGlzLl9oYXNTdWJzY3JpcHRpb24uZ2V0KGJ1ZmZlcikpIHtcbiAgICAgIGNvbnN0IGRpc3Bvc2FibGUgPSBidWZmZXIub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlQnVmZmVyKGJ1ZmZlcik7XG4gICAgICAgIHRoaXMuX2hhc1N1YnNjcmlwdGlvbi5kZWxldGUoYnVmZmVyKTtcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5yZW1vdmUoZGlzcG9zYWJsZSk7XG4gICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9oYXNTdWJzY3JpcHRpb24uc2V0KGJ1ZmZlciwgdHJ1ZSk7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChkaXNwb3NhYmxlKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgZGlhZ25vc3RpY3MgPSBhd2FpdCBnZXREaWFnbm9zdGljcyh0ZXh0RWRpdG9yKTtcbiAgICAgIC8vIEl0J3MgaW1wb3J0YW50IHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBidWZmZXIgaGFzbid0IGFscmVhZHkgYmVlbiBkZXN0cm95ZWQuXG4gICAgICBpZiAoZGlhZ25vc3RpY3MgPT0gbnVsbCB8fCAhdGhpcy5faGFzU3Vic2NyaXB0aW9uLmdldChidWZmZXIpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGZpbGVQYXRoVG9NZXNzYWdlcyA9IHRoaXMuX3Byb2Nlc3NEaWFnbm9zdGljcyhkaWFnbm9zdGljcywgdGV4dEVkaXRvcik7XG4gICAgICB0aGlzLmludmFsaWRhdGVCdWZmZXIoYnVmZmVyKTtcbiAgICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5wdWJsaXNoTWVzc2FnZVVwZGF0ZSh7ZmlsZVBhdGhUb01lc3NhZ2VzfSk7XG4gICAgICB0aGlzLl9idWZmZXJEaWFnbm9zdGljcy5zZXQoYnVmZmVyLCBhcnJheS5mcm9tKGZpbGVQYXRoVG9NZXNzYWdlcy5rZXlzKCkpKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIF9wcm9jZXNzRGlhZ25vc3RpY3MoXG4gICAgZGF0YTogQ2xhbmdDb21waWxlUmVzdWx0LFxuICAgIHRleHRFZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbiAgKTogTWFwPE51Y2xpZGVVcmksIEFycmF5PEZpbGVEaWFnbm9zdGljTWVzc2FnZT4+IHtcbiAgICBjb25zdCBlZGl0b3JQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgaW52YXJpYW50KGVkaXRvclBhdGgpO1xuICAgIGNvbnN0IGZpbGVQYXRoVG9NZXNzYWdlcyA9IG5ldyBNYXAoKTtcbiAgICBpZiAoZGF0YS5hY2N1cmF0ZUZsYWdzKSB7XG4gICAgICBkYXRhLmRpYWdub3N0aWNzLmZvckVhY2goZGlhZ25vc3RpYyA9PiB7XG4gICAgICAgIC8vIFdlIHNob3cgb25seSB3YXJuaW5ncywgZXJyb3JzIGFuZCBmYXRhbHMgKDIsIDMgYW5kIDQsIHJlc3BlY3RpdmVseSkuXG4gICAgICAgIGlmIChkaWFnbm9zdGljLnNldmVyaXR5IDwgMikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENsYW5nIGFkZHMgZmlsZS13aWRlIGVycm9ycyBvbiBsaW5lIC0xLCBzbyB3ZSBwdXQgaXQgb24gbGluZSAwIGluc3RlYWQuXG4gICAgICAgIC8vIFRoZSB1c3VhbCBmaWxlLXdpZGUgZXJyb3IgaXMgJ3RvbyBtYW55IGVycm9ycyBlbWl0dGVkLCBzdG9wcGluZyBub3cnLlxuICAgICAgICBsZXQgcmFuZ2U7XG4gICAgICAgIGlmIChkaWFnbm9zdGljLnJhbmdlcykge1xuICAgICAgICAgIC8vIFVzZSB0aGUgZmlyc3QgcmFuZ2UgZnJvbSB0aGUgZGlhZ25vc3RpYyBhcyB0aGUgcmFuZ2UgZm9yIExpbnRlci5cbiAgICAgICAgICByYW5nZSA9IGF0b21SYW5nZUZyb21Tb3VyY2VSYW5nZShkaWFnbm9zdGljLnJhbmdlc1swXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmFuZ2UgPSBhdG9tUmFuZ2VGcm9tTG9jYXRpb24oZGlhZ25vc3RpYy5sb2NhdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGRpYWdub3N0aWMubG9jYXRpb24uZmlsZSB8fCBlZGl0b3JQYXRoO1xuICAgICAgICBsZXQgbWVzc2FnZXMgPSBmaWxlUGF0aFRvTWVzc2FnZXMuZ2V0KGZpbGVQYXRoKTtcbiAgICAgICAgaWYgKG1lc3NhZ2VzID09IG51bGwpIHtcbiAgICAgICAgICBtZXNzYWdlcyA9IFtdO1xuICAgICAgICAgIGZpbGVQYXRoVG9NZXNzYWdlcy5zZXQoZmlsZVBhdGgsIG1lc3NhZ2VzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0cmFjZTtcbiAgICAgICAgaWYgKGRpYWdub3N0aWMuY2hpbGRyZW4gIT0gbnVsbCkge1xuICAgICAgICAgIHRyYWNlID0gZGlhZ25vc3RpYy5jaGlsZHJlbi5tYXAoY2hpbGQgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgdHlwZTogJ1RyYWNlJyxcbiAgICAgICAgICAgICAgdGV4dDogY2hpbGQuc3BlbGxpbmcsXG4gICAgICAgICAgICAgIGZpbGVQYXRoOiBjaGlsZC5sb2NhdGlvbi5maWxlLFxuICAgICAgICAgICAgICByYW5nZTogYXRvbVJhbmdlRnJvbUxvY2F0aW9uKGNoaWxkLmxvY2F0aW9uKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZml4O1xuICAgICAgICBpZiAoZGlhZ25vc3RpYy5maXhpdHMgIT0gbnVsbCkge1xuICAgICAgICAgIC8vIFRPRE86IHN1cHBvcnQgbXVsdGlwbGUgZml4aXRzIChpZiBpdCdzIGV2ZXIgdXNlZCBhdCBhbGwpXG4gICAgICAgICAgY29uc3QgZml4aXQgPSBkaWFnbm9zdGljLmZpeGl0c1swXTtcbiAgICAgICAgICBpZiAoZml4aXQgIT0gbnVsbCkge1xuICAgICAgICAgICAgZml4ID0ge1xuICAgICAgICAgICAgICBvbGRSYW5nZTogYXRvbVJhbmdlRnJvbVNvdXJjZVJhbmdlKGZpeGl0LnJhbmdlKSxcbiAgICAgICAgICAgICAgbmV3VGV4dDogZml4aXQudmFsdWUsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIG1lc3NhZ2VzLnB1c2goe1xuICAgICAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICAgICAgcHJvdmlkZXJOYW1lOiAnQ2xhbmcnLFxuICAgICAgICAgIHR5cGU6IGRpYWdub3N0aWMuc2V2ZXJpdHkgPT09IDIgPyAnV2FybmluZycgOiAnRXJyb3InLFxuICAgICAgICAgIGZpbGVQYXRoLFxuICAgICAgICAgIHRleHQ6IGRpYWdub3N0aWMuc3BlbGxpbmcsXG4gICAgICAgICAgcmFuZ2UsXG4gICAgICAgICAgdHJhY2UsXG4gICAgICAgICAgZml4LFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBmaWxlUGF0aFRvTWVzc2FnZXMuc2V0KGVkaXRvclBhdGgsIFtcbiAgICAgICAge1xuICAgICAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICAgICAgcHJvdmlkZXJOYW1lOiAnQ2xhbmcnLFxuICAgICAgICAgIHR5cGU6ICdXYXJuaW5nJyxcbiAgICAgICAgICBmaWxlUGF0aDogZWRpdG9yUGF0aCxcbiAgICAgICAgICB0ZXh0OiBERUZBVUxUX0ZMQUdTX1dBUk5JTkcsXG4gICAgICAgICAgcmFuZ2U6IG5ldyBSYW5nZShbMCwgMF0sIFsxLCAwXSksXG4gICAgICAgIH0sXG4gICAgICBdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmlsZVBhdGhUb01lc3NhZ2VzO1xuICB9XG5cbiAgaW52YWxpZGF0ZUJ1ZmZlcihidWZmZXI6IGF0b20kVGV4dEJ1ZmZlcik6IHZvaWQge1xuICAgIGNvbnN0IGZpbGVQYXRocyA9IHRoaXMuX2J1ZmZlckRpYWdub3N0aWNzLmdldChidWZmZXIpO1xuICAgIGlmIChmaWxlUGF0aHMgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlSW52YWxpZGF0aW9uKHtzY29wZTogJ2ZpbGUnLCBmaWxlUGF0aHN9KTtcbiAgICB9XG4gIH1cblxuICBfcmVjZWl2ZWROZXdVcGRhdGVTdWJzY3JpYmVyKGNhbGxiYWNrOiBNZXNzYWdlVXBkYXRlQ2FsbGJhY2spOiB2b2lkIHtcbiAgICBjb25zdCBhY3RpdmVUZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmIChhY3RpdmVUZXh0RWRpdG9yICYmIEdSQU1NQVJfU0VULmhhcyhhY3RpdmVUZXh0RWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUpKSB7XG4gICAgICB0aGlzLnJ1bkRpYWdub3N0aWNzKGFjdGl2ZVRleHRFZGl0b3IpO1xuICAgIH1cbiAgfVxuXG4gIG9uTWVzc2FnZVVwZGF0ZShjYWxsYmFjazogTWVzc2FnZVVwZGF0ZUNhbGxiYWNrKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9wcm92aWRlckJhc2Uub25NZXNzYWdlVXBkYXRlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjazogTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9wcm92aWRlckJhc2Uub25NZXNzYWdlSW52YWxpZGF0aW9uKGNhbGxiYWNrKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2xhbmdEaWFnbm9zdGljc1Byb3ZpZGVyO1xuIl19