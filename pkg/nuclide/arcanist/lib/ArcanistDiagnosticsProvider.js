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
    this._subscriptions.add((0, _atomHelpers.onWillDestroyTextBuffer)(function (buffer) {
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
    decorators: [(0, _analytics.trackTiming)('nuclide-arcanist:lint')],
    value: _asyncToGenerator(function* (textEditor) {
      var _this3 = this;

      var filePath = textEditor.getPath();
      (0, _assert2['default'])(filePath);
      try {
        var blacklistedLinters = _featureConfig2['default'].get('nuclide-arcanist.blacklistedLinters');
        var result = yield this._requestSerializer.run(require('../../arcanist-client').findDiagnostics([filePath], blacklistedLinters));
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
        this._providerBase.publishMessageUpdate(diagnosticsUpdate);
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
  }]);

  return ArcanistDiagnosticsProvider;
})();

exports.ArcanistDiagnosticsProvider = ArcanistDiagnosticsProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFyY2FuaXN0RGlhZ25vc3RpY3NQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWtCeUMsTUFBTTs7dUNBQ1QsaUNBQWlDOzs2QkFFN0Msc0JBQXNCOzs7O3lCQUN0QixpQkFBaUI7OzJCQUNMLG9CQUFvQjs7dUJBQ25DLGVBQWU7O3NCQUNoQixRQUFROzs7O0lBRXZCLGlCQUFpQixxQkFBakIsaUJBQWlCOztJQUVYLDJCQUEyQjtBQU0zQixXQU5BLDJCQUEyQixDQU0xQixrQkFBMEMsRUFBRTs7OzBCQU43QywyQkFBMkI7O0FBT3BDLFFBQUksQ0FBQyxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQztBQUM5QyxRQUFJLENBQUMsY0FBYyxHQUFHLCtCQUF5QixDQUFDO0FBQ2hELFFBQU0sV0FBVyxHQUFHO0FBQ2xCLDBCQUFvQixFQUFFLElBQUk7QUFDMUIsdUJBQWlCLEVBQUUsS0FBSztBQUN4Qix1QkFBaUIsRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUMxRCwyQkFBcUIsRUFBRSxJQUFJLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztLQUNwRSxDQUFDO0FBQ0YsUUFBSSxDQUFDLGFBQWEsR0FBRyxxREFBNEIsV0FBVyxDQUFDLENBQUM7QUFDOUQsUUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksaUJBQWlCLEVBQUUsQ0FBQztBQUNsRCxRQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQywwQ0FBd0IsVUFBQSxNQUFNLEVBQUk7QUFDeEQsVUFBTSxJQUFhLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3ZDLFVBQUksQ0FBQyxJQUFJLEVBQUU7QUFDVCxlQUFPO09BQ1I7QUFDRCxZQUFLLGFBQWEsQ0FBQywwQkFBMEIsQ0FBQyxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLEVB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TSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDOUQsVUFBSSxnQkFBZ0IsRUFBRTtBQUNwQixZQUFJLENBQUMsdUJBQXVCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztPQUNoRDtLQUNGOzs7V0FFYyx5QkFBQyxRQUErQixFQUFlO0FBQzVELGFBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDckQ7OztXQUVvQiwrQkFBQyxRQUFxQyxFQUFlO0FBQ3hFLGFBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUMzRDs7O1NBcElVLDJCQUEyQiIsImZpbGUiOiJBcmNhbmlzdERpYWdub3N0aWNzUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7QnVzeVNpZ25hbFByb3ZpZGVyQmFzZX0gZnJvbSAnLi4vLi4vYnVzeS1zaWduYWwtcHJvdmlkZXItYmFzZSc7XG5cbmltcG9ydCB0eXBlIHtcbiAgTWVzc2FnZVVwZGF0ZUNhbGxiYWNrLFxuICBNZXNzYWdlSW52YWxpZGF0aW9uQ2FsbGJhY2ssXG59IGZyb20gJy4uLy4uL2RpYWdub3N0aWNzL2Jhc2UnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIFJhbmdlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7RGlhZ25vc3RpY3NQcm92aWRlckJhc2V9IGZyb20gJy4uLy4uL2RpYWdub3N0aWNzL3Byb3ZpZGVyLWJhc2UnO1xuXG5pbXBvcnQgZmVhdHVyZUNvbmZpZyBmcm9tICcuLi8uLi9mZWF0dXJlLWNvbmZpZyc7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IHtvbldpbGxEZXN0cm95VGV4dEJ1ZmZlcn0gZnJvbSAnLi4vLi4vYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7cHJvbWlzZXN9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCB7UmVxdWVzdFNlcmlhbGl6ZXJ9ID0gcHJvbWlzZXM7XG5cbmV4cG9ydCBjbGFzcyBBcmNhbmlzdERpYWdub3N0aWNzUHJvdmlkZXIge1xuICBfcHJvdmlkZXJCYXNlOiBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZTtcbiAgX3JlcXVlc3RTZXJpYWxpemVyOiBSZXF1ZXN0U2VyaWFsaXplcjtcbiAgX3N1YnNjcmlwdGlvbnM6IGF0b20kQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2J1c3lTaWduYWxQcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyQmFzZTtcblxuICBjb25zdHJ1Y3RvcihidXN5U2lnbmFsUHJvdmlkZXI6IEJ1c3lTaWduYWxQcm92aWRlckJhc2UpIHtcbiAgICB0aGlzLl9idXN5U2lnbmFsUHJvdmlkZXIgPSBidXN5U2lnbmFsUHJvdmlkZXI7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgY29uc3QgYmFzZU9wdGlvbnMgPSB7XG4gICAgICBlbmFibGVGb3JBbGxHcmFtbWFyczogdHJ1ZSxcbiAgICAgIHNob3VsZFJ1bk9uVGhlRmx5OiBmYWxzZSxcbiAgICAgIG9uVGV4dEVkaXRvckV2ZW50OiB0aGlzLl9ydW5MaW50V2l0aEJ1c3lNZXNzYWdlLmJpbmQodGhpcyksXG4gICAgICBvbk5ld1VwZGF0ZVN1YnNjcmliZXI6IHRoaXMuX3JlY2VpdmVkTmV3VXBkYXRlU3Vic2NyaWJlci5iaW5kKHRoaXMpLFxuICAgIH07XG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlID0gbmV3IERpYWdub3N0aWNzUHJvdmlkZXJCYXNlKGJhc2VPcHRpb25zKTtcbiAgICB0aGlzLl9yZXF1ZXN0U2VyaWFsaXplciA9IG5ldyBSZXF1ZXN0U2VyaWFsaXplcigpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKG9uV2lsbERlc3Ryb3lUZXh0QnVmZmVyKGJ1ZmZlciA9PiB7XG4gICAgICBjb25zdCBwYXRoOiA/c3RyaW5nID0gYnVmZmVyLmdldFBhdGgoKTtcbiAgICAgIGlmICghcGF0aCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl9wcm92aWRlckJhc2UucHVibGlzaE1lc3NhZ2VJbnZhbGlkYXRpb24oe3Njb3BlOiAnZmlsZScsIGZpbGVQYXRoczogW3BhdGhdfSk7XG4gICAgfSkpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKiBUaGUgcmV0dXJuZWQgUHJvbWlzZSB3aWxsIHJlc29sdmUgd2hlbiByZXN1bHRzIGhhdmUgYmVlbiBwdWJsaXNoZWQuICovXG4gIF9ydW5MaW50V2l0aEJ1c3lNZXNzYWdlKHRleHRFZGl0b3I6IFRleHRFZGl0b3IpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgaWYgKHBhdGggPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fYnVzeVNpZ25hbFByb3ZpZGVyLnJlcG9ydEJ1c3koXG4gICAgICBgV2FpdGluZyBmb3IgYXJjIGxpbnQgcmVzdWx0cyBmb3IgXFxgJHt0ZXh0RWRpdG9yLmdldFRpdGxlKCl9XFxgYCxcbiAgICAgICgpID0+IHRoaXMuX3J1bkxpbnQodGV4dEVkaXRvciksXG4gICAgICB7IG9ubHlGb3JGaWxlOiBwYXRoIH0sXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBEbyBub3QgY2FsbCB0aGlzIGRpcmVjdGx5IC0tIGNhbGwgX3J1bkxpbnRXaXRoQnVzeU1lc3NhZ2UgKi9cbiAgQHRyYWNrVGltaW5nKCdudWNsaWRlLWFyY2FuaXN0OmxpbnQnKVxuICBhc3luYyBfcnVuTGludCh0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZmlsZVBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICBpbnZhcmlhbnQoZmlsZVBhdGgpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBibGFja2xpc3RlZExpbnRlcnM6IEFycmF5PHN0cmluZz4gPVxuICAgICAgICAoZmVhdHVyZUNvbmZpZy5nZXQoJ251Y2xpZGUtYXJjYW5pc3QuYmxhY2tsaXN0ZWRMaW50ZXJzJyk6IGFueSk7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9yZXF1ZXN0U2VyaWFsaXplci5ydW4oXG4gICAgICAgIHJlcXVpcmUoJy4uLy4uL2FyY2FuaXN0LWNsaWVudCcpLmZpbmREaWFnbm9zdGljcyhbZmlsZVBhdGhdLCBibGFja2xpc3RlZExpbnRlcnMpXG4gICAgICApO1xuICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09ICdvdXRkYXRlZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgZGlhZ25vc3RpY3MgPSByZXN1bHQucmVzdWx0O1xuICAgICAgY29uc3QgZmlsZURpYWdub3N0aWNzID0gZGlhZ25vc3RpY3MubWFwKGRpYWdub3N0aWMgPT4ge1xuICAgICAgICBjb25zdCByYW5nZSA9IG5ldyBSYW5nZShcbiAgICAgICAgICBbZGlhZ25vc3RpYy5yb3csIGRpYWdub3N0aWMuY29sXSxcbiAgICAgICAgICBbZGlhZ25vc3RpYy5yb3csIHRleHRFZGl0b3IuZ2V0QnVmZmVyKCkubGluZUxlbmd0aEZvclJvdyhkaWFnbm9zdGljLnJvdyldXG4gICAgICAgICk7XG4gICAgICAgIGxldCB0ZXh0O1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkaWFnbm9zdGljLnRleHQpKSB7XG4gICAgICAgICAgLy8gU29tZXRpbWVzIGBhcmMgbGludGAgcmV0dXJucyBhbiBhcnJheSBvZiBzdHJpbmdzIGZvciB0aGUgdGV4dCwgcmF0aGVyIHRoYW4ganVzdCBhXG4gICAgICAgICAgLy8gc3RyaW5nIDooLlxuICAgICAgICAgIHRleHQgPSBkaWFnbm9zdGljLnRleHQuam9pbignICcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRleHQgPSBkaWFnbm9zdGljLnRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF5YmVQcm9wZXJ0aWVzID0ge307XG4gICAgICAgIGlmIChkaWFnbm9zdGljLm9yaWdpbmFsICE9IG51bGwgJiYgZGlhZ25vc3RpYy5yZXBsYWNlbWVudCAhPSBudWxsKSB7XG4gICAgICAgICAgbWF5YmVQcm9wZXJ0aWVzLmZpeCA9IHtcbiAgICAgICAgICAgIG9sZFJhbmdlOiB0aGlzLl9nZXRSYW5nZUZvckZpeChkaWFnbm9zdGljLnJvdywgZGlhZ25vc3RpYy5jb2wsIGRpYWdub3N0aWMub3JpZ2luYWwpLFxuICAgICAgICAgICAgbmV3VGV4dDogZGlhZ25vc3RpYy5yZXBsYWNlbWVudCxcbiAgICAgICAgICAgIG9sZFRleHQ6IGRpYWdub3N0aWMub3JpZ2luYWwsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICAgICAgcHJvdmlkZXJOYW1lOiAnQXJjJyArIChkaWFnbm9zdGljLmNvZGUgPyBgOiAke2RpYWdub3N0aWMuY29kZX1gIDogJycpLFxuICAgICAgICAgIHR5cGU6IGRpYWdub3N0aWMudHlwZSxcbiAgICAgICAgICB0ZXh0LFxuICAgICAgICAgIGZpbGVQYXRoOiBkaWFnbm9zdGljLmZpbGVQYXRoLFxuICAgICAgICAgIHJhbmdlLFxuICAgICAgICAgIC4uLm1heWJlUHJvcGVydGllcyxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgICAgY29uc3QgZGlhZ25vc3RpY3NVcGRhdGUgPSB7XG4gICAgICAgIGZpbGVQYXRoVG9NZXNzYWdlczogbmV3IE1hcChbW2ZpbGVQYXRoLCBmaWxlRGlhZ25vc3RpY3NdXSksXG4gICAgICB9O1xuICAgICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlVXBkYXRlKGRpYWdub3N0aWNzVXBkYXRlKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbG9nZ2luZycpLmdldExvZ2dlcigpO1xuICAgICAgbG9nZ2VyLmVycm9yKGVycm9yKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBfZ2V0UmFuZ2VGb3JGaXgoc3RhcnRSb3c6IG51bWJlciwgc3RhcnRDb2w6IG51bWJlciwgb3JpZ2luYWxUZXh0OiBzdHJpbmcpOiBhdG9tJFJhbmdlIHtcbiAgICBsZXQgbmV3bGluZUNvdW50ID0gMDtcbiAgICBmb3IgKGNvbnN0IGNoYXIgb2Ygb3JpZ2luYWxUZXh0KSB7XG4gICAgICBpZiAoY2hhciA9PT0gJ1xcbicpIHtcbiAgICAgICAgbmV3bGluZUNvdW50Kys7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGVuZFJvdyA9IHN0YXJ0Um93ICsgbmV3bGluZUNvdW50O1xuICAgIGNvbnN0IGxhc3ROZXdsaW5lSW5kZXggPSBvcmlnaW5hbFRleHQubGFzdEluZGV4T2YoJ1xcbicpO1xuICAgIGxldCBlbmRDb2w7XG4gICAgaWYgKGxhc3ROZXdsaW5lSW5kZXggPT09IC0xKSB7XG4gICAgICBlbmRDb2wgPSBzdGFydENvbCArIG9yaWdpbmFsVGV4dC5sZW5ndGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVuZENvbCA9IG9yaWdpbmFsVGV4dC5sZW5ndGggLSBsYXN0TmV3bGluZUluZGV4IC0gMTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJhbmdlKFtzdGFydFJvdywgc3RhcnRDb2xdLCBbZW5kUm93LCBlbmRDb2xdKTtcbiAgfVxuXG4gIF9yZWNlaXZlZE5ld1VwZGF0ZVN1YnNjcmliZXIoKTogdm9pZCB7XG4gICAgY29uc3QgYWN0aXZlVGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoYWN0aXZlVGV4dEVkaXRvcikge1xuICAgICAgdGhpcy5fcnVuTGludFdpdGhCdXN5TWVzc2FnZShhY3RpdmVUZXh0RWRpdG9yKTtcbiAgICB9XG4gIH1cblxuICBvbk1lc3NhZ2VVcGRhdGUoY2FsbGJhY2s6IE1lc3NhZ2VVcGRhdGVDYWxsYmFjayk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvdmlkZXJCYXNlLm9uTWVzc2FnZVVwZGF0ZShjYWxsYmFjayk7XG4gIH1cblxuICBvbk1lc3NhZ2VJbnZhbGlkYXRpb24oY2FsbGJhY2s6IE1lc3NhZ2VJbnZhbGlkYXRpb25DYWxsYmFjayk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvdmlkZXJCYXNlLm9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjayk7XG4gIH1cbn1cbiJdfQ==