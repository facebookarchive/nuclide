var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

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

var _constants = require('./constants');

var _diagnosticsProviderBase = require('../../diagnostics/provider-base');

var _analytics = require('../../analytics');

var _commons = require('../../commons');

var _logging = require('../../logging');

var _libclang = require('./libclang');

var _atom = require('atom');

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
    this._diagnosticPaths = new Map();
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
      var filePath = textEditor.getPath();
      if (!filePath) {
        return;
      }

      try {
        var diagnostics = yield (0, _libclang.getDiagnostics)(textEditor);
        if (diagnostics == null) {
          return;
        }
        var filePathToMessages = this._processDiagnostics(diagnostics, textEditor);
        this.invalidatePath(filePath);
        this._providerBase.publishMessageUpdate({ filePathToMessages: filePathToMessages });
        this._diagnosticPaths.set(filePath, _commons.array.from(filePathToMessages.keys()));
      } catch (error) {
        (0, _logging.getLogger)().error(error);
      }
    })
  }, {
    key: '_processDiagnostics',
    value: function _processDiagnostics(data, textEditor) {
      var filePathToMessages = new Map();
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
          range = new _atom.Range([line, col], [line, textEditor.getBuffer().lineLengthForRow(line)]);
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

      return filePathToMessages;
    }
  }, {
    key: 'invalidatePath',
    value: function invalidatePath(path) {
      var filePaths = this._diagnosticPaths.get(path);
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
    key: 'invalidateProjectPath',
    value: function invalidateProjectPath(projectPath) {
      var filePaths = new Set();
      for (var _ref3 of this._diagnosticPaths) {
        var _ref2 = _slicedToArray(_ref3, 2);

        var path = _ref2[0];
        var errorPaths = _ref2[1];

        if (path.startsWith(projectPath)) {
          errorPaths.forEach(function (x) {
            return filePaths.add(x);
          });
        }
      }
      this._providerBase.publishMessageInvalidation({
        scope: 'file',
        filePaths: _commons.array.from(filePaths)
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._providerBase.dispose();
    }
  }]);

  return ClangDiagnosticsProvider;
})();

module.exports = ClangDiagnosticsProvider;

// Clang can often point out errors in other files (e.g. included header files).
// We need to keep track of all the error locations for each file so they can be cleared
// when diagnostics are updated.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsYW5nRGlhZ25vc3RpY3NQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O3lCQW9CMEIsYUFBYTs7dUNBQ0QsaUNBQWlDOzt5QkFDN0MsaUJBQWlCOzt1QkFDdkIsZUFBZTs7dUJBQ1gsZUFBZTs7d0JBQ1YsWUFBWTs7b0JBQ3JCLE1BQU07O0lBRXBCLHdCQUF3QjtBQVNqQixXQVRQLHdCQUF3QixDQVNoQixrQkFBMEMsRUFBRTswQkFUcEQsd0JBQXdCOztBQVUxQixRQUFNLE9BQU8sR0FBRztBQUNkLG1CQUFhLHdCQUFhO0FBQzFCLHVCQUFpQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUNqRCwyQkFBcUIsRUFBRSxJQUFJLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztLQUNwRSxDQUFDO0FBQ0YsUUFBSSxDQUFDLGFBQWEsR0FBRyxxREFBNEIsT0FBTyxDQUFDLENBQUM7QUFDMUQsUUFBSSxDQUFDLG1CQUFtQixHQUFHLGtCQUFrQixDQUFDO0FBQzlDLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0dBQ25DOzt3QkFsQkcsd0JBQXdCOztXQW9CZCx3QkFBQyxNQUF1QixFQUFROzs7QUFDNUMsVUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsd0JBQ1gsTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUN2QztlQUFNLE1BQUssbUJBQW1CLENBQUMsTUFBTSxDQUFDO09BQUEsQ0FDdkMsQ0FBQztLQUNIOzs7aUJBRUEsNEJBQVksc0NBQXNDLENBQUM7NkJBQzNCLFdBQUMsVUFBMkIsRUFBaUI7QUFDcEUsVUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3RDLFVBQUksQ0FBQyxRQUFRLEVBQUU7QUFDYixlQUFPO09BQ1I7O0FBRUQsVUFBSTtBQUNGLFlBQU0sV0FBVyxHQUFHLE1BQU0sOEJBQWUsVUFB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Q0FBQztLQUM5Qjs7O1NBdElHLHdCQUF3Qjs7O0FBMEk5QixNQUFNLENBQUMsT0FBTyxHQUFHLHdCQUF3QixDQUFDIiwiZmlsZSI6IkNsYW5nRGlhZ25vc3RpY3NQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtCdXN5U2lnbmFsUHJvdmlkZXJCYXNlfSBmcm9tICcuLi8uLi9idXN5LXNpZ25hbC1wcm92aWRlci1iYXNlJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtDbGFuZ0NvbXBpbGVSZXN1bHR9IGZyb20gJy4uLy4uL2NsYW5nJztcbmltcG9ydCB0eXBlIHtcbiAgRmlsZURpYWdub3N0aWNNZXNzYWdlLFxuICBNZXNzYWdlVXBkYXRlQ2FsbGJhY2ssXG4gIE1lc3NhZ2VJbnZhbGlkYXRpb25DYWxsYmFjayxcbn0gZnJvbSAnLi4vLi4vZGlhZ25vc3RpY3MvYmFzZSc7XG5cbmltcG9ydCB7R1JBTU1BUl9TRVR9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7RGlhZ25vc3RpY3NQcm92aWRlckJhc2V9IGZyb20gJy4uLy4uL2RpYWdub3N0aWNzL3Byb3ZpZGVyLWJhc2UnO1xuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcbmltcG9ydCB7YXJyYXl9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuaW1wb3J0IHtnZXREaWFnbm9zdGljc30gZnJvbSAnLi9saWJjbGFuZyc7XG5pbXBvcnQge1JhbmdlfSBmcm9tICdhdG9tJztcblxuY2xhc3MgQ2xhbmdEaWFnbm9zdGljc1Byb3ZpZGVyIHtcbiAgX3Byb3ZpZGVyQmFzZTogRGlhZ25vc3RpY3NQcm92aWRlckJhc2U7XG4gIF9idXN5U2lnbmFsUHJvdmlkZXI6IEJ1c3lTaWduYWxQcm92aWRlckJhc2U7XG5cbiAgLy8gQ2xhbmcgY2FuIG9mdGVuIHBvaW50IG91dCBlcnJvcnMgaW4gb3RoZXIgZmlsZXMgKGUuZy4gaW5jbHVkZWQgaGVhZGVyIGZpbGVzKS5cbiAgLy8gV2UgbmVlZCB0byBrZWVwIHRyYWNrIG9mIGFsbCB0aGUgZXJyb3IgbG9jYXRpb25zIGZvciBlYWNoIGZpbGUgc28gdGhleSBjYW4gYmUgY2xlYXJlZFxuICAvLyB3aGVuIGRpYWdub3N0aWNzIGFyZSB1cGRhdGVkLlxuICBfZGlhZ25vc3RpY1BhdGhzOiBNYXA8TnVjbGlkZVVyaSwgQXJyYXk8TnVjbGlkZVVyaT4+O1xuXG4gIGNvbnN0cnVjdG9yKGJ1c3lTaWduYWxQcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyQmFzZSkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICBncmFtbWFyU2NvcGVzOiBHUkFNTUFSX1NFVCxcbiAgICAgIG9uVGV4dEVkaXRvckV2ZW50OiB0aGlzLnJ1bkRpYWdub3N0aWNzLmJpbmQodGhpcyksXG4gICAgICBvbk5ld1VwZGF0ZVN1YnNjcmliZXI6IHRoaXMuX3JlY2VpdmVkTmV3VXBkYXRlU3Vic2NyaWJlci5iaW5kKHRoaXMpLFxuICAgIH07XG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlID0gbmV3IERpYWdub3N0aWNzUHJvdmlkZXJCYXNlKG9wdGlvbnMpO1xuICAgIHRoaXMuX2J1c3lTaWduYWxQcm92aWRlciA9IGJ1c3lTaWduYWxQcm92aWRlcjtcbiAgICB0aGlzLl9kaWFnbm9zdGljUGF0aHMgPSBuZXcgTWFwKCk7XG4gIH1cblxuICBydW5EaWFnbm9zdGljcyhlZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IHZvaWQge1xuICAgIHRoaXMuX2J1c3lTaWduYWxQcm92aWRlci5yZXBvcnRCdXN5KFxuICAgICAgYENsYW5nOiBjb21waWxpbmcgXFxgJHtlZGl0b3IuZ2V0VGl0bGUoKX1cXGBgLFxuICAgICAgKCkgPT4gdGhpcy5fcnVuRGlhZ25vc3RpY3NJbXBsKGVkaXRvciksXG4gICAgKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnbnVjbGlkZS1jbGFuZy1hdG9tLmZldGNoLWRpYWdub3N0aWNzJylcbiAgYXN5bmMgX3J1bkRpYWdub3N0aWNzSW1wbCh0ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgZGlhZ25vc3RpY3MgPSBhd2FpdCBnZXREaWFnbm9zdGljcyh0ZXh0RWRpdG9yKTtcbiAgICAgIGlmIChkaWFnbm9zdGljcyA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGZpbGVQYXRoVG9NZXNzYWdlcyA9IHRoaXMuX3Byb2Nlc3NEaWFnbm9zdGljcyhkaWFnbm9zdGljcywgdGV4dEVkaXRvcik7XG4gICAgICB0aGlzLmludmFsaWRhdGVQYXRoKGZpbGVQYXRoKTtcbiAgICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5wdWJsaXNoTWVzc2FnZVVwZGF0ZSh7ZmlsZVBhdGhUb01lc3NhZ2VzfSk7XG4gICAgICB0aGlzLl9kaWFnbm9zdGljUGF0aHMuc2V0KGZpbGVQYXRoLCBhcnJheS5mcm9tKGZpbGVQYXRoVG9NZXNzYWdlcy5rZXlzKCkpKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIF9wcm9jZXNzRGlhZ25vc3RpY3MoXG4gICAgZGF0YTogQ2xhbmdDb21waWxlUmVzdWx0LFxuICAgIHRleHRFZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbiAgKTogTWFwPE51Y2xpZGVVcmksIEFycmF5PEZpbGVEaWFnbm9zdGljTWVzc2FnZT4+IHtcbiAgICBjb25zdCBmaWxlUGF0aFRvTWVzc2FnZXMgPSBuZXcgTWFwKCk7XG4gICAgZGF0YS5kaWFnbm9zdGljcy5mb3JFYWNoKGRpYWdub3N0aWMgPT4ge1xuICAgICAgLy8gV2Ugc2hvdyBvbmx5IHdhcm5pbmdzLCBlcnJvcnMgYW5kIGZhdGFscyAoMiwgMyBhbmQgNCwgcmVzcGVjdGl2ZWx5KS5cbiAgICAgIGlmIChkaWFnbm9zdGljLnNldmVyaXR5IDwgMikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIENsYW5nIGFkZHMgZmlsZS13aWRlIGVycm9ycyBvbiBsaW5lIC0xLCBzbyB3ZSBwdXQgaXQgb24gbGluZSAwIGluc3RlYWQuXG4gICAgICAvLyBUaGUgdXN1YWwgZmlsZS13aWRlIGVycm9yIGlzICd0b28gbWFueSBlcnJvcnMgZW1pdHRlZCwgc3RvcHBpbmcgbm93Jy5cbiAgICAgIGNvbnN0IGxpbmUgPSBNYXRoLm1heCgwLCBkaWFnbm9zdGljLmxvY2F0aW9uLmxpbmUpO1xuICAgICAgY29uc3QgY29sID0gMDtcbiAgICAgIGxldCByYW5nZTtcbiAgICAgIGlmIChkaWFnbm9zdGljLnJhbmdlcykge1xuICAgICAgICAvLyBVc2UgdGhlIGZpcnN0IHJhbmdlIGZyb20gdGhlIGRpYWdub3N0aWMgYXMgdGhlIHJhbmdlIGZvciBMaW50ZXIuXG4gICAgICAgIGNvbnN0IGNsYW5nUmFuZ2UgPSBkaWFnbm9zdGljLnJhbmdlc1swXTtcbiAgICAgICAgcmFuZ2UgPSBuZXcgUmFuZ2UoXG4gICAgICAgICAgW2NsYW5nUmFuZ2Uuc3RhcnQubGluZSwgY2xhbmdSYW5nZS5zdGFydC5jb2x1bW5dLFxuICAgICAgICAgIFtjbGFuZ1JhbmdlLmVuZC5saW5lLCBjbGFuZ1JhbmdlLmVuZC5jb2x1bW5dXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByYW5nZSA9IG5ldyBSYW5nZShcbiAgICAgICAgICBbbGluZSwgY29sXSxcbiAgICAgICAgICBbbGluZSwgdGV4dEVkaXRvci5nZXRCdWZmZXIoKS5saW5lTGVuZ3RoRm9yUm93KGxpbmUpXVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7ZmlsZTogZmlsZVBhdGh9ID0gZGlhZ25vc3RpYy5sb2NhdGlvbjtcbiAgICAgIGxldCBtZXNzYWdlcyA9IGZpbGVQYXRoVG9NZXNzYWdlcy5nZXQoZmlsZVBhdGgpO1xuICAgICAgaWYgKG1lc3NhZ2VzID09IG51bGwpIHtcbiAgICAgICAgbWVzc2FnZXMgPSBbXTtcbiAgICAgICAgZmlsZVBhdGhUb01lc3NhZ2VzLnNldChmaWxlUGF0aCwgbWVzc2FnZXMpO1xuICAgICAgfVxuICAgICAgbWVzc2FnZXMucHVzaCh7XG4gICAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICAgIHByb3ZpZGVyTmFtZTogJ0NsYW5nJyxcbiAgICAgICAgdHlwZTogZGlhZ25vc3RpYy5zZXZlcml0eSA9PT0gMiA/ICdXYXJuaW5nJyA6ICdFcnJvcicsXG4gICAgICAgIGZpbGVQYXRoLFxuICAgICAgICB0ZXh0OiBkaWFnbm9zdGljLnNwZWxsaW5nLFxuICAgICAgICByYW5nZSxcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGZpbGVQYXRoVG9NZXNzYWdlcztcbiAgfVxuXG4gIGludmFsaWRhdGVQYXRoKHBhdGg6IE51Y2xpZGVVcmkpOiB2b2lkIHtcbiAgICBjb25zdCBmaWxlUGF0aHMgPSB0aGlzLl9kaWFnbm9zdGljUGF0aHMuZ2V0KHBhdGgpO1xuICAgIGlmIChmaWxlUGF0aHMgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlSW52YWxpZGF0aW9uKHtzY29wZTogJ2ZpbGUnLCBmaWxlUGF0aHN9KTtcbiAgICB9XG4gIH1cblxuICBfcmVjZWl2ZWROZXdVcGRhdGVTdWJzY3JpYmVyKGNhbGxiYWNrOiBNZXNzYWdlVXBkYXRlQ2FsbGJhY2spOiB2b2lkIHtcbiAgICBjb25zdCBhY3RpdmVUZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmIChhY3RpdmVUZXh0RWRpdG9yICYmIEdSQU1NQVJfU0VULmhhcyhhY3RpdmVUZXh0RWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUpKSB7XG4gICAgICB0aGlzLnJ1bkRpYWdub3N0aWNzKGFjdGl2ZVRleHRFZGl0b3IpO1xuICAgIH1cbiAgfVxuXG4gIG9uTWVzc2FnZVVwZGF0ZShjYWxsYmFjazogTWVzc2FnZVVwZGF0ZUNhbGxiYWNrKTogYXRvbSREaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvdmlkZXJCYXNlLm9uTWVzc2FnZVVwZGF0ZShjYWxsYmFjayk7XG4gIH1cblxuICBvbk1lc3NhZ2VJbnZhbGlkYXRpb24oY2FsbGJhY2s6IE1lc3NhZ2VJbnZhbGlkYXRpb25DYWxsYmFjayk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3ZpZGVyQmFzZS5vbk1lc3NhZ2VJbnZhbGlkYXRpb24oY2FsbGJhY2spO1xuICB9XG5cbiAgaW52YWxpZGF0ZVByb2plY3RQYXRoKHByb2plY3RQYXRoOiBOdWNsaWRlVXJpKTogdm9pZCB7XG4gICAgY29uc3QgZmlsZVBhdGhzID0gbmV3IFNldCgpO1xuICAgIGZvciAoY29uc3QgW3BhdGgsIGVycm9yUGF0aHNdIG9mIHRoaXMuX2RpYWdub3N0aWNQYXRocykge1xuICAgICAgaWYgKHBhdGguc3RhcnRzV2l0aChwcm9qZWN0UGF0aCkpIHtcbiAgICAgICAgZXJyb3JQYXRocy5mb3JFYWNoKHggPT4gZmlsZVBhdGhzLmFkZCh4KSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5wdWJsaXNoTWVzc2FnZUludmFsaWRhdGlvbih7XG4gICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgZmlsZVBhdGhzOiBhcnJheS5mcm9tKGZpbGVQYXRocyksXG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5kaXNwb3NlKCk7XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENsYW5nRGlhZ25vc3RpY3NQcm92aWRlcjtcbiJdfQ==