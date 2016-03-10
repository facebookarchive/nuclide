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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _diagnosticsProviderBase = require('../../diagnostics/provider-base');

var _featureConfig = require('../../feature-config');

var _featureConfig2 = _interopRequireDefault(_featureConfig);

var _analytics = require('../../analytics');

var _atomHelpers = require('../../atom-helpers');

var _commons = require('../../commons');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var RequestSerializer = _commons.promises.RequestSerializer;

var ArcanistDiagnosticsProvider = (function () {
  function ArcanistDiagnosticsProvider(busySignalProvider) {
    var _this = this;

    _classCallCheck(this, ArcanistDiagnosticsProvider);

    this._busySignalProvider = busySignalProvider;
    this._subscriptions = new _atom.CompositeDisposable();
    var baseOptions = {
      enableForAllGrammars: true,
      shouldRunOnTheFly: false,
      onTextEditorEvent: this._runLintWithBusyMessage.bind(this),
      onNewUpdateSubscriber: this._receivedNewUpdateSubscriber.bind(this)
    };
    this._providerBase = new _diagnosticsProviderBase.DiagnosticsProviderBase(baseOptions);
    this._requestSerializer = new RequestSerializer();
    this._subscriptions.add(atom.workspace.onWillDestroyPaneItem(function (_ref) {
      var item = _ref.item;

      if ((0, _atomHelpers.isTextEditor)(item)) {
        (0, _assert2['default'])(typeof item.getPath === 'function');
        var path = item.getPath();
        if (!path) {
          return;
        }
        var openBufferCount = _this._getOpenBufferCount(path);
        (0, _assert2['default'])(openBufferCount !== 0, 'The file that is about to be closed should still be open.');
        if (openBufferCount === 1) {
          _this._providerBase.publishMessageInvalidation({ scope: 'file', filePaths: [path] });
        }
      }
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
    decorators: [(0, _analytics.trackTiming)('nuclide-arcanist:lint')],
    value: _asyncToGenerator(function* (textEditor) {
      var _this3 = this;

      var filePath = textEditor.getPath();
      (0, _assert2['default'])(filePath);
      try {
        var _ret = yield* (function* () {
          var result = yield _this3._requestSerializer.run(require('../../arcanist-client').findDiagnostics([filePath]));
          if (result.status === 'outdated') {
            return {
              v: undefined
            };
          }
          var diagnostics = result.result;
          var blackListedLinters = new Set(_featureConfig2['default'].get('nuclide-arcanist.blacklistedLinters'));
          var filteredDiagnostics = diagnostics.filter(function (diagnostic) {
            return !blackListedLinters.has(diagnostic.code);
          });
          var fileDiagnostics = filteredDiagnostics.map(function (diagnostic) {
            var range = new _atom.Range([diagnostic.row, diagnostic.col], [diagnostic.row, textEditor.getBuffer().lineLengthForRow(diagnostic.row)]);
            var text = undefined;
            if (Array.isArray(diagnostic.text)) {
              // Sometimes `arc lint` returns an array of strings for the text, rather than just a
              // string :(.
              text = diagnostic.text.join(' ');
            } else {
              text = diagnostic.text;
            }
            var maybeProperties = {};
            if (diagnostic.original != null && diagnostic.replacement != null) {
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
          _this3._providerBase.publishMessageUpdate(diagnosticsUpdate);
        })();

        if (typeof _ret === 'object') return _ret.v;
      } catch (error) {
        var logger = require('../../logging').getLogger();
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

      return new _atom.Range([startRow, startCol], [endRow, endCol]);
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
  }, {
    key: '_getOpenBufferCount',
    value: function _getOpenBufferCount(path) {
      return atom.workspace.getTextEditors().filter(function (editor) {
        return editor.getPath() === path;
      }).length;
    }
  }]);

  return ArcanistDiagnosticsProvider;
})();

exports.ArcanistDiagnosticsProvider = ArcanistDiagnosticsProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFyY2FuaXN0RGlhZ25vc3RpY3NQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWtCeUMsTUFBTTs7dUNBQ1QsaUNBQWlDOzs2QkFFN0Msc0JBQXNCOzs7O3lCQUN0QixpQkFBaUI7OzJCQUNoQixvQkFBb0I7O3VCQUN4QixlQUFlOztzQkFDaEIsUUFBUTs7OztJQUV2QixpQkFBaUIscUJBQWpCLGlCQUFpQjs7SUFFWCwyQkFBMkI7QUFNM0IsV0FOQSwyQkFBMkIsQ0FNMUIsa0JBQTBDLEVBQUU7OzswQkFON0MsMkJBQTJCOztBQU9wQyxRQUFJLENBQUMsbUJBQW1CLEdBQUcsa0JBQWtCLENBQUM7QUFDOUMsUUFBSSxDQUFDLGNBQWMsR0FBRywrQkFBeUIsQ0FBQztBQUNoRCxRQUFNLFdBQVcsR0FBRztBQUNsQiwwQkFBb0IsRUFBRSxJQUFJO0FBQzFCLHVCQUFpQixFQUFFLEtBQUs7QUFDeEIsdUJBQWlCLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDMUQsMkJBQXFCLEVBQUUsSUFBSSxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7S0FDcEUsQ0FBQztBQUNGLFFBQUksQ0FBQyxhQUFhLEdBQUcscURBQTRCLFdBQVcsQ0FBQyxDQUFDO0FBQzlELFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLGlCQUFpQixFQUFFLENBQUM7QUFDbEQsUUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQyxVQUFDLElBQU0sRUFBSztVQUFWLElBQUksR0FBTCxJQUFNLENBQUwsSUFBSTs7QUFDakUsVUFBSSwrQkFBYSxJQUFJLENBQUMsRUFBRTtBQUN0QixpQ0FBVSxPQUFPLElBQUksQ0FBQyxPQUFPLEtBQUssVUFBVSxDQUFDLENBQUM7QUFDOUMsWUFBTSxJQUFhLEdBQUcsSUFBSSxDQUFD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QUEyQiIsImZpbGUiOiJBcmNhbmlzdERpYWdub3N0aWNzUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7QnVzeVNpZ25hbFByb3ZpZGVyQmFzZX0gZnJvbSAnLi4vLi4vYnVzeS1zaWduYWwtcHJvdmlkZXItYmFzZSc7XG5cbmltcG9ydCB0eXBlIHtcbiAgTWVzc2FnZVVwZGF0ZUNhbGxiYWNrLFxuICBNZXNzYWdlSW52YWxpZGF0aW9uQ2FsbGJhY2ssXG59IGZyb20gJy4uLy4uL2RpYWdub3N0aWNzL2Jhc2UnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIFJhbmdlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7RGlhZ25vc3RpY3NQcm92aWRlckJhc2V9IGZyb20gJy4uLy4uL2RpYWdub3N0aWNzL3Byb3ZpZGVyLWJhc2UnO1xuXG5pbXBvcnQgZmVhdHVyZUNvbmZpZyBmcm9tICcuLi8uLi9mZWF0dXJlLWNvbmZpZyc7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IHtpc1RleHRFZGl0b3J9IGZyb20gJy4uLy4uL2F0b20taGVscGVycyc7XG5pbXBvcnQge3Byb21pc2VzfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3Qge1JlcXVlc3RTZXJpYWxpemVyfSA9IHByb21pc2VzO1xuXG5leHBvcnQgY2xhc3MgQXJjYW5pc3REaWFnbm9zdGljc1Byb3ZpZGVyIHtcbiAgX3Byb3ZpZGVyQmFzZTogRGlhZ25vc3RpY3NQcm92aWRlckJhc2U7XG4gIF9yZXF1ZXN0U2VyaWFsaXplcjogUmVxdWVzdFNlcmlhbGl6ZXI7XG4gIF9zdWJzY3JpcHRpb25zOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9idXN5U2lnbmFsUHJvdmlkZXI6IEJ1c3lTaWduYWxQcm92aWRlckJhc2U7XG5cbiAgY29uc3RydWN0b3IoYnVzeVNpZ25hbFByb3ZpZGVyOiBCdXN5U2lnbmFsUHJvdmlkZXJCYXNlKSB7XG4gICAgdGhpcy5fYnVzeVNpZ25hbFByb3ZpZGVyID0gYnVzeVNpZ25hbFByb3ZpZGVyO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIGNvbnN0IGJhc2VPcHRpb25zID0ge1xuICAgICAgZW5hYmxlRm9yQWxsR3JhbW1hcnM6IHRydWUsXG4gICAgICBzaG91bGRSdW5PblRoZUZseTogZmFsc2UsXG4gICAgICBvblRleHRFZGl0b3JFdmVudDogdGhpcy5fcnVuTGludFdpdGhCdXN5TWVzc2FnZS5iaW5kKHRoaXMpLFxuICAgICAgb25OZXdVcGRhdGVTdWJzY3JpYmVyOiB0aGlzLl9yZWNlaXZlZE5ld1VwZGF0ZVN1YnNjcmliZXIuYmluZCh0aGlzKSxcbiAgICB9O1xuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZSA9IG5ldyBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZShiYXNlT3B0aW9ucyk7XG4gICAgdGhpcy5fcmVxdWVzdFNlcmlhbGl6ZXIgPSBuZXcgUmVxdWVzdFNlcmlhbGl6ZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vbldpbGxEZXN0cm95UGFuZUl0ZW0oKHtpdGVtfSkgPT4ge1xuICAgICAgaWYgKGlzVGV4dEVkaXRvcihpdGVtKSkge1xuICAgICAgICBpbnZhcmlhbnQodHlwZW9mIGl0ZW0uZ2V0UGF0aCA9PT0gJ2Z1bmN0aW9uJyk7XG4gICAgICAgIGNvbnN0IHBhdGg6ID9zdHJpbmcgPSBpdGVtLmdldFBhdGgoKTtcbiAgICAgICAgaWYgKCFwYXRoKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9wZW5CdWZmZXJDb3VudCA9IHRoaXMuX2dldE9wZW5CdWZmZXJDb3VudChwYXRoKTtcbiAgICAgICAgaW52YXJpYW50KFxuICAgICAgICAgIG9wZW5CdWZmZXJDb3VudCAhPT0gMCxcbiAgICAgICAgICAnVGhlIGZpbGUgdGhhdCBpcyBhYm91dCB0byBiZSBjbG9zZWQgc2hvdWxkIHN0aWxsIGJlIG9wZW4uJ1xuICAgICAgICApO1xuICAgICAgICBpZiAob3BlbkJ1ZmZlckNvdW50ID09PSAxKSB7XG4gICAgICAgICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlSW52YWxpZGF0aW9uKHtzY29wZTogJ2ZpbGUnLCBmaWxlUGF0aHM6IFtwYXRoXX0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKiBUaGUgcmV0dXJuZWQgUHJvbWlzZSB3aWxsIHJlc29sdmUgd2hlbiByZXN1bHRzIGhhdmUgYmVlbiBwdWJsaXNoZWQuICovXG4gIF9ydW5MaW50V2l0aEJ1c3lNZXNzYWdlKHRleHRFZGl0b3I6IFRleHRFZGl0b3IpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgaWYgKHBhdGggPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fYnVzeVNpZ25hbFByb3ZpZGVyLnJlcG9ydEJ1c3koXG4gICAgICBgV2FpdGluZyBmb3IgYXJjIGxpbnQgcmVzdWx0cyBmb3IgXFxgJHt0ZXh0RWRpdG9yLmdldFRpdGxlKCl9XFxgYCxcbiAgICAgICgpID0+IHRoaXMuX3J1bkxpbnQodGV4dEVkaXRvciksXG4gICAgICB7IG9ubHlGb3JGaWxlOiBwYXRoIH0sXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBEbyBub3QgY2FsbCB0aGlzIGRpcmVjdGx5IC0tIGNhbGwgX3J1bkxpbnRXaXRoQnVzeU1lc3NhZ2UgKi9cbiAgQHRyYWNrVGltaW5nKCdudWNsaWRlLWFyY2FuaXN0OmxpbnQnKVxuICBhc3luYyBfcnVuTGludCh0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZmlsZVBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICBpbnZhcmlhbnQoZmlsZVBhdGgpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9yZXF1ZXN0U2VyaWFsaXplci5ydW4oXG4gICAgICAgIHJlcXVpcmUoJy4uLy4uL2FyY2FuaXN0LWNsaWVudCcpLmZpbmREaWFnbm9zdGljcyhbZmlsZVBhdGhdKVxuICAgICAgKTtcbiAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSAnb3V0ZGF0ZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGRpYWdub3N0aWNzID0gcmVzdWx0LnJlc3VsdDtcbiAgICAgIGNvbnN0IGJsYWNrTGlzdGVkTGludGVycyA9IG5ldyBTZXQoZmVhdHVyZUNvbmZpZy5nZXQoJ251Y2xpZGUtYXJjYW5pc3QuYmxhY2tsaXN0ZWRMaW50ZXJzJykpO1xuICAgICAgY29uc3QgZmlsdGVyZWREaWFnbm9zdGljcyA9IGRpYWdub3N0aWNzLmZpbHRlcihkaWFnbm9zdGljID0+IHtcbiAgICAgICAgcmV0dXJuICFibGFja0xpc3RlZExpbnRlcnMuaGFzKGRpYWdub3N0aWMuY29kZSk7XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGZpbGVEaWFnbm9zdGljcyA9IGZpbHRlcmVkRGlhZ25vc3RpY3MubWFwKGRpYWdub3N0aWMgPT4ge1xuICAgICAgICBjb25zdCByYW5nZSA9IG5ldyBSYW5nZShcbiAgICAgICAgICBbZGlhZ25vc3RpYy5yb3csIGRpYWdub3N0aWMuY29sXSxcbiAgICAgICAgICBbZGlhZ25vc3RpYy5yb3csIHRleHRFZGl0b3IuZ2V0QnVmZmVyKCkubGluZUxlbmd0aEZvclJvdyhkaWFnbm9zdGljLnJvdyldXG4gICAgICAgICk7XG4gICAgICAgIGxldCB0ZXh0O1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkaWFnbm9zdGljLnRleHQpKSB7XG4gICAgICAgICAgLy8gU29tZXRpbWVzIGBhcmMgbGludGAgcmV0dXJucyBhbiBhcnJheSBvZiBzdHJpbmdzIGZvciB0aGUgdGV4dCwgcmF0aGVyIHRoYW4ganVzdCBhXG4gICAgICAgICAgLy8gc3RyaW5nIDooLlxuICAgICAgICAgIHRleHQgPSBkaWFnbm9zdGljLnRleHQuam9pbignICcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRleHQgPSBkaWFnbm9zdGljLnRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF5YmVQcm9wZXJ0aWVzID0ge307XG4gICAgICAgIGlmIChkaWFnbm9zdGljLm9yaWdpbmFsICE9IG51bGwgJiYgZGlhZ25vc3RpYy5yZXBsYWNlbWVudCAhPSBudWxsKSB7XG4gICAgICAgICAgbWF5YmVQcm9wZXJ0aWVzLmZpeCA9IHtcbiAgICAgICAgICAgIG9sZFJhbmdlOiB0aGlzLl9nZXRSYW5nZUZvckZpeChkaWFnbm9zdGljLnJvdywgZGlhZ25vc3RpYy5jb2wsIGRpYWdub3N0aWMub3JpZ2luYWwpLFxuICAgICAgICAgICAgbmV3VGV4dDogZGlhZ25vc3RpYy5yZXBsYWNlbWVudCxcbiAgICAgICAgICAgIG9sZFRleHQ6IGRpYWdub3N0aWMub3JpZ2luYWwsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICAgICAgcHJvdmlkZXJOYW1lOiAnQXJjJyArIChkaWFnbm9zdGljLmNvZGUgPyBgOiAke2RpYWdub3N0aWMuY29kZX1gIDogJycpLFxuICAgICAgICAgIHR5cGU6IGRpYWdub3N0aWMudHlwZSxcbiAgICAgICAgICB0ZXh0LFxuICAgICAgICAgIGZpbGVQYXRoOiBkaWFnbm9zdGljLmZpbGVQYXRoLFxuICAgICAgICAgIHJhbmdlLFxuICAgICAgICAgIC4uLm1heWJlUHJvcGVydGllcyxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgICAgY29uc3QgZGlhZ25vc3RpY3NVcGRhdGUgPSB7XG4gICAgICAgIGZpbGVQYXRoVG9NZXNzYWdlczogbmV3IE1hcChbW2ZpbGVQYXRoLCBmaWxlRGlhZ25vc3RpY3NdXSksXG4gICAgICB9O1xuICAgICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlVXBkYXRlKGRpYWdub3N0aWNzVXBkYXRlKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbG9nZ2luZycpLmdldExvZ2dlcigpO1xuICAgICAgbG9nZ2VyLmVycm9yKGVycm9yKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBfZ2V0UmFuZ2VGb3JGaXgoc3RhcnRSb3c6IG51bWJlciwgc3RhcnRDb2w6IG51bWJlciwgb3JpZ2luYWxUZXh0OiBzdHJpbmcpOiBhdG9tJFJhbmdlIHtcbiAgICBsZXQgbmV3bGluZUNvdW50ID0gMDtcbiAgICBmb3IgKGNvbnN0IGNoYXIgb2Ygb3JpZ2luYWxUZXh0KSB7XG4gICAgICBpZiAoY2hhciA9PT0gJ1xcbicpIHtcbiAgICAgICAgbmV3bGluZUNvdW50Kys7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGVuZFJvdyA9IHN0YXJ0Um93ICsgbmV3bGluZUNvdW50O1xuICAgIGNvbnN0IGxhc3ROZXdsaW5lSW5kZXggPSBvcmlnaW5hbFRleHQubGFzdEluZGV4T2YoJ1xcbicpO1xuICAgIGxldCBlbmRDb2w7XG4gICAgaWYgKGxhc3ROZXdsaW5lSW5kZXggPT09IC0xKSB7XG4gICAgICBlbmRDb2wgPSBzdGFydENvbCArIG9yaWdpbmFsVGV4dC5sZW5ndGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVuZENvbCA9IG9yaWdpbmFsVGV4dC5sZW5ndGggLSBsYXN0TmV3bGluZUluZGV4IC0gMTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJhbmdlKFtzdGFydFJvdywgc3RhcnRDb2xdLCBbZW5kUm93LCBlbmRDb2xdKTtcbiAgfVxuXG4gIF9yZWNlaXZlZE5ld1VwZGF0ZVN1YnNjcmliZXIoKTogdm9pZCB7XG4gICAgY29uc3QgYWN0aXZlVGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoYWN0aXZlVGV4dEVkaXRvcikge1xuICAgICAgdGhpcy5fcnVuTGludFdpdGhCdXN5TWVzc2FnZShhY3RpdmVUZXh0RWRpdG9yKTtcbiAgICB9XG4gIH1cblxuICBvbk1lc3NhZ2VVcGRhdGUoY2FsbGJhY2s6IE1lc3NhZ2VVcGRhdGVDYWxsYmFjayk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvdmlkZXJCYXNlLm9uTWVzc2FnZVVwZGF0ZShjYWxsYmFjayk7XG4gIH1cblxuICBvbk1lc3NhZ2VJbnZhbGlkYXRpb24oY2FsbGJhY2s6IE1lc3NhZ2VJbnZhbGlkYXRpb25DYWxsYmFjayk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvdmlkZXJCYXNlLm9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjayk7XG4gIH1cblxuICBfZ2V0T3BlbkJ1ZmZlckNvdW50KHBhdGg6IHN0cmluZyk6IG51bWJlciB7XG4gICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKClcbiAgICAgIC5maWx0ZXIoZWRpdG9yID0+IGVkaXRvci5nZXRQYXRoKCkgPT09IHBhdGgpXG4gICAgICAubGVuZ3RoO1xuICB9XG59XG4iXX0=