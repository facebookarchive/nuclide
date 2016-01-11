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

      var _require = require('atom');

      var Range = _require.Range;

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
            var range = new Range([diagnostic.row, diagnostic.col], [diagnostic.row, textEditor.getBuffer().lineLengthForRow(diagnostic.row)]);
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
                oldRange: new Range([diagnostic.row, diagnostic.col], [diagnostic.row, diagnostic.col + diagnostic.original.length]),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFyY2FuaXN0RGlhZ25vc3RpY3NQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWtCa0MsTUFBTTs7dUNBQ0YsaUNBQWlDOzs2QkFFN0Msc0JBQXNCOzs7O3lCQUN0QixpQkFBaUI7OzJCQUNoQixvQkFBb0I7O3VCQUN4QixlQUFlOztzQkFDaEIsUUFBUTs7OztJQUV2QixpQkFBaUIscUJBQWpCLGlCQUFpQjs7SUFFWCwyQkFBMkI7QUFNM0IsV0FOQSwyQkFBMkIsQ0FNMUIsa0JBQTBDLEVBQUU7OzswQkFON0MsMkJBQTJCOztBQU9wQyxRQUFJLENBQUMsbUJBQW1CLEdBQUcsa0JBQWtCLENBQUM7QUFDOUMsUUFBSSxDQUFDLGNBQWMsR0FBRywrQkFBeUIsQ0FBQztBQUNoRCxRQUFNLFdBQVcsR0FBRztBQUNsQiwwQkFBb0IsRUFBRSxJQUFJO0FBQzFCLHVCQUFpQixFQUFFLEtBQUs7QUFDeEIsdUJBQWlCLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDMUQsMkJBQXFCLEVBQUUsSUFBSSxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7S0FDcEUsQ0FBQztBQUNGLFFBQUksQ0FBQyxhQUFhLEdBQUcscURBQTRCLFdBQVcsQ0FBQyxDQUFDO0FBQzlELFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLGlCQUFpQixFQUFFLENBQUM7QUFDbEQsUUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQyxVQUFDLElBQU0sRUFBSztVQUFWLElBQUksR0FBTCxJQUFNLENBQUwsSUFBSTs7QUFDakUsVUFBSSwrQkFBYSxJQUFJLENBQUMsRUFBRTtBQUN0QixpQ0FBVSxPQUFPLElBQUksQ0FBQyxPQUFPLEtBQUssVUFBVSxDQUFDLENBQUM7QUFDOUMsWUFBTSxJQUFhLEdBQUcsSUFBSSxDQUFD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QUFTO0FBQ25DLFVBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzlELFVBQUksZ0JBQWdCLEVBQUU7QUFDcEIsWUFBSSxDQUFDLHVCQUF1QixDQUFDLGdCQUFnQixDQUFDLENBQUM7T0FDaEQ7S0FDRjs7O1dBRWMseUJBQUMsUUFBK0IsRUFBbUI7QUFDaEUsYUFBTyxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNyRDs7O1dBRW9CLCtCQUFDLFFBQXFDLEVBQW1CO0FBQzVFLGFBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUMzRDs7O1dBRWtCLDZCQUFDLElBQVksRUFBVTtBQUN4QyxhQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQ25DLE1BQU0sQ0FBQyxVQUFBLE1BQU07ZUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLEtBQUssSUFBSTtPQUFBLENBQUMsQ0FDM0MsTUFBTSxDQUFDO0tBQ1g7OztTQXZJVSwyQkFBMkIiLCJmaWxlIjoiQXJjYW5pc3REaWFnbm9zdGljc1Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0J1c3lTaWduYWxQcm92aWRlckJhc2V9IGZyb20gJy4uLy4uL2J1c3ktc2lnbmFsLXByb3ZpZGVyLWJhc2UnO1xuXG5pbXBvcnQgdHlwZSB7XG4gIE1lc3NhZ2VVcGRhdGVDYWxsYmFjayxcbiAgTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrLFxufSBmcm9tICcuLi8uLi9kaWFnbm9zdGljcy9iYXNlJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7RGlhZ25vc3RpY3NQcm92aWRlckJhc2V9IGZyb20gJy4uLy4uL2RpYWdub3N0aWNzL3Byb3ZpZGVyLWJhc2UnO1xuXG5pbXBvcnQgZmVhdHVyZUNvbmZpZyBmcm9tICcuLi8uLi9mZWF0dXJlLWNvbmZpZyc7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IHtpc1RleHRFZGl0b3J9IGZyb20gJy4uLy4uL2F0b20taGVscGVycyc7XG5pbXBvcnQge3Byb21pc2VzfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3Qge1JlcXVlc3RTZXJpYWxpemVyfSA9IHByb21pc2VzO1xuXG5leHBvcnQgY2xhc3MgQXJjYW5pc3REaWFnbm9zdGljc1Byb3ZpZGVyIHtcbiAgX3Byb3ZpZGVyQmFzZTogRGlhZ25vc3RpY3NQcm92aWRlckJhc2U7XG4gIF9yZXF1ZXN0U2VyaWFsaXplcjogUmVxdWVzdFNlcmlhbGl6ZXI7XG4gIF9zdWJzY3JpcHRpb25zOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9idXN5U2lnbmFsUHJvdmlkZXI6IEJ1c3lTaWduYWxQcm92aWRlckJhc2U7XG5cbiAgY29uc3RydWN0b3IoYnVzeVNpZ25hbFByb3ZpZGVyOiBCdXN5U2lnbmFsUHJvdmlkZXJCYXNlKSB7XG4gICAgdGhpcy5fYnVzeVNpZ25hbFByb3ZpZGVyID0gYnVzeVNpZ25hbFByb3ZpZGVyO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIGNvbnN0IGJhc2VPcHRpb25zID0ge1xuICAgICAgZW5hYmxlRm9yQWxsR3JhbW1hcnM6IHRydWUsXG4gICAgICBzaG91bGRSdW5PblRoZUZseTogZmFsc2UsXG4gICAgICBvblRleHRFZGl0b3JFdmVudDogdGhpcy5fcnVuTGludFdpdGhCdXN5TWVzc2FnZS5iaW5kKHRoaXMpLFxuICAgICAgb25OZXdVcGRhdGVTdWJzY3JpYmVyOiB0aGlzLl9yZWNlaXZlZE5ld1VwZGF0ZVN1YnNjcmliZXIuYmluZCh0aGlzKSxcbiAgICB9O1xuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZSA9IG5ldyBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZShiYXNlT3B0aW9ucyk7XG4gICAgdGhpcy5fcmVxdWVzdFNlcmlhbGl6ZXIgPSBuZXcgUmVxdWVzdFNlcmlhbGl6ZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vbldpbGxEZXN0cm95UGFuZUl0ZW0oKHtpdGVtfSkgPT4ge1xuICAgICAgaWYgKGlzVGV4dEVkaXRvcihpdGVtKSkge1xuICAgICAgICBpbnZhcmlhbnQodHlwZW9mIGl0ZW0uZ2V0UGF0aCA9PT0gJ2Z1bmN0aW9uJyk7XG4gICAgICAgIGNvbnN0IHBhdGg6ID9zdHJpbmcgPSBpdGVtLmdldFBhdGgoKTtcbiAgICAgICAgaWYgKCFwYXRoKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9wZW5CdWZmZXJDb3VudCA9IHRoaXMuX2dldE9wZW5CdWZmZXJDb3VudChwYXRoKTtcbiAgICAgICAgaW52YXJpYW50KFxuICAgICAgICAgIG9wZW5CdWZmZXJDb3VudCAhPT0gMCxcbiAgICAgICAgICAnVGhlIGZpbGUgdGhhdCBpcyBhYm91dCB0byBiZSBjbG9zZWQgc2hvdWxkIHN0aWxsIGJlIG9wZW4uJ1xuICAgICAgICApO1xuICAgICAgICBpZiAob3BlbkJ1ZmZlckNvdW50ID09PSAxKSB7XG4gICAgICAgICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlSW52YWxpZGF0aW9uKHtzY29wZTogJ2ZpbGUnLCBmaWxlUGF0aHM6IFtwYXRoXX0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKiBUaGUgcmV0dXJuZWQgUHJvbWlzZSB3aWxsIHJlc29sdmUgd2hlbiByZXN1bHRzIGhhdmUgYmVlbiBwdWJsaXNoZWQuICovXG4gIF9ydW5MaW50V2l0aEJ1c3lNZXNzYWdlKHRleHRFZGl0b3I6IFRleHRFZGl0b3IpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgaWYgKHBhdGggPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fYnVzeVNpZ25hbFByb3ZpZGVyLnJlcG9ydEJ1c3koXG4gICAgICBgV2FpdGluZyBmb3IgYXJjIGxpbnQgcmVzdWx0cyBmb3IgXFxgJHt0ZXh0RWRpdG9yLmdldFRpdGxlKCl9XFxgYCxcbiAgICAgICgpID0+IHRoaXMuX3J1bkxpbnQodGV4dEVkaXRvciksXG4gICAgICB7IG9ubHlGb3JGaWxlOiBwYXRoIH0sXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBEbyBub3QgY2FsbCB0aGlzIGRpcmVjdGx5IC0tIGNhbGwgX3J1bkxpbnRXaXRoQnVzeU1lc3NhZ2UgKi9cbiAgQHRyYWNrVGltaW5nKCdudWNsaWRlLWFyY2FuaXN0OmxpbnQnKVxuICBhc3luYyBfcnVuTGludCh0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZmlsZVBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICBpbnZhcmlhbnQoZmlsZVBhdGgpO1xuICAgIGNvbnN0IHtSYW5nZX0gPSByZXF1aXJlKCdhdG9tJyk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX3JlcXVlc3RTZXJpYWxpemVyLnJ1bihcbiAgICAgICAgcmVxdWlyZSgnLi4vLi4vYXJjYW5pc3QtY2xpZW50JykuZmluZERpYWdub3N0aWNzKFtmaWxlUGF0aF0pXG4gICAgICApO1xuICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09ICdvdXRkYXRlZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgZGlhZ25vc3RpY3MgPSByZXN1bHQucmVzdWx0O1xuICAgICAgY29uc3QgYmxhY2tMaXN0ZWRMaW50ZXJzID0gbmV3IFNldChmZWF0dXJlQ29uZmlnLmdldCgnbnVjbGlkZS1hcmNhbmlzdC5ibGFja2xpc3RlZExpbnRlcnMnKSk7XG4gICAgICBjb25zdCBmaWx0ZXJlZERpYWdub3N0aWNzID0gZGlhZ25vc3RpY3MuZmlsdGVyKGRpYWdub3N0aWMgPT4ge1xuICAgICAgICByZXR1cm4gIWJsYWNrTGlzdGVkTGludGVycy5oYXMoZGlhZ25vc3RpYy5jb2RlKTtcbiAgICAgIH0pO1xuICAgICAgY29uc3QgZmlsZURpYWdub3N0aWNzID0gZmlsdGVyZWREaWFnbm9zdGljcy5tYXAoZGlhZ25vc3RpYyA9PiB7XG4gICAgICAgIGNvbnN0IHJhbmdlID0gbmV3IFJhbmdlKFxuICAgICAgICAgIFtkaWFnbm9zdGljLnJvdywgZGlhZ25vc3RpYy5jb2xdLFxuICAgICAgICAgIFtkaWFnbm9zdGljLnJvdywgdGV4dEVkaXRvci5nZXRCdWZmZXIoKS5saW5lTGVuZ3RoRm9yUm93KGRpYWdub3N0aWMucm93KV1cbiAgICAgICAgKTtcbiAgICAgICAgbGV0IHRleHQ7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRpYWdub3N0aWMudGV4dCkpIHtcbiAgICAgICAgICAvLyBTb21ldGltZXMgYGFyYyBsaW50YCByZXR1cm5zIGFuIGFycmF5IG9mIHN0cmluZ3MgZm9yIHRoZSB0ZXh0LCByYXRoZXIgdGhhbiBqdXN0IGFcbiAgICAgICAgICAvLyBzdHJpbmcgOiguXG4gICAgICAgICAgdGV4dCA9IGRpYWdub3N0aWMudGV4dC5qb2luKCcgJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGV4dCA9IGRpYWdub3N0aWMudGV4dDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXliZVByb3BlcnRpZXMgPSB7fTtcbiAgICAgICAgaWYgKGRpYWdub3N0aWMub3JpZ2luYWwgIT0gbnVsbCAmJiBkaWFnbm9zdGljLnJlcGxhY2VtZW50ICE9IG51bGwpIHtcbiAgICAgICAgICBtYXliZVByb3BlcnRpZXMuZml4ID0ge1xuICAgICAgICAgICAgb2xkUmFuZ2U6IG5ldyBSYW5nZShcbiAgICAgICAgICAgICAgW2RpYWdub3N0aWMucm93LCBkaWFnbm9zdGljLmNvbF0sXG4gICAgICAgICAgICAgIFtkaWFnbm9zdGljLnJvdywgZGlhZ25vc3RpYy5jb2wgKyBkaWFnbm9zdGljLm9yaWdpbmFsLmxlbmd0aF0sXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgbmV3VGV4dDogZGlhZ25vc3RpYy5yZXBsYWNlbWVudCxcbiAgICAgICAgICAgIG9sZFRleHQ6IGRpYWdub3N0aWMub3JpZ2luYWwsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICAgICAgcHJvdmlkZXJOYW1lOiAnQXJjJyArIChkaWFnbm9zdGljLmNvZGUgPyBgOiAke2RpYWdub3N0aWMuY29kZX1gIDogJycpLFxuICAgICAgICAgIHR5cGU6IGRpYWdub3N0aWMudHlwZSxcbiAgICAgICAgICB0ZXh0LFxuICAgICAgICAgIGZpbGVQYXRoOiBkaWFnbm9zdGljLmZpbGVQYXRoLFxuICAgICAgICAgIHJhbmdlLFxuICAgICAgICAgIC4uLm1heWJlUHJvcGVydGllcyxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgICAgY29uc3QgZGlhZ25vc3RpY3NVcGRhdGUgPSB7XG4gICAgICAgIGZpbGVQYXRoVG9NZXNzYWdlczogbmV3IE1hcChbW2ZpbGVQYXRoLCBmaWxlRGlhZ25vc3RpY3NdXSksXG4gICAgICB9O1xuICAgICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlVXBkYXRlKGRpYWdub3N0aWNzVXBkYXRlKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbG9nZ2luZycpLmdldExvZ2dlcigpO1xuICAgICAgbG9nZ2VyLmVycm9yKGVycm9yKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBfcmVjZWl2ZWROZXdVcGRhdGVTdWJzY3JpYmVyKCk6IHZvaWQge1xuICAgIGNvbnN0IGFjdGl2ZVRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgaWYgKGFjdGl2ZVRleHRFZGl0b3IpIHtcbiAgICAgIHRoaXMuX3J1bkxpbnRXaXRoQnVzeU1lc3NhZ2UoYWN0aXZlVGV4dEVkaXRvcik7XG4gICAgfVxuICB9XG5cbiAgb25NZXNzYWdlVXBkYXRlKGNhbGxiYWNrOiBNZXNzYWdlVXBkYXRlQ2FsbGJhY2spOiBhdG9tJERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9wcm92aWRlckJhc2Uub25NZXNzYWdlVXBkYXRlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjazogTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrKTogYXRvbSREaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvdmlkZXJCYXNlLm9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjayk7XG4gIH1cblxuICBfZ2V0T3BlbkJ1ZmZlckNvdW50KHBhdGg6IHN0cmluZyk6IG51bWJlciB7XG4gICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKClcbiAgICAgIC5maWx0ZXIoZWRpdG9yID0+IGVkaXRvci5nZXRQYXRoKCkgPT09IHBhdGgpXG4gICAgICAubGVuZ3RoO1xuICB9XG59XG4iXX0=