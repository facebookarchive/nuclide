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
      var filePathToMessages = new Map();
      if (data.accurateFlags) {
        data.diagnostics.forEach(function (diagnostic) {
          // We show only warnings, errors and fatals (2, 3 and 4, respectively).
          if (diagnostic.severity < 2) {
            return;
          }

          // Clang adds file-wide errors on line -1, so we put it on line 0 instead.
          // The usual file-wide error is 'too many errors emitted, stopping now'.
          var line = Math.max(0, diagnostic.location.line);
          var col = 0;
          var range = undefined;
          if (diagnostic.ranges) {
            // Use the first range from the diagnostic as the range for Linter.
            var clangRange = diagnostic.ranges[0];
            range = new _atom.Range([clangRange.start.line, clangRange.start.column], [clangRange.end.line, clangRange.end.column]);
          } else {
            var endCol = 1000;
            var buffer = textEditor.getBuffer();
            if (line <= buffer.getLastRow()) {
              endCol = buffer.lineLengthForRow(line);
            }
            range = new _atom.Range([line, col], [line, endCol]);
          }

          var filePath = diagnostic.location.file;

          var messages = filePathToMessages.get(filePath);
          if (messages == null) {
            messages = [];
            filePathToMessages.set(filePath, messages);
          }
          messages.push({
            scope: 'file',
            providerName: 'Clang',
            type: diagnostic.severity === 2 ? 'Warning' : 'Error',
            filePath: filePath,
            text: diagnostic.spelling,
            range: range
          });
        });
      } else {
        var filePath = textEditor.getPath();
        (0, _assert2['default'])(filePath);
        filePathToMessages.set(filePath, [{
          scope: 'file',
          providerName: 'Clang',
          type: 'Warning',
          filePath: filePath,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsYW5nRGlhZ25vc3RpY3NQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O3NCQW9Cc0IsUUFBUTs7Ozt5QkFDSixhQUFhOzt1Q0FDRCxpQ0FBaUM7O3lCQUM3QyxpQkFBaUI7O3VCQUN2QixlQUFlOzt1QkFDWCxlQUFlOzt3QkFDVixZQUFZOztvQkFDQSxNQUFNOztBQUUvQyxJQUFNLHFCQUFxQixHQUN6Qiw2REFBNkQsR0FDN0QsNkVBQTZFLENBQUM7O0lBRTFFLHdCQUF3QjtBQVVqQixXQVZQLHdCQUF3QixDQVVoQixrQkFBMEMsRUFBRTswQkFWcEQsd0JBQXdCOztBQVcxQixRQUFNLE9BQU8sR0FBRztBQUNkLG1CQUFhLHdCQUFhO0FBQzFCLHVCQUFpQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUNqRCwyQkFBcUIsRUFBRSxJQUFJLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztLQUNwRSxDQUFDO0FBQ0YsUUFBSSxDQUFDLGFBQWEsR0FBRyxxREFBNEIsT0FBTyxDQUFDLENBQUM7QUFDMUQsUUFBSSxDQUFDLG1CQUFtQixHQUFHLGtCQUFrQixDQUFDOztBQUU5QyxRQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUN4QyxRQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUN0QyxRQUFJLENBQUMsY0FBYyxHQUFHLCtCQUF5QixDQUFDO0dBQ2pEOzt3QkF0Qkcsd0JBQXdCOztXQXdCZCx3QkFBQyxNQUF1QixFQUFROzs7QUFDNUMsVUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsd0JBQ1gsTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUN2QztlQUFNLE1BQUssbUJBQW1CLENBQUMsTUFBTSxDQUFDO09BQUEsQ0FDdkMsQ0FBQztLQUNIOzs7aUJBRUEsNEJBQVksc0NBQXNDLENBQUM7NkJBQzNC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YW5nRGlhZ25vc3RpY3NQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtCdXN5U2lnbmFsUHJvdmlkZXJCYXNlfSBmcm9tICcuLi8uLi9idXN5LXNpZ25hbC1wcm92aWRlci1iYXNlJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtDbGFuZ0NvbXBpbGVSZXN1bHR9IGZyb20gJy4uLy4uL2NsYW5nJztcbmltcG9ydCB0eXBlIHtcbiAgRmlsZURpYWdub3N0aWNNZXNzYWdlLFxuICBNZXNzYWdlVXBkYXRlQ2FsbGJhY2ssXG4gIE1lc3NhZ2VJbnZhbGlkYXRpb25DYWxsYmFjayxcbn0gZnJvbSAnLi4vLi4vZGlhZ25vc3RpY3MvYmFzZSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7R1JBTU1BUl9TRVR9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7RGlhZ25vc3RpY3NQcm92aWRlckJhc2V9IGZyb20gJy4uLy4uL2RpYWdub3N0aWNzL3Byb3ZpZGVyLWJhc2UnO1xuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcbmltcG9ydCB7YXJyYXl9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuaW1wb3J0IHtnZXREaWFnbm9zdGljc30gZnJvbSAnLi9saWJjbGFuZyc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIFJhbmdlfSBmcm9tICdhdG9tJztcblxuY29uc3QgREVGQVVMVF9GTEFHU19XQVJOSU5HID1cbiAgJ0RpYWdub3N0aWNzIGFyZSBkaXNhYmxlZCBkdWUgdG8gbGFjayBvZiBjb21waWxhdGlvbiBmbGFncy4gJyArXG4gICdCdWlsZCB0aGlzIGZpbGUgd2l0aCBCdWNrLCBvciBjcmVhdGUgYSBjb21waWxlX2NvbW1hbmRzLmpzb24gZmlsZSBtYW51YWxseS4nO1xuXG5jbGFzcyBDbGFuZ0RpYWdub3N0aWNzUHJvdmlkZXIge1xuICBfcHJvdmlkZXJCYXNlOiBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZTtcbiAgX2J1c3lTaWduYWxQcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyQmFzZTtcblxuICAvLyBLZWVwIHRyYWNrIG9mIHRoZSBkaWFnbm9zdGljcyBjcmVhdGVkIGJ5IGVhY2ggdGV4dCBidWZmZXIuXG4gIC8vIERpYWdub3N0aWNzIHdpbGwgYmUgcmVtb3ZlZCBvbmNlIHRoZSBmaWxlIGlzIGNsb3NlZC5cbiAgX2J1ZmZlckRpYWdub3N0aWNzOiBXZWFrTWFwPGF0b20kVGV4dEJ1ZmZlciwgQXJyYXk8TnVjbGlkZVVyaT4+O1xuICBfaGFzU3Vic2NyaXB0aW9uOiBXZWFrTWFwPGF0b20kVGV4dEJ1ZmZlciwgYm9vbGVhbj47XG4gIF9zdWJzY3JpcHRpb25zOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoYnVzeVNpZ25hbFByb3ZpZGVyOiBCdXN5U2lnbmFsUHJvdmlkZXJCYXNlKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIGdyYW1tYXJTY29wZXM6IEdSQU1NQVJfU0VULFxuICAgICAgb25UZXh0RWRpdG9yRXZlbnQ6IHRoaXMucnVuRGlhZ25vc3RpY3MuYmluZCh0aGlzKSxcbiAgICAgIG9uTmV3VXBkYXRlU3Vic2NyaWJlcjogdGhpcy5fcmVjZWl2ZWROZXdVcGRhdGVTdWJzY3JpYmVyLmJpbmQodGhpcyksXG4gICAgfTtcbiAgICB0aGlzLl9wcm92aWRlckJhc2UgPSBuZXcgRGlhZ25vc3RpY3NQcm92aWRlckJhc2Uob3B0aW9ucyk7XG4gICAgdGhpcy5fYnVzeVNpZ25hbFByb3ZpZGVyID0gYnVzeVNpZ25hbFByb3ZpZGVyO1xuXG4gICAgdGhpcy5fYnVmZmVyRGlhZ25vc3RpY3MgPSBuZXcgV2Vha01hcCgpO1xuICAgIHRoaXMuX2hhc1N1YnNjcmlwdGlvbiA9IG5ldyBXZWFrTWFwKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gIH1cblxuICBydW5EaWFnbm9zdGljcyhlZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IHZvaWQge1xuICAgIHRoaXMuX2J1c3lTaWduYWxQcm92aWRlci5yZXBvcnRCdXN5KFxuICAgICAgYENsYW5nOiBjb21waWxpbmcgXFxgJHtlZGl0b3IuZ2V0VGl0bGUoKX1cXGBgLFxuICAgICAgKCkgPT4gdGhpcy5fcnVuRGlhZ25vc3RpY3NJbXBsKGVkaXRvciksXG4gICAgKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnbnVjbGlkZS1jbGFuZy1hdG9tLmZldGNoLWRpYWdub3N0aWNzJylcbiAgYXN5bmMgX3J1bkRpYWdub3N0aWNzSW1wbCh0ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBidWZmZXIgPSB0ZXh0RWRpdG9yLmdldEJ1ZmZlcigpO1xuICAgIGlmICghdGhpcy5faGFzU3Vic2NyaXB0aW9uLmdldChidWZmZXIpKSB7XG4gICAgICBjb25zdCBkaXNwb3NhYmxlID0gYnVmZmVyLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZUJ1ZmZlcihidWZmZXIpO1xuICAgICAgICB0aGlzLl9oYXNTdWJzY3JpcHRpb24uZGVsZXRlKGJ1ZmZlcik7XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMucmVtb3ZlKGRpc3Bvc2FibGUpO1xuICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5faGFzU3Vic2NyaXB0aW9uLnNldChidWZmZXIsIHRydWUpO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoZGlzcG9zYWJsZSk7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRpYWdub3N0aWNzID0gYXdhaXQgZ2V0RGlhZ25vc3RpY3ModGV4dEVkaXRvcik7XG4gICAgICAvLyBJdCdzIGltcG9ydGFudCB0byBtYWtlIHN1cmUgdGhhdCB0aGUgYnVmZmVyIGhhc24ndCBhbHJlYWR5IGJlZW4gZGVzdHJveWVkLlxuICAgICAgaWYgKGRpYWdub3N0aWNzID09IG51bGwgfHwgIXRoaXMuX2hhc1N1YnNjcmlwdGlvbi5nZXQoYnVmZmVyKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBmaWxlUGF0aFRvTWVzc2FnZXMgPSB0aGlzLl9wcm9jZXNzRGlhZ25vc3RpY3MoZGlhZ25vc3RpY3MsIHRleHRFZGl0b3IpO1xuICAgICAgdGhpcy5pbnZhbGlkYXRlQnVmZmVyKGJ1ZmZlcik7XG4gICAgICB0aGlzLl9wcm92aWRlckJhc2UucHVibGlzaE1lc3NhZ2VVcGRhdGUoe2ZpbGVQYXRoVG9NZXNzYWdlc30pO1xuICAgICAgdGhpcy5fYnVmZmVyRGlhZ25vc3RpY3Muc2V0KGJ1ZmZlciwgYXJyYXkuZnJvbShmaWxlUGF0aFRvTWVzc2FnZXMua2V5cygpKSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGdldExvZ2dlcigpLmVycm9yKGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBfcHJvY2Vzc0RpYWdub3N0aWNzKFxuICAgIGRhdGE6IENsYW5nQ29tcGlsZVJlc3VsdCxcbiAgICB0ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gICk6IE1hcDxOdWNsaWRlVXJpLCBBcnJheTxGaWxlRGlhZ25vc3RpY01lc3NhZ2U+PiB7XG4gICAgY29uc3QgZmlsZVBhdGhUb01lc3NhZ2VzID0gbmV3IE1hcCgpO1xuICAgIGlmIChkYXRhLmFjY3VyYXRlRmxhZ3MpIHtcbiAgICAgIGRhdGEuZGlhZ25vc3RpY3MuZm9yRWFjaChkaWFnbm9zdGljID0+IHtcbiAgICAgICAgLy8gV2Ugc2hvdyBvbmx5IHdhcm5pbmdzLCBlcnJvcnMgYW5kIGZhdGFscyAoMiwgMyBhbmQgNCwgcmVzcGVjdGl2ZWx5KS5cbiAgICAgICAgaWYgKGRpYWdub3N0aWMuc2V2ZXJpdHkgPCAyKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2xhbmcgYWRkcyBmaWxlLXdpZGUgZXJyb3JzIG9uIGxpbmUgLTEsIHNvIHdlIHB1dCBpdCBvbiBsaW5lIDAgaW5zdGVhZC5cbiAgICAgICAgLy8gVGhlIHVzdWFsIGZpbGUtd2lkZSBlcnJvciBpcyAndG9vIG1hbnkgZXJyb3JzIGVtaXR0ZWQsIHN0b3BwaW5nIG5vdycuXG4gICAgICAgIGNvbnN0IGxpbmUgPSBNYXRoLm1heCgwLCBkaWFnbm9zdGljLmxvY2F0aW9uLmxpbmUpO1xuICAgICAgICBjb25zdCBjb2wgPSAwO1xuICAgICAgICBsZXQgcmFuZ2U7XG4gICAgICAgIGlmIChkaWFnbm9zdGljLnJhbmdlcykge1xuICAgICAgICAgIC8vIFVzZSB0aGUgZmlyc3QgcmFuZ2UgZnJvbSB0aGUgZGlhZ25vc3RpYyBhcyB0aGUgcmFuZ2UgZm9yIExpbnRlci5cbiAgICAgICAgICBjb25zdCBjbGFuZ1JhbmdlID0gZGlhZ25vc3RpYy5yYW5nZXNbMF07XG4gICAgICAgICAgcmFuZ2UgPSBuZXcgUmFuZ2UoXG4gICAgICAgICAgICBbY2xhbmdSYW5nZS5zdGFydC5saW5lLCBjbGFuZ1JhbmdlLnN0YXJ0LmNvbHVtbl0sXG4gICAgICAgICAgICBbY2xhbmdSYW5nZS5lbmQubGluZSwgY2xhbmdSYW5nZS5lbmQuY29sdW1uXVxuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGV0IGVuZENvbCA9IDEwMDA7XG4gICAgICAgICAgY29uc3QgYnVmZmVyID0gdGV4dEVkaXRvci5nZXRCdWZmZXIoKTtcbiAgICAgICAgICBpZiAobGluZSA8PSBidWZmZXIuZ2V0TGFzdFJvdygpKSB7XG4gICAgICAgICAgICBlbmRDb2wgPSBidWZmZXIubGluZUxlbmd0aEZvclJvdyhsaW5lKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmFuZ2UgPSBuZXcgUmFuZ2UoW2xpbmUsIGNvbF0sIFtsaW5lLCBlbmRDb2xdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHtmaWxlOiBmaWxlUGF0aH0gPSBkaWFnbm9zdGljLmxvY2F0aW9uO1xuICAgICAgICBsZXQgbWVzc2FnZXMgPSBmaWxlUGF0aFRvTWVzc2FnZXMuZ2V0KGZpbGVQYXRoKTtcbiAgICAgICAgaWYgKG1lc3NhZ2VzID09IG51bGwpIHtcbiAgICAgICAgICBtZXNzYWdlcyA9IFtdO1xuICAgICAgICAgIGZpbGVQYXRoVG9NZXNzYWdlcy5zZXQoZmlsZVBhdGgsIG1lc3NhZ2VzKTtcbiAgICAgICAgfVxuICAgICAgICBtZXNzYWdlcy5wdXNoKHtcbiAgICAgICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgICAgIHByb3ZpZGVyTmFtZTogJ0NsYW5nJyxcbiAgICAgICAgICB0eXBlOiBkaWFnbm9zdGljLnNldmVyaXR5ID09PSAyID8gJ1dhcm5pbmcnIDogJ0Vycm9yJyxcbiAgICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgICB0ZXh0OiBkaWFnbm9zdGljLnNwZWxsaW5nLFxuICAgICAgICAgIHJhbmdlLFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgICAgaW52YXJpYW50KGZpbGVQYXRoKTtcbiAgICAgIGZpbGVQYXRoVG9NZXNzYWdlcy5zZXQoZmlsZVBhdGgsIFtcbiAgICAgICAge1xuICAgICAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICAgICAgcHJvdmlkZXJOYW1lOiAnQ2xhbmcnLFxuICAgICAgICAgIHR5cGU6ICdXYXJuaW5nJyxcbiAgICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgICB0ZXh0OiBERUZBVUxUX0ZMQUdTX1dBUk5JTkcsXG4gICAgICAgICAgcmFuZ2U6IG5ldyBSYW5nZShbMCwgMF0sIFsxLCAwXSksXG4gICAgICAgIH0sXG4gICAgICBdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmlsZVBhdGhUb01lc3NhZ2VzO1xuICB9XG5cbiAgaW52YWxpZGF0ZUJ1ZmZlcihidWZmZXI6IGF0b20kVGV4dEJ1ZmZlcik6IHZvaWQge1xuICAgIGNvbnN0IGZpbGVQYXRocyA9IHRoaXMuX2J1ZmZlckRpYWdub3N0aWNzLmdldChidWZmZXIpO1xuICAgIGlmIChmaWxlUGF0aHMgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlSW52YWxpZGF0aW9uKHtzY29wZTogJ2ZpbGUnLCBmaWxlUGF0aHN9KTtcbiAgICB9XG4gIH1cblxuICBfcmVjZWl2ZWROZXdVcGRhdGVTdWJzY3JpYmVyKGNhbGxiYWNrOiBNZXNzYWdlVXBkYXRlQ2FsbGJhY2spOiB2b2lkIHtcbiAgICBjb25zdCBhY3RpdmVUZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmIChhY3RpdmVUZXh0RWRpdG9yICYmIEdSQU1NQVJfU0VULmhhcyhhY3RpdmVUZXh0RWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUpKSB7XG4gICAgICB0aGlzLnJ1bkRpYWdub3N0aWNzKGFjdGl2ZVRleHRFZGl0b3IpO1xuICAgIH1cbiAgfVxuXG4gIG9uTWVzc2FnZVVwZGF0ZShjYWxsYmFjazogTWVzc2FnZVVwZGF0ZUNhbGxiYWNrKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9wcm92aWRlckJhc2Uub25NZXNzYWdlVXBkYXRlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjazogTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9wcm92aWRlckJhc2Uub25NZXNzYWdlSW52YWxpZGF0aW9uKGNhbGxiYWNrKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2xhbmdEaWFnbm9zdGljc1Byb3ZpZGVyO1xuIl19