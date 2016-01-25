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

        var filePath = diagnostic.location.file;

        // TODO(t7637036): remove when clang errors are less spammy
        if (filePath !== textEditor.getPath()) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsYW5nRGlhZ25vc3RpY3NQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O3lCQW9CMEIsYUFBYTs7dUNBQ0QsaUNBQWlDOzt5QkFDN0MsaUJBQWlCOzt1QkFDdkIsZUFBZTs7dUJBQ1gsZUFBZTs7d0JBQ1YsWUFBWTs7b0JBQ3JCLE1BQU07O0lBRXBCLHdCQUF3QjtBQVNqQixXQVRQLHdCQUF3QixDQVNoQixrQkFBMEMsRUFBRTswQkFUcEQsd0JBQXdCOztBQVUxQixRQUFNLE9BQU8sR0FBRztBQUNkLG1CQUFhLHdCQUFhO0FBQzFCLHVCQUFpQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUNqRCwyQkFBcUIsRUFBRSxJQUFJLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztLQUNwRSxDQUFDO0FBQ0YsUUFBSSxDQUFDLGFBQWEsR0FBRyxxREFBNEIsT0FBTyxDQUFDLENBQUM7QUFDMUQsUUFBSSxDQUFDLG1CQUFtQixHQUFHLGtCQUFrQixDQUFDO0FBQzlDLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0dBQ25DOzt3QkFsQkcsd0JBQXdCOztXQW9CZCx3QkFBQyxNQUF1QixFQUFROzs7QUFDNUMsVUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsd0JBQ1gsTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUN2QztlQUFNLE1BQUssbUJBQW1CLENBQUMsTUFBTSxDQUFDO09BQUEsQ0FDdkMsQ0FBQztLQUNIOzs7aUJBRUEsNEJBQVksc0NBQXNDLENBQUM7NkJBQzNCLFdBQUMsVUFBMkIsRUFBaUI7QUFDcEUsVUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3RDLFVBQUksQ0FBQyxRQUFRLEVBQUU7QUFDYixlQUFPO09BQ1I7O0FBRUQsVUFBSTtBQUNGLFlBQU0sV0FBVyxHQUFHLE1BQU0sOEJBQWUsVUFB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LENBQUMsQ0FBQztLQUNKOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDOUI7OztTQTNJRyx3QkFBd0I7OztBQStJOUIsTUFBTSxDQUFDLE9BQU8sR0FBRyx3QkFBd0IsQ0FBQyIsImZpbGUiOiJDbGFuZ0RpYWdub3N0aWNzUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7QnVzeVNpZ25hbFByb3ZpZGVyQmFzZX0gZnJvbSAnLi4vLi4vYnVzeS1zaWduYWwtcHJvdmlkZXItYmFzZSc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7Q2xhbmdDb21waWxlUmVzdWx0fSBmcm9tICcuLi8uLi9jbGFuZyc7XG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVEaWFnbm9zdGljTWVzc2FnZSxcbiAgTWVzc2FnZVVwZGF0ZUNhbGxiYWNrLFxuICBNZXNzYWdlSW52YWxpZGF0aW9uQ2FsbGJhY2ssXG59IGZyb20gJy4uLy4uL2RpYWdub3N0aWNzL2Jhc2UnO1xuXG5pbXBvcnQge0dSQU1NQVJfU0VUfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge0RpYWdub3N0aWNzUHJvdmlkZXJCYXNlfSBmcm9tICcuLi8uLi9kaWFnbm9zdGljcy9wcm92aWRlci1iYXNlJztcbmltcG9ydCB7dHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9sb2dnaW5nJztcbmltcG9ydCB7Z2V0RGlhZ25vc3RpY3N9IGZyb20gJy4vbGliY2xhbmcnO1xuaW1wb3J0IHtSYW5nZX0gZnJvbSAnYXRvbSc7XG5cbmNsYXNzIENsYW5nRGlhZ25vc3RpY3NQcm92aWRlciB7XG4gIF9wcm92aWRlckJhc2U6IERpYWdub3N0aWNzUHJvdmlkZXJCYXNlO1xuICBfYnVzeVNpZ25hbFByb3ZpZGVyOiBCdXN5U2lnbmFsUHJvdmlkZXJCYXNlO1xuXG4gIC8vIENsYW5nIGNhbiBvZnRlbiBwb2ludCBvdXQgZXJyb3JzIGluIG90aGVyIGZpbGVzIChlLmcuIGluY2x1ZGVkIGhlYWRlciBmaWxlcykuXG4gIC8vIFdlIG5lZWQgdG8ga2VlcCB0cmFjayBvZiBhbGwgdGhlIGVycm9yIGxvY2F0aW9ucyBmb3IgZWFjaCBmaWxlIHNvIHRoZXkgY2FuIGJlIGNsZWFyZWRcbiAgLy8gd2hlbiBkaWFnbm9zdGljcyBhcmUgdXBkYXRlZC5cbiAgX2RpYWdub3N0aWNQYXRoczogTWFwPE51Y2xpZGVVcmksIEFycmF5PE51Y2xpZGVVcmk+PjtcblxuICBjb25zdHJ1Y3RvcihidXN5U2lnbmFsUHJvdmlkZXI6IEJ1c3lTaWduYWxQcm92aWRlckJhc2UpIHtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgZ3JhbW1hclNjb3BlczogR1JBTU1BUl9TRVQsXG4gICAgICBvblRleHRFZGl0b3JFdmVudDogdGhpcy5ydW5EaWFnbm9zdGljcy5iaW5kKHRoaXMpLFxuICAgICAgb25OZXdVcGRhdGVTdWJzY3JpYmVyOiB0aGlzLl9yZWNlaXZlZE5ld1VwZGF0ZVN1YnNjcmliZXIuYmluZCh0aGlzKSxcbiAgICB9O1xuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZSA9IG5ldyBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZShvcHRpb25zKTtcbiAgICB0aGlzLl9idXN5U2lnbmFsUHJvdmlkZXIgPSBidXN5U2lnbmFsUHJvdmlkZXI7XG4gICAgdGhpcy5fZGlhZ25vc3RpY1BhdGhzID0gbmV3IE1hcCgpO1xuICB9XG5cbiAgcnVuRGlhZ25vc3RpY3MoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICB0aGlzLl9idXN5U2lnbmFsUHJvdmlkZXIucmVwb3J0QnVzeShcbiAgICAgIGBDbGFuZzogY29tcGlsaW5nIFxcYCR7ZWRpdG9yLmdldFRpdGxlKCl9XFxgYCxcbiAgICAgICgpID0+IHRoaXMuX3J1bkRpYWdub3N0aWNzSW1wbChlZGl0b3IpLFxuICAgICk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ251Y2xpZGUtY2xhbmctYXRvbS5mZXRjaC1kaWFnbm9zdGljcycpXG4gIGFzeW5jIF9ydW5EaWFnbm9zdGljc0ltcGwodGV4dEVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZmlsZVBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRpYWdub3N0aWNzID0gYXdhaXQgZ2V0RGlhZ25vc3RpY3ModGV4dEVkaXRvcik7XG4gICAgICBpZiAoZGlhZ25vc3RpY3MgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBmaWxlUGF0aFRvTWVzc2FnZXMgPSB0aGlzLl9wcm9jZXNzRGlhZ25vc3RpY3MoZGlhZ25vc3RpY3MsIHRleHRFZGl0b3IpO1xuICAgICAgdGhpcy5pbnZhbGlkYXRlUGF0aChmaWxlUGF0aCk7XG4gICAgICB0aGlzLl9wcm92aWRlckJhc2UucHVibGlzaE1lc3NhZ2VVcGRhdGUoe2ZpbGVQYXRoVG9NZXNzYWdlc30pO1xuICAgICAgdGhpcy5fZGlhZ25vc3RpY1BhdGhzLnNldChmaWxlUGF0aCwgYXJyYXkuZnJvbShmaWxlUGF0aFRvTWVzc2FnZXMua2V5cygpKSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGdldExvZ2dlcigpLmVycm9yKGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBfcHJvY2Vzc0RpYWdub3N0aWNzKFxuICAgIGRhdGE6IENsYW5nQ29tcGlsZVJlc3VsdCxcbiAgICB0ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gICk6IE1hcDxOdWNsaWRlVXJpLCBBcnJheTxGaWxlRGlhZ25vc3RpY01lc3NhZ2U+PiB7XG4gICAgY29uc3QgZmlsZVBhdGhUb01lc3NhZ2VzID0gbmV3IE1hcCgpO1xuICAgIGRhdGEuZGlhZ25vc3RpY3MuZm9yRWFjaChkaWFnbm9zdGljID0+IHtcbiAgICAgIC8vIFdlIHNob3cgb25seSB3YXJuaW5ncywgZXJyb3JzIGFuZCBmYXRhbHMgKDIsIDMgYW5kIDQsIHJlc3BlY3RpdmVseSkuXG4gICAgICBpZiAoZGlhZ25vc3RpYy5zZXZlcml0eSA8IDIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7ZmlsZTogZmlsZVBhdGh9ID0gZGlhZ25vc3RpYy5sb2NhdGlvbjtcbiAgICAgIC8vIFRPRE8odDc2MzcwMzYpOiByZW1vdmUgd2hlbiBjbGFuZyBlcnJvcnMgYXJlIGxlc3Mgc3BhbW15XG4gICAgICBpZiAoZmlsZVBhdGggIT09IHRleHRFZGl0b3IuZ2V0UGF0aCgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gQ2xhbmcgYWRkcyBmaWxlLXdpZGUgZXJyb3JzIG9uIGxpbmUgLTEsIHNvIHdlIHB1dCBpdCBvbiBsaW5lIDAgaW5zdGVhZC5cbiAgICAgIC8vIFRoZSB1c3VhbCBmaWxlLXdpZGUgZXJyb3IgaXMgJ3RvbyBtYW55IGVycm9ycyBlbWl0dGVkLCBzdG9wcGluZyBub3cnLlxuICAgICAgY29uc3QgbGluZSA9IE1hdGgubWF4KDAsIGRpYWdub3N0aWMubG9jYXRpb24ubGluZSk7XG4gICAgICBjb25zdCBjb2wgPSAwO1xuICAgICAgbGV0IHJhbmdlO1xuICAgICAgaWYgKGRpYWdub3N0aWMucmFuZ2VzKSB7XG4gICAgICAgIC8vIFVzZSB0aGUgZmlyc3QgcmFuZ2UgZnJvbSB0aGUgZGlhZ25vc3RpYyBhcyB0aGUgcmFuZ2UgZm9yIExpbnRlci5cbiAgICAgICAgY29uc3QgY2xhbmdSYW5nZSA9IGRpYWdub3N0aWMucmFuZ2VzWzBdO1xuICAgICAgICByYW5nZSA9IG5ldyBSYW5nZShcbiAgICAgICAgICBbY2xhbmdSYW5nZS5zdGFydC5saW5lLCBjbGFuZ1JhbmdlLnN0YXJ0LmNvbHVtbl0sXG4gICAgICAgICAgW2NsYW5nUmFuZ2UuZW5kLmxpbmUsIGNsYW5nUmFuZ2UuZW5kLmNvbHVtbl1cbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJhbmdlID0gbmV3IFJhbmdlKFxuICAgICAgICAgIFtsaW5lLCBjb2xdLFxuICAgICAgICAgIFtsaW5lLCB0ZXh0RWRpdG9yLmdldEJ1ZmZlcigpLmxpbmVMZW5ndGhGb3JSb3cobGluZSldXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGxldCBtZXNzYWdlcyA9IGZpbGVQYXRoVG9NZXNzYWdlcy5nZXQoZmlsZVBhdGgpO1xuICAgICAgaWYgKG1lc3NhZ2VzID09IG51bGwpIHtcbiAgICAgICAgbWVzc2FnZXMgPSBbXTtcbiAgICAgICAgZmlsZVBhdGhUb01lc3NhZ2VzLnNldChmaWxlUGF0aCwgbWVzc2FnZXMpO1xuICAgICAgfVxuICAgICAgbWVzc2FnZXMucHVzaCh7XG4gICAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICAgIHByb3ZpZGVyTmFtZTogJ0NsYW5nJyxcbiAgICAgICAgdHlwZTogZGlhZ25vc3RpYy5zZXZlcml0eSA9PT0gMiA/ICdXYXJuaW5nJyA6ICdFcnJvcicsXG4gICAgICAgIGZpbGVQYXRoLFxuICAgICAgICB0ZXh0OiBkaWFnbm9zdGljLnNwZWxsaW5nLFxuICAgICAgICByYW5nZSxcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGZpbGVQYXRoVG9NZXNzYWdlcztcbiAgfVxuXG4gIGludmFsaWRhdGVQYXRoKHBhdGg6IE51Y2xpZGVVcmkpOiB2b2lkIHtcbiAgICBjb25zdCBmaWxlUGF0aHMgPSB0aGlzLl9kaWFnbm9zdGljUGF0aHMuZ2V0KHBhdGgpO1xuICAgIGlmIChmaWxlUGF0aHMgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlSW52YWxpZGF0aW9uKHtzY29wZTogJ2ZpbGUnLCBmaWxlUGF0aHN9KTtcbiAgICB9XG4gIH1cblxuICBfcmVjZWl2ZWROZXdVcGRhdGVTdWJzY3JpYmVyKGNhbGxiYWNrOiBNZXNzYWdlVXBkYXRlQ2FsbGJhY2spOiB2b2lkIHtcbiAgICBjb25zdCBhY3RpdmVUZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmIChhY3RpdmVUZXh0RWRpdG9yICYmIEdSQU1NQVJfU0VULmhhcyhhY3RpdmVUZXh0RWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUpKSB7XG4gICAgICB0aGlzLnJ1bkRpYWdub3N0aWNzKGFjdGl2ZVRleHRFZGl0b3IpO1xuICAgIH1cbiAgfVxuXG4gIG9uTWVzc2FnZVVwZGF0ZShjYWxsYmFjazogTWVzc2FnZVVwZGF0ZUNhbGxiYWNrKTogYXRvbSREaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvdmlkZXJCYXNlLm9uTWVzc2FnZVVwZGF0ZShjYWxsYmFjayk7XG4gIH1cblxuICBvbk1lc3NhZ2VJbnZhbGlkYXRpb24oY2FsbGJhY2s6IE1lc3NhZ2VJbnZhbGlkYXRpb25DYWxsYmFjayk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3ZpZGVyQmFzZS5vbk1lc3NhZ2VJbnZhbGlkYXRpb24oY2FsbGJhY2spO1xuICB9XG5cbiAgaW52YWxpZGF0ZVByb2plY3RQYXRoKHByb2plY3RQYXRoOiBOdWNsaWRlVXJpKTogdm9pZCB7XG4gICAgY29uc3QgZmlsZVBhdGhzID0gbmV3IFNldCgpO1xuICAgIGZvciAoY29uc3QgW3BhdGgsIGVycm9yUGF0aHNdIG9mIHRoaXMuX2RpYWdub3N0aWNQYXRocykge1xuICAgICAgaWYgKHBhdGguc3RhcnRzV2l0aChwcm9qZWN0UGF0aCkpIHtcbiAgICAgICAgZXJyb3JQYXRocy5mb3JFYWNoKHggPT4gZmlsZVBhdGhzLmFkZCh4KSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5wdWJsaXNoTWVzc2FnZUludmFsaWRhdGlvbih7XG4gICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgZmlsZVBhdGhzOiBhcnJheS5mcm9tKGZpbGVQYXRocyksXG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5kaXNwb3NlKCk7XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENsYW5nRGlhZ25vc3RpY3NQcm92aWRlcjtcbiJdfQ==