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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFyY2FuaXN0RGlhZ25vc3RpY3NQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWtCeUMsTUFBTTs7OENBQ1QseUNBQXlDOztvQ0FFckQsOEJBQThCOzs7O2dDQUM5Qix5QkFBeUI7O2tDQUNiLDRCQUE0Qjs7OEJBQzNDLHVCQUF1Qjs7c0JBQ3hCLFFBQVE7Ozs7SUFFdkIsaUJBQWlCLDRCQUFqQixpQkFBaUI7O0lBRVgsMkJBQTJCO0FBTTNCLFdBTkEsMkJBQTJCLENBTTFCLGtCQUEwQyxFQUFFOzs7MEJBTjdDLDJCQUEyQjs7QUFPcEMsUUFBSSxDQUFDLG1CQUFtQixHQUFHLGtCQUFrQixDQUFDO0FBQzlDLFFBQUksQ0FBQyxjQUFjLEdBQUcsK0JBQXlCLENBQUM7QUFDaEQsUUFBTSxXQUFXLEdBQUc7QUFDbEIsMEJBQW9CLEVBQUUsSUFBSTtBQUMxQix1QkFBaUIsRUFBRSxLQUFLO0FBQ3hCLHVCQUFpQixFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQzFELDJCQUFxQixFQUFFLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQ3BFLENBQUM7QUFDRixRQUFJLENBQUMsYUFBYSxHQUFHLDREQUE0QixXQUFXLENBQUMsQ0FBQztBQUM5RCxRQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO0FBQ2xELFFBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLGlEQUF3QixVQUFBLE1BQU0sRUFBSTtBQUN4RCxVQUFNLElBQWEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdkMsVUFBSSxDQUFDLElBQUksRUFBRTtBQUNULGVBQU87T0FDUjtBQUNELFlBQUssYUFBYSxDQUFDLDBCQUEwQixDQUFDLEVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMs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TUFBTSxDQUFDLENBQUMsQ0FBQztLQUMxRDs7O1dBRTJCLHdDQUFTO0FBQ25DLFVBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzlELFVBQUksZ0JBQWdCLEVBQUU7QUFDcEIsWUFBSSxDQUFDLHVCQUF1QixDQUFDLGdCQUFnQixDQUFDLENBQUM7T0FDaEQ7S0FDRjs7O1dBRWMseUJBQUMsUUFBK0IsRUFBZTtBQUM1RCxhQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3JEOzs7V0FFb0IsK0JBQUMsUUFBcUMsRUFBZTtBQUN4RSxhQUFPLElBQUksQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDM0Q7OztTQXpJVSwyQkFBMkIiLCJmaWxlIjoiQXJjYW5pc3REaWFnbm9zdGljc1Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0J1c3lTaWduYWxQcm92aWRlckJhc2V9IGZyb20gJy4uLy4uL251Y2xpZGUtYnVzeS1zaWduYWwnO1xuXG5pbXBvcnQgdHlwZSB7XG4gIE1lc3NhZ2VVcGRhdGVDYWxsYmFjayxcbiAgTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRpYWdub3N0aWNzLWJhc2UnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIFJhbmdlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7RGlhZ25vc3RpY3NQcm92aWRlckJhc2V9IGZyb20gJy4uLy4uL251Y2xpZGUtZGlhZ25vc3RpY3MtcHJvdmlkZXItYmFzZSc7XG5cbmltcG9ydCBmZWF0dXJlQ29uZmlnIGZyb20gJy4uLy4uL251Y2xpZGUtZmVhdHVyZS1jb25maWcnO1xuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuaW1wb3J0IHtvbldpbGxEZXN0cm95VGV4dEJ1ZmZlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1hdG9tLWhlbHBlcnMnO1xuaW1wb3J0IHtwcm9taXNlc30gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3Qge1JlcXVlc3RTZXJpYWxpemVyfSA9IHByb21pc2VzO1xuXG5leHBvcnQgY2xhc3MgQXJjYW5pc3REaWFnbm9zdGljc1Byb3ZpZGVyIHtcbiAgX3Byb3ZpZGVyQmFzZTogRGlhZ25vc3RpY3NQcm92aWRlckJhc2U7XG4gIF9yZXF1ZXN0U2VyaWFsaXplcjogUmVxdWVzdFNlcmlhbGl6ZXI7XG4gIF9zdWJzY3JpcHRpb25zOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9idXN5U2lnbmFsUHJvdmlkZXI6IEJ1c3lTaWduYWxQcm92aWRlckJhc2U7XG5cbiAgY29uc3RydWN0b3IoYnVzeVNpZ25hbFByb3ZpZGVyOiBCdXN5U2lnbmFsUHJvdmlkZXJCYXNlKSB7XG4gICAgdGhpcy5fYnVzeVNpZ25hbFByb3ZpZGVyID0gYnVzeVNpZ25hbFByb3ZpZGVyO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIGNvbnN0IGJhc2VPcHRpb25zID0ge1xuICAgICAgZW5hYmxlRm9yQWxsR3JhbW1hcnM6IHRydWUsXG4gICAgICBzaG91bGRSdW5PblRoZUZseTogZmFsc2UsXG4gICAgICBvblRleHRFZGl0b3JFdmVudDogdGhpcy5fcnVuTGludFdpdGhCdXN5TWVzc2FnZS5iaW5kKHRoaXMpLFxuICAgICAgb25OZXdVcGRhdGVTdWJzY3JpYmVyOiB0aGlzLl9yZWNlaXZlZE5ld1VwZGF0ZVN1YnNjcmliZXIuYmluZCh0aGlzKSxcbiAgICB9O1xuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZSA9IG5ldyBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZShiYXNlT3B0aW9ucyk7XG4gICAgdGhpcy5fcmVxdWVzdFNlcmlhbGl6ZXIgPSBuZXcgUmVxdWVzdFNlcmlhbGl6ZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChvbldpbGxEZXN0cm95VGV4dEJ1ZmZlcihidWZmZXIgPT4ge1xuICAgICAgY29uc3QgcGF0aDogP3N0cmluZyA9IGJ1ZmZlci5nZXRQYXRoKCk7XG4gICAgICBpZiAoIXBhdGgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlSW52YWxpZGF0aW9uKHtzY29wZTogJ2ZpbGUnLCBmaWxlUGF0aHM6IFtwYXRoXX0pO1xuICAgIH0pKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxuICAvKiogVGhlIHJldHVybmVkIFByb21pc2Ugd2lsbCByZXNvbHZlIHdoZW4gcmVzdWx0cyBoYXZlIGJlZW4gcHVibGlzaGVkLiAqL1xuICBfcnVuTGludFdpdGhCdXN5TWVzc2FnZSh0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmIChwYXRoID09IG51bGwpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2J1c3lTaWduYWxQcm92aWRlci5yZXBvcnRCdXN5KFxuICAgICAgYFdhaXRpbmcgZm9yIGFyYyBsaW50IHJlc3VsdHMgZm9yIFxcYCR7dGV4dEVkaXRvci5nZXRUaXRsZSgpfVxcYGAsXG4gICAgICAoKSA9PiB0aGlzLl9ydW5MaW50KHRleHRFZGl0b3IpLFxuICAgICAgeyBvbmx5Rm9yRmlsZTogcGF0aCB9LFxuICAgICk7XG4gIH1cblxuICAvKiogRG8gbm90IGNhbGwgdGhpcyBkaXJlY3RseSAtLSBjYWxsIF9ydW5MaW50V2l0aEJ1c3lNZXNzYWdlICovXG4gIEB0cmFja1RpbWluZygnbnVjbGlkZS1hcmNhbmlzdDpsaW50JylcbiAgYXN5bmMgX3J1bkxpbnQodGV4dEVkaXRvcjogVGV4dEVkaXRvcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgaW52YXJpYW50KGZpbGVQYXRoKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgYmxhY2tsaXN0ZWRMaW50ZXJzOiBBcnJheTxzdHJpbmc+ID1cbiAgICAgICAgKGZlYXR1cmVDb25maWcuZ2V0KCdudWNsaWRlLWFyY2FuaXN0LmJsYWNrbGlzdGVkTGludGVycycpOiBhbnkpO1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fcmVxdWVzdFNlcmlhbGl6ZXIucnVuKFxuICAgICAgICByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWFyY2FuaXN0LWNsaWVudCcpLmZpbmREaWFnbm9zdGljcyhbZmlsZVBhdGhdLCBibGFja2xpc3RlZExpbnRlcnMpXG4gICAgICApO1xuICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09ICdvdXRkYXRlZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgZGlhZ25vc3RpY3MgPSByZXN1bHQucmVzdWx0O1xuICAgICAgY29uc3QgZmlsZURpYWdub3N0aWNzID0gZGlhZ25vc3RpY3MubWFwKGRpYWdub3N0aWMgPT4ge1xuICAgICAgICBjb25zdCByYW5nZSA9IG5ldyBSYW5nZShcbiAgICAgICAgICBbZGlhZ25vc3RpYy5yb3csIGRpYWdub3N0aWMuY29sXSxcbiAgICAgICAgICBbZGlhZ25vc3RpYy5yb3csIHRleHRFZGl0b3IuZ2V0QnVmZmVyKCkubGluZUxlbmd0aEZvclJvdyhkaWFnbm9zdGljLnJvdyldXG4gICAgICAgICk7XG4gICAgICAgIGxldCB0ZXh0O1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkaWFnbm9zdGljLnRleHQpKSB7XG4gICAgICAgICAgLy8gU29tZXRpbWVzIGBhcmMgbGludGAgcmV0dXJucyBhbiBhcnJheSBvZiBzdHJpbmdzIGZvciB0aGUgdGV4dCwgcmF0aGVyIHRoYW4ganVzdCBhXG4gICAgICAgICAgLy8gc3RyaW5nIDooLlxuICAgICAgICAgIHRleHQgPSBkaWFnbm9zdGljLnRleHQuam9pbignICcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRleHQgPSBkaWFnbm9zdGljLnRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF5YmVQcm9wZXJ0aWVzID0ge307XG4gICAgICAgIGlmIChkaWFnbm9zdGljLm9yaWdpbmFsICE9IG51bGwgJiZcbiAgICAgICAgICBkaWFnbm9zdGljLnJlcGxhY2VtZW50ICE9IG51bGwgJiZcbiAgICAgICAgICAvLyBTb21ldGltZXMgbGludGVycyBzZXQgb3JpZ2luYWwgYW5kIHJlcGxhY2VtZW50IHRvIHRoZSBzYW1lIHZhbHVlLiBPYnZpb3VzbHkgdGhhdCB3b24ndFxuICAgICAgICAgIC8vIGZpeCBhbnl0aGluZy5cbiAgICAgICAgICBkaWFnbm9zdGljLm9yaWdpbmFsICE9PSBkaWFnbm9zdGljLnJlcGxhY2VtZW50XG4gICAgICAgICkge1xuICAgICAgICAgIG1heWJlUHJvcGVydGllcy5maXggPSB7XG4gICAgICAgICAgICBvbGRSYW5nZTogdGhpcy5fZ2V0UmFuZ2VGb3JGaXgoZGlhZ25vc3RpYy5yb3csIGRpYWdub3N0aWMuY29sLCBkaWFnbm9zdGljLm9yaWdpbmFsKSxcbiAgICAgICAgICAgIG5ld1RleHQ6IGRpYWdub3N0aWMucmVwbGFjZW1lbnQsXG4gICAgICAgICAgICBvbGRUZXh0OiBkaWFnbm9zdGljLm9yaWdpbmFsLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgICAgIHByb3ZpZGVyTmFtZTogJ0FyYycgKyAoZGlhZ25vc3RpYy5jb2RlID8gYDogJHtkaWFnbm9zdGljLmNvZGV9YCA6ICcnKSxcbiAgICAgICAgICB0eXBlOiBkaWFnbm9zdGljLnR5cGUsXG4gICAgICAgICAgdGV4dCxcbiAgICAgICAgICBmaWxlUGF0aDogZGlhZ25vc3RpYy5maWxlUGF0aCxcbiAgICAgICAgICByYW5nZSxcbiAgICAgICAgICAuLi5tYXliZVByb3BlcnRpZXMsXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGRpYWdub3N0aWNzVXBkYXRlID0ge1xuICAgICAgICBmaWxlUGF0aFRvTWVzc2FnZXM6IG5ldyBNYXAoW1tmaWxlUGF0aCwgZmlsZURpYWdub3N0aWNzXV0pLFxuICAgICAgfTtcbiAgICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5wdWJsaXNoTWVzc2FnZVVwZGF0ZShkaWFnbm9zdGljc1VwZGF0ZSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtbG9nZ2luZycpLmdldExvZ2dlcigpO1xuICAgICAgbG9nZ2VyLmVycm9yKGVycm9yKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBfZ2V0UmFuZ2VGb3JGaXgoc3RhcnRSb3c6IG51bWJlciwgc3RhcnRDb2w6IG51bWJlciwgb3JpZ2luYWxUZXh0OiBzdHJpbmcpOiBhdG9tJFJhbmdlIHtcbiAgICBsZXQgbmV3bGluZUNvdW50ID0gMDtcbiAgICBmb3IgKGNvbnN0IGNoYXIgb2Ygb3JpZ2luYWxUZXh0KSB7XG4gICAgICBpZiAoY2hhciA9PT0gJ1xcbicpIHtcbiAgICAgICAgbmV3bGluZUNvdW50Kys7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGVuZFJvdyA9IHN0YXJ0Um93ICsgbmV3bGluZUNvdW50O1xuICAgIGNvbnN0IGxhc3ROZXdsaW5lSW5kZXggPSBvcmlnaW5hbFRleHQubGFzdEluZGV4T2YoJ1xcbicpO1xuICAgIGxldCBlbmRDb2w7XG4gICAgaWYgKGxhc3ROZXdsaW5lSW5kZXggPT09IC0xKSB7XG4gICAgICBlbmRDb2wgPSBzdGFydENvbCArIG9yaWdpbmFsVGV4dC5sZW5ndGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVuZENvbCA9IG9yaWdpbmFsVGV4dC5sZW5ndGggLSBsYXN0TmV3bGluZUluZGV4IC0gMTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJhbmdlKFtzdGFydFJvdywgc3RhcnRDb2xdLCBbZW5kUm93LCBlbmRDb2xdKTtcbiAgfVxuXG4gIF9yZWNlaXZlZE5ld1VwZGF0ZVN1YnNjcmliZXIoKTogdm9pZCB7XG4gICAgY29uc3QgYWN0aXZlVGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoYWN0aXZlVGV4dEVkaXRvcikge1xuICAgICAgdGhpcy5fcnVuTGludFdpdGhCdXN5TWVzc2FnZShhY3RpdmVUZXh0RWRpdG9yKTtcbiAgICB9XG4gIH1cblxuICBvbk1lc3NhZ2VVcGRhdGUoY2FsbGJhY2s6IE1lc3NhZ2VVcGRhdGVDYWxsYmFjayk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvdmlkZXJCYXNlLm9uTWVzc2FnZVVwZGF0ZShjYWxsYmFjayk7XG4gIH1cblxuICBvbk1lc3NhZ2VJbnZhbGlkYXRpb24oY2FsbGJhY2s6IE1lc3NhZ2VJbnZhbGlkYXRpb25DYWxsYmFjayk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvdmlkZXJCYXNlLm9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjayk7XG4gIH1cbn1cbiJdfQ==