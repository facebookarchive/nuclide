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

var _nuclideDiagnosticsProviderBase = require('../../nuclide-diagnostics-provider-base');

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _nuclideCommons = require('../../nuclide-commons');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var RequestSerializer = _nuclideCommons.promises.RequestSerializer;

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
    this._providerBase = new _nuclideDiagnosticsProviderBase.DiagnosticsProviderBase(baseOptions);
    this._requestSerializer = new RequestSerializer();
    this._subscriptions.add((0, _nuclideAtomHelpers.onWillDestroyTextBuffer)(function (buffer) {
      var path = buffer.getPath();
      if (!path) {
        return;
      }
      _this._providerBase.publishMessageInvalidation({ scope: 'file', filePaths: [path] });
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
    decorators: [(0, _nuclideAnalytics.trackTiming)('nuclide-arcanist:lint')],
    value: _asyncToGenerator(function* (textEditor) {
      var _this3 = this;

      var filePath = textEditor.getPath();
      (0, _assert2['default'])(filePath);
      try {
        var blacklistedLinters = _nuclideFeatureConfig2['default'].get('nuclide-arcanist.blacklistedLinters');
        var result = yield this._requestSerializer.run(require('../../nuclide-arcanist-client').findDiagnostics([filePath], blacklistedLinters));
        if (result.status === 'outdated') {
          return;
        }
        var diagnostics = result.result;
        var fileDiagnostics = diagnostics.map(function (diagnostic) {
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
          if (diagnostic.original != null && diagnostic.replacement != null &&
          // Sometimes linters set original and replacement to the same value. Obviously that won't
          // fix anything.
          diagnostic.original !== diagnostic.replacement) {
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
        this._providerBase.publishMessageUpdate(diagnosticsUpdate);
      } catch (error) {
        var logger = require('../../nuclide-logging').getLogger();
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
  }]);

  return ArcanistDiagnosticsProvider;
})();

exports.ArcanistDiagnosticsProvider = ArcanistDiagnosticsProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFyY2FuaXN0RGlhZ25vc3RpY3NQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWtCeUMsTUFBTTs7OENBQ1QseUNBQXlDOztvQ0FFckQsOEJBQThCOzs7O2dDQUM5Qix5QkFBeUI7O2tDQUNiLDRCQUE0Qjs7OEJBQzNDLHVCQUF1Qjs7c0JBQ3hCLFFBQVE7Ozs7SUFFdkIsaUJBQWlCLDRCQUFqQixpQkFBaUI7O0lBRVgsMkJBQTJCO0FBTTNCLFdBTkEsMkJBQTJCLENBTTFCLGtCQUEwQyxFQUFFOzs7MEJBTjdDLDJCQUEyQjs7QUFPcEMsUUFBSSxDQUFDLG1CQUFtQixHQUFHLGtCQUFrQixDQUFDO0FBQzlDLFFBQUksQ0FBQyxjQUFjLEdBQUcsK0JBQXlCLENBQUM7QUFDaEQsUUFBTSxXQUFXLEdBQUc7QUFDbEIsMEJBQW9CLEVBQUUsSUFBSTtBQUMxQix1QkFBaUIsRUFBRSxLQUFLO0FBQ3hCLHVCQUFpQixFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQzFELDJCQUFxQixFQUFFLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQ3BFLENBQUM7QUFDRixRQUFJLENBQUMsYUFBYSxHQUFHLDREQUE0QixXQUFXLENBQUMsQ0FBQztBQUM5RCxRQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO0FBQ2xELFFBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLGlEQUF3QixVQUFBLE1BQU0sRUFBSTtBQUN4RCxVQUFNLElBQWEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdkMsVUFBSSxDQUFDLElBQUksRUFBRTtBQUNULGVBQU87T0FDUjtBQUNELFlBQUssYUFBYSxDQUFDLDBCQUEwQixDQUFDLEVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMs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TUFBTSxDQUFDLENBQUMsQ0FBQztLQUMxRDs7O1dBRTJCLHdDQUFTO0FBQ25DLFVBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzlELFVBQUksZ0JBQWdCLEVBQUU7QUFDcEIsWUFBSSxDQUFDLHVCQUF1QixDQUFDLGdCQUFnQixDQUFDLENBQUM7T0FDaEQ7S0FDRjs7O1dBRWMseUJBQUMsUUFBK0IsRUFBZTtBQUM1RCxhQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3JEOzs7V0FFb0IsK0JBQUMsUUFBcUMsRUFBZTtBQUN4RSxhQUFPLElBQUksQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDM0Q7OztTQXpJVSwyQkFBMkIiLCJmaWxlIjoiQXJjYW5pc3REaWFnbm9zdGljc1Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0J1c3lTaWduYWxQcm92aWRlckJhc2V9IGZyb20gJy4uLy4uL251Y2xpZGUtYnVzeS1zaWduYWwtcHJvdmlkZXItYmFzZSc7XG5cbmltcG9ydCB0eXBlIHtcbiAgTWVzc2FnZVVwZGF0ZUNhbGxiYWNrLFxuICBNZXNzYWdlSW52YWxpZGF0aW9uQ2FsbGJhY2ssXG59IGZyb20gJy4uLy4uL251Y2xpZGUtZGlhZ25vc3RpY3MtYmFzZSc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgUmFuZ2V9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kaWFnbm9zdGljcy1wcm92aWRlci1iYXNlJztcblxuaW1wb3J0IGZlYXR1cmVDb25maWcgZnJvbSAnLi4vLi4vbnVjbGlkZS1mZWF0dXJlLWNvbmZpZyc7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5pbXBvcnQge29uV2lsbERlc3Ryb3lUZXh0QnVmZmVyfSBmcm9tICcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycyc7XG5pbXBvcnQge3Byb21pc2VzfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCB7UmVxdWVzdFNlcmlhbGl6ZXJ9ID0gcHJvbWlzZXM7XG5cbmV4cG9ydCBjbGFzcyBBcmNhbmlzdERpYWdub3N0aWNzUHJvdmlkZXIge1xuICBfcHJvdmlkZXJCYXNlOiBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZTtcbiAgX3JlcXVlc3RTZXJpYWxpemVyOiBSZXF1ZXN0U2VyaWFsaXplcjtcbiAgX3N1YnNjcmlwdGlvbnM6IGF0b20kQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2J1c3lTaWduYWxQcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyQmFzZTtcblxuICBjb25zdHJ1Y3RvcihidXN5U2lnbmFsUHJvdmlkZXI6IEJ1c3lTaWduYWxQcm92aWRlckJhc2UpIHtcbiAgICB0aGlzLl9idXN5U2lnbmFsUHJvdmlkZXIgPSBidXN5U2lnbmFsUHJvdmlkZXI7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgY29uc3QgYmFzZU9wdGlvbnMgPSB7XG4gICAgICBlbmFibGVGb3JBbGxHcmFtbWFyczogdHJ1ZSxcbiAgICAgIHNob3VsZFJ1bk9uVGhlRmx5OiBmYWxzZSxcbiAgICAgIG9uVGV4dEVkaXRvckV2ZW50OiB0aGlzLl9ydW5MaW50V2l0aEJ1c3lNZXNzYWdlLmJpbmQodGhpcyksXG4gICAgICBvbk5ld1VwZGF0ZVN1YnNjcmliZXI6IHRoaXMuX3JlY2VpdmVkTmV3VXBkYXRlU3Vic2NyaWJlci5iaW5kKHRoaXMpLFxuICAgIH07XG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlID0gbmV3IERpYWdub3N0aWNzUHJvdmlkZXJCYXNlKGJhc2VPcHRpb25zKTtcbiAgICB0aGlzLl9yZXF1ZXN0U2VyaWFsaXplciA9IG5ldyBSZXF1ZXN0U2VyaWFsaXplcigpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKG9uV2lsbERlc3Ryb3lUZXh0QnVmZmVyKGJ1ZmZlciA9PiB7XG4gICAgICBjb25zdCBwYXRoOiA/c3RyaW5nID0gYnVmZmVyLmdldFBhdGgoKTtcbiAgICAgIGlmICghcGF0aCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl9wcm92aWRlckJhc2UucHVibGlzaE1lc3NhZ2VJbnZhbGlkYXRpb24oe3Njb3BlOiAnZmlsZScsIGZpbGVQYXRoczogW3BhdGhdfSk7XG4gICAgfSkpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKiBUaGUgcmV0dXJuZWQgUHJvbWlzZSB3aWxsIHJlc29sdmUgd2hlbiByZXN1bHRzIGhhdmUgYmVlbiBwdWJsaXNoZWQuICovXG4gIF9ydW5MaW50V2l0aEJ1c3lNZXNzYWdlKHRleHRFZGl0b3I6IFRleHRFZGl0b3IpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgaWYgKHBhdGggPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fYnVzeVNpZ25hbFByb3ZpZGVyLnJlcG9ydEJ1c3koXG4gICAgICBgV2FpdGluZyBmb3IgYXJjIGxpbnQgcmVzdWx0cyBmb3IgXFxgJHt0ZXh0RWRpdG9yLmdldFRpdGxlKCl9XFxgYCxcbiAgICAgICgpID0+IHRoaXMuX3J1bkxpbnQodGV4dEVkaXRvciksXG4gICAgICB7IG9ubHlGb3JGaWxlOiBwYXRoIH0sXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBEbyBub3QgY2FsbCB0aGlzIGRpcmVjdGx5IC0tIGNhbGwgX3J1bkxpbnRXaXRoQnVzeU1lc3NhZ2UgKi9cbiAgQHRyYWNrVGltaW5nKCdudWNsaWRlLWFyY2FuaXN0OmxpbnQnKVxuICBhc3luYyBfcnVuTGludCh0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZmlsZVBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICBpbnZhcmlhbnQoZmlsZVBhdGgpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBibGFja2xpc3RlZExpbnRlcnM6IEFycmF5PHN0cmluZz4gPVxuICAgICAgICAoZmVhdHVyZUNvbmZpZy5nZXQoJ251Y2xpZGUtYXJjYW5pc3QuYmxhY2tsaXN0ZWRMaW50ZXJzJyk6IGFueSk7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9yZXF1ZXN0U2VyaWFsaXplci5ydW4oXG4gICAgICAgIHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtYXJjYW5pc3QtY2xpZW50JykuZmluZERpYWdub3N0aWNzKFtmaWxlUGF0aF0sIGJsYWNrbGlzdGVkTGludGVycylcbiAgICAgICk7XG4gICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ291dGRhdGVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBkaWFnbm9zdGljcyA9IHJlc3VsdC5yZXN1bHQ7XG4gICAgICBjb25zdCBmaWxlRGlhZ25vc3RpY3MgPSBkaWFnbm9zdGljcy5tYXAoZGlhZ25vc3RpYyA9PiB7XG4gICAgICAgIGNvbnN0IHJhbmdlID0gbmV3IFJhbmdlKFxuICAgICAgICAgIFtkaWFnbm9zdGljLnJvdywgZGlhZ25vc3RpYy5jb2xdLFxuICAgICAgICAgIFtkaWFnbm9zdGljLnJvdywgdGV4dEVkaXRvci5nZXRCdWZmZXIoKS5saW5lTGVuZ3RoRm9yUm93KGRpYWdub3N0aWMucm93KV1cbiAgICAgICAgKTtcbiAgICAgICAgbGV0IHRleHQ7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRpYWdub3N0aWMudGV4dCkpIHtcbiAgICAgICAgICAvLyBTb21ldGltZXMgYGFyYyBsaW50YCByZXR1cm5zIGFuIGFycmF5IG9mIHN0cmluZ3MgZm9yIHRoZSB0ZXh0LCByYXRoZXIgdGhhbiBqdXN0IGFcbiAgICAgICAgICAvLyBzdHJpbmcgOiguXG4gICAgICAgICAgdGV4dCA9IGRpYWdub3N0aWMudGV4dC5qb2luKCcgJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGV4dCA9IGRpYWdub3N0aWMudGV4dDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXliZVByb3BlcnRpZXMgPSB7fTtcbiAgICAgICAgaWYgKGRpYWdub3N0aWMub3JpZ2luYWwgIT0gbnVsbCAmJlxuICAgICAgICAgIGRpYWdub3N0aWMucmVwbGFjZW1lbnQgIT0gbnVsbCAmJlxuICAgICAgICAgIC8vIFNvbWV0aW1lcyBsaW50ZXJzIHNldCBvcmlnaW5hbCBhbmQgcmVwbGFjZW1lbnQgdG8gdGhlIHNhbWUgdmFsdWUuIE9idmlvdXNseSB0aGF0IHdvbid0XG4gICAgICAgICAgLy8gZml4IGFueXRoaW5nLlxuICAgICAgICAgIGRpYWdub3N0aWMub3JpZ2luYWwgIT09IGRpYWdub3N0aWMucmVwbGFjZW1lbnRcbiAgICAgICAgKSB7XG4gICAgICAgICAgbWF5YmVQcm9wZXJ0aWVzLmZpeCA9IHtcbiAgICAgICAgICAgIG9sZFJhbmdlOiB0aGlzLl9nZXRSYW5nZUZvckZpeChkaWFnbm9zdGljLnJvdywgZGlhZ25vc3RpYy5jb2wsIGRpYWdub3N0aWMub3JpZ2luYWwpLFxuICAgICAgICAgICAgbmV3VGV4dDogZGlhZ25vc3RpYy5yZXBsYWNlbWVudCxcbiAgICAgICAgICAgIG9sZFRleHQ6IGRpYWdub3N0aWMub3JpZ2luYWwsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICAgICAgcHJvdmlkZXJOYW1lOiAnQXJjJyArIChkaWFnbm9zdGljLmNvZGUgPyBgOiAke2RpYWdub3N0aWMuY29kZX1gIDogJycpLFxuICAgICAgICAgIHR5cGU6IGRpYWdub3N0aWMudHlwZSxcbiAgICAgICAgICB0ZXh0LFxuICAgICAgICAgIGZpbGVQYXRoOiBkaWFnbm9zdGljLmZpbGVQYXRoLFxuICAgICAgICAgIHJhbmdlLFxuICAgICAgICAgIC4uLm1heWJlUHJvcGVydGllcyxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgICAgY29uc3QgZGlhZ25vc3RpY3NVcGRhdGUgPSB7XG4gICAgICAgIGZpbGVQYXRoVG9NZXNzYWdlczogbmV3IE1hcChbW2ZpbGVQYXRoLCBmaWxlRGlhZ25vc3RpY3NdXSksXG4gICAgICB9O1xuICAgICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlVXBkYXRlKGRpYWdub3N0aWNzVXBkYXRlKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG4gICAgICBsb2dnZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRSYW5nZUZvckZpeChzdGFydFJvdzogbnVtYmVyLCBzdGFydENvbDogbnVtYmVyLCBvcmlnaW5hbFRleHQ6IHN0cmluZyk6IGF0b20kUmFuZ2Uge1xuICAgIGxldCBuZXdsaW5lQ291bnQgPSAwO1xuICAgIGZvciAoY29uc3QgY2hhciBvZiBvcmlnaW5hbFRleHQpIHtcbiAgICAgIGlmIChjaGFyID09PSAnXFxuJykge1xuICAgICAgICBuZXdsaW5lQ291bnQrKztcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZW5kUm93ID0gc3RhcnRSb3cgKyBuZXdsaW5lQ291bnQ7XG4gICAgY29uc3QgbGFzdE5ld2xpbmVJbmRleCA9IG9yaWdpbmFsVGV4dC5sYXN0SW5kZXhPZignXFxuJyk7XG4gICAgbGV0IGVuZENvbDtcbiAgICBpZiAobGFzdE5ld2xpbmVJbmRleCA9PT0gLTEpIHtcbiAgICAgIGVuZENvbCA9IHN0YXJ0Q29sICsgb3JpZ2luYWxUZXh0Lmxlbmd0aDtcbiAgICB9IGVsc2Uge1xuICAgICAgZW5kQ29sID0gb3JpZ2luYWxUZXh0Lmxlbmd0aCAtIGxhc3ROZXdsaW5lSW5kZXggLSAxO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUmFuZ2UoW3N0YXJ0Um93LCBzdGFydENvbF0sIFtlbmRSb3csIGVuZENvbF0pO1xuICB9XG5cbiAgX3JlY2VpdmVkTmV3VXBkYXRlU3Vic2NyaWJlcigpOiB2b2lkIHtcbiAgICBjb25zdCBhY3RpdmVUZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmIChhY3RpdmVUZXh0RWRpdG9yKSB7XG4gICAgICB0aGlzLl9ydW5MaW50V2l0aEJ1c3lNZXNzYWdlKGFjdGl2ZVRleHRFZGl0b3IpO1xuICAgIH1cbiAgfVxuXG4gIG9uTWVzc2FnZVVwZGF0ZShjYWxsYmFjazogTWVzc2FnZVVwZGF0ZUNhbGxiYWNrKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9wcm92aWRlckJhc2Uub25NZXNzYWdlVXBkYXRlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjazogTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9wcm92aWRlckJhc2Uub25NZXNzYWdlSW52YWxpZGF0aW9uKGNhbGxiYWNrKTtcbiAgfVxufVxuIl19