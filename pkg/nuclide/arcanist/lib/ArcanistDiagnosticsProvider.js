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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFyY2FuaXN0RGlhZ25vc3RpY3NQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWtCa0MsTUFBTTs7dUNBQ0YsaUNBQWlDOzs2QkFFN0Msc0JBQXNCOzs7O3lCQUN0QixpQkFBaUI7OzJCQUNoQixvQkFBb0I7O3VCQUN4QixlQUFlOztzQkFDaEIsUUFBUTs7OztJQUV2QixpQkFBaUIscUJBQWpCLGlCQUFpQjs7SUFFWCwyQkFBMkI7QUFNM0IsV0FOQSwyQkFBMkIsQ0FNMUIsa0JBQTBDLEVBQUU7OzswQkFON0MsMkJBQTJCOztBQU9wQyxRQUFJLENBQUMsbUJBQW1CLEdBQUcsa0JBQWtCLENBQUM7QUFDOUMsUUFBSSxDQUFDLGNBQWMsR0FBRywrQkFBeUIsQ0FBQztBQUNoRCxRQUFNLFdBQVcsR0FBRztBQUNsQiwwQkFBb0IsRUFBRSxJQUFJO0FBQzFCLHVCQUFpQixFQUFFLEtBQUs7QUFDeEIsdUJBQWlCLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDMUQsMkJBQXFCLEVBQUUsSUFBSSxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7S0FDcEUsQ0FBQztBQUNGLFFBQUksQ0FBQyxhQUFhLEdBQUcscURBQTRCLFdBQVcsQ0FBQyxDQUFDO0FBQzlELFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLGlCQUFpQixFQUFFLENBQUM7QUFDbEQsUUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQyxVQUFDLElBQU0sRUFBSztVQUFWLElBQUksR0FBTCxJQUFNLENBQUwsSUFBSTs7QUFDakUsVUFBSSwrQkFBYSxJQUFJLENBQUMsRUFBRTtBQUN0QixpQ0FBVSxPQUFPLElBQUksQ0FBQyxPQUFPLEtBQUssVUFBVSxDQUFDLENBQUM7QUFDOUMsWUFBTSxJQUFhLEdBQUcsSUFBSSxDQUFD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QUFTO0FBQ25DLFVBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzlELFVBQUksZ0JBQWdCLEVBQUU7QUFDcEIsWUFBSSxDQUFDLHVCQUF1QixDQUFDLGdCQUFnQixDQUFDLENBQUM7T0FDaEQ7S0FDRjs7O1dBRWMseUJBQUMsUUFBK0IsRUFBZTtBQUM1RCxhQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3JEOzs7V0FFb0IsK0JBQUMsUUFBcUMsRUFBZTtBQUN4RSxhQUFPLElBQUksQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDM0Q7OztXQUVrQiw2QkFBQyxJQUFZLEVBQVU7QUFDeEMsYUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUNuQyxNQUFNLENBQUMsVUFBQSxNQUFNO2VBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxLQUFLLElBQUk7T0FBQSxDQUFDLENBQzNDLE1BQU0sQ0FBQztLQUNYOzs7U0F2SVUsMkJBQTJCIiwiZmlsZSI6IkFyY2FuaXN0RGlhZ25vc3RpY3NQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtCdXN5U2lnbmFsUHJvdmlkZXJCYXNlfSBmcm9tICcuLi8uLi9idXN5LXNpZ25hbC1wcm92aWRlci1iYXNlJztcblxuaW1wb3J0IHR5cGUge1xuICBNZXNzYWdlVXBkYXRlQ2FsbGJhY2ssXG4gIE1lc3NhZ2VJbnZhbGlkYXRpb25DYWxsYmFjayxcbn0gZnJvbSAnLi4vLi4vZGlhZ25vc3RpY3MvYmFzZSc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge0RpYWdub3N0aWNzUHJvdmlkZXJCYXNlfSBmcm9tICcuLi8uLi9kaWFnbm9zdGljcy9wcm92aWRlci1iYXNlJztcblxuaW1wb3J0IGZlYXR1cmVDb25maWcgZnJvbSAnLi4vLi4vZmVhdHVyZS1jb25maWcnO1xuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcbmltcG9ydCB7aXNUZXh0RWRpdG9yfSBmcm9tICcuLi8uLi9hdG9tLWhlbHBlcnMnO1xuaW1wb3J0IHtwcm9taXNlc30gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IHtSZXF1ZXN0U2VyaWFsaXplcn0gPSBwcm9taXNlcztcblxuZXhwb3J0IGNsYXNzIEFyY2FuaXN0RGlhZ25vc3RpY3NQcm92aWRlciB7XG4gIF9wcm92aWRlckJhc2U6IERpYWdub3N0aWNzUHJvdmlkZXJCYXNlO1xuICBfcmVxdWVzdFNlcmlhbGl6ZXI6IFJlcXVlc3RTZXJpYWxpemVyO1xuICBfc3Vic2NyaXB0aW9uczogYXRvbSRDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfYnVzeVNpZ25hbFByb3ZpZGVyOiBCdXN5U2lnbmFsUHJvdmlkZXJCYXNlO1xuXG4gIGNvbnN0cnVjdG9yKGJ1c3lTaWduYWxQcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyQmFzZSkge1xuICAgIHRoaXMuX2J1c3lTaWduYWxQcm92aWRlciA9IGJ1c3lTaWduYWxQcm92aWRlcjtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICBjb25zdCBiYXNlT3B0aW9ucyA9IHtcbiAgICAgIGVuYWJsZUZvckFsbEdyYW1tYXJzOiB0cnVlLFxuICAgICAgc2hvdWxkUnVuT25UaGVGbHk6IGZhbHNlLFxuICAgICAgb25UZXh0RWRpdG9yRXZlbnQ6IHRoaXMuX3J1bkxpbnRXaXRoQnVzeU1lc3NhZ2UuYmluZCh0aGlzKSxcbiAgICAgIG9uTmV3VXBkYXRlU3Vic2NyaWJlcjogdGhpcy5fcmVjZWl2ZWROZXdVcGRhdGVTdWJzY3JpYmVyLmJpbmQodGhpcyksXG4gICAgfTtcbiAgICB0aGlzLl9wcm92aWRlckJhc2UgPSBuZXcgRGlhZ25vc3RpY3NQcm92aWRlckJhc2UoYmFzZU9wdGlvbnMpO1xuICAgIHRoaXMuX3JlcXVlc3RTZXJpYWxpemVyID0gbmV3IFJlcXVlc3RTZXJpYWxpemVyKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2Uub25XaWxsRGVzdHJveVBhbmVJdGVtKCh7aXRlbX0pID0+IHtcbiAgICAgIGlmIChpc1RleHRFZGl0b3IoaXRlbSkpIHtcbiAgICAgICAgaW52YXJpYW50KHR5cGVvZiBpdGVtLmdldFBhdGggPT09ICdmdW5jdGlvbicpO1xuICAgICAgICBjb25zdCBwYXRoOiA/c3RyaW5nID0gaXRlbS5nZXRQYXRoKCk7XG4gICAgICAgIGlmICghcGF0aCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvcGVuQnVmZmVyQ291bnQgPSB0aGlzLl9nZXRPcGVuQnVmZmVyQ291bnQocGF0aCk7XG4gICAgICAgIGludmFyaWFudChcbiAgICAgICAgICBvcGVuQnVmZmVyQ291bnQgIT09IDAsXG4gICAgICAgICAgJ1RoZSBmaWxlIHRoYXQgaXMgYWJvdXQgdG8gYmUgY2xvc2VkIHNob3VsZCBzdGlsbCBiZSBvcGVuLidcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKG9wZW5CdWZmZXJDb3VudCA9PT0gMSkge1xuICAgICAgICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5wdWJsaXNoTWVzc2FnZUludmFsaWRhdGlvbih7c2NvcGU6ICdmaWxlJywgZmlsZVBhdGhzOiBbcGF0aF19KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxuICAvKiogVGhlIHJldHVybmVkIFByb21pc2Ugd2lsbCByZXNvbHZlIHdoZW4gcmVzdWx0cyBoYXZlIGJlZW4gcHVibGlzaGVkLiAqL1xuICBfcnVuTGludFdpdGhCdXN5TWVzc2FnZSh0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmIChwYXRoID09IG51bGwpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2J1c3lTaWduYWxQcm92aWRlci5yZXBvcnRCdXN5KFxuICAgICAgYFdhaXRpbmcgZm9yIGFyYyBsaW50IHJlc3VsdHMgZm9yIFxcYCR7dGV4dEVkaXRvci5nZXRUaXRsZSgpfVxcYGAsXG4gICAgICAoKSA9PiB0aGlzLl9ydW5MaW50KHRleHRFZGl0b3IpLFxuICAgICAgeyBvbmx5Rm9yRmlsZTogcGF0aCB9LFxuICAgICk7XG4gIH1cblxuICAvKiogRG8gbm90IGNhbGwgdGhpcyBkaXJlY3RseSAtLSBjYWxsIF9ydW5MaW50V2l0aEJ1c3lNZXNzYWdlICovXG4gIEB0cmFja1RpbWluZygnbnVjbGlkZS1hcmNhbmlzdDpsaW50JylcbiAgYXN5bmMgX3J1bkxpbnQodGV4dEVkaXRvcjogVGV4dEVkaXRvcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgaW52YXJpYW50KGZpbGVQYXRoKTtcbiAgICBjb25zdCB7UmFuZ2V9ID0gcmVxdWlyZSgnYXRvbScpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9yZXF1ZXN0U2VyaWFsaXplci5ydW4oXG4gICAgICAgIHJlcXVpcmUoJy4uLy4uL2FyY2FuaXN0LWNsaWVudCcpLmZpbmREaWFnbm9zdGljcyhbZmlsZVBhdGhdKVxuICAgICAgKTtcbiAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSAnb3V0ZGF0ZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGRpYWdub3N0aWNzID0gcmVzdWx0LnJlc3VsdDtcbiAgICAgIGNvbnN0IGJsYWNrTGlzdGVkTGludGVycyA9IG5ldyBTZXQoZmVhdHVyZUNvbmZpZy5nZXQoJ251Y2xpZGUtYXJjYW5pc3QuYmxhY2tsaXN0ZWRMaW50ZXJzJykpO1xuICAgICAgY29uc3QgZmlsdGVyZWREaWFnbm9zdGljcyA9IGRpYWdub3N0aWNzLmZpbHRlcihkaWFnbm9zdGljID0+IHtcbiAgICAgICAgcmV0dXJuICFibGFja0xpc3RlZExpbnRlcnMuaGFzKGRpYWdub3N0aWMuY29kZSk7XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGZpbGVEaWFnbm9zdGljcyA9IGZpbHRlcmVkRGlhZ25vc3RpY3MubWFwKGRpYWdub3N0aWMgPT4ge1xuICAgICAgICBjb25zdCByYW5nZSA9IG5ldyBSYW5nZShcbiAgICAgICAgICBbZGlhZ25vc3RpYy5yb3csIGRpYWdub3N0aWMuY29sXSxcbiAgICAgICAgICBbZGlhZ25vc3RpYy5yb3csIHRleHRFZGl0b3IuZ2V0QnVmZmVyKCkubGluZUxlbmd0aEZvclJvdyhkaWFnbm9zdGljLnJvdyldXG4gICAgICAgICk7XG4gICAgICAgIGxldCB0ZXh0O1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkaWFnbm9zdGljLnRleHQpKSB7XG4gICAgICAgICAgLy8gU29tZXRpbWVzIGBhcmMgbGludGAgcmV0dXJucyBhbiBhcnJheSBvZiBzdHJpbmdzIGZvciB0aGUgdGV4dCwgcmF0aGVyIHRoYW4ganVzdCBhXG4gICAgICAgICAgLy8gc3RyaW5nIDooLlxuICAgICAgICAgIHRleHQgPSBkaWFnbm9zdGljLnRleHQuam9pbignICcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRleHQgPSBkaWFnbm9zdGljLnRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF5YmVQcm9wZXJ0aWVzID0ge307XG4gICAgICAgIGlmIChkaWFnbm9zdGljLm9yaWdpbmFsICE9IG51bGwgJiYgZGlhZ25vc3RpYy5yZXBsYWNlbWVudCAhPSBudWxsKSB7XG4gICAgICAgICAgbWF5YmVQcm9wZXJ0aWVzLmZpeCA9IHtcbiAgICAgICAgICAgIG9sZFJhbmdlOiBuZXcgUmFuZ2UoXG4gICAgICAgICAgICAgIFtkaWFnbm9zdGljLnJvdywgZGlhZ25vc3RpYy5jb2xdLFxuICAgICAgICAgICAgICBbZGlhZ25vc3RpYy5yb3csIGRpYWdub3N0aWMuY29sICsgZGlhZ25vc3RpYy5vcmlnaW5hbC5sZW5ndGhdLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIG5ld1RleHQ6IGRpYWdub3N0aWMucmVwbGFjZW1lbnQsXG4gICAgICAgICAgICBvbGRUZXh0OiBkaWFnbm9zdGljLm9yaWdpbmFsLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgICAgIHByb3ZpZGVyTmFtZTogJ0FyYycgKyAoZGlhZ25vc3RpYy5jb2RlID8gYDogJHtkaWFnbm9zdGljLmNvZGV9YCA6ICcnKSxcbiAgICAgICAgICB0eXBlOiBkaWFnbm9zdGljLnR5cGUsXG4gICAgICAgICAgdGV4dCxcbiAgICAgICAgICBmaWxlUGF0aDogZGlhZ25vc3RpYy5maWxlUGF0aCxcbiAgICAgICAgICByYW5nZSxcbiAgICAgICAgICAuLi5tYXliZVByb3BlcnRpZXMsXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGRpYWdub3N0aWNzVXBkYXRlID0ge1xuICAgICAgICBmaWxlUGF0aFRvTWVzc2FnZXM6IG5ldyBNYXAoW1tmaWxlUGF0aCwgZmlsZURpYWdub3N0aWNzXV0pLFxuICAgICAgfTtcbiAgICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5wdWJsaXNoTWVzc2FnZVVwZGF0ZShkaWFnbm9zdGljc1VwZGF0ZSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbiAgICAgIGxvZ2dlci5lcnJvcihlcnJvcik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgX3JlY2VpdmVkTmV3VXBkYXRlU3Vic2NyaWJlcigpOiB2b2lkIHtcbiAgICBjb25zdCBhY3RpdmVUZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmIChhY3RpdmVUZXh0RWRpdG9yKSB7XG4gICAgICB0aGlzLl9ydW5MaW50V2l0aEJ1c3lNZXNzYWdlKGFjdGl2ZVRleHRFZGl0b3IpO1xuICAgIH1cbiAgfVxuXG4gIG9uTWVzc2FnZVVwZGF0ZShjYWxsYmFjazogTWVzc2FnZVVwZGF0ZUNhbGxiYWNrKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9wcm92aWRlckJhc2Uub25NZXNzYWdlVXBkYXRlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjazogTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9wcm92aWRlckJhc2Uub25NZXNzYWdlSW52YWxpZGF0aW9uKGNhbGxiYWNrKTtcbiAgfVxuXG4gIF9nZXRPcGVuQnVmZmVyQ291bnQocGF0aDogc3RyaW5nKTogbnVtYmVyIHtcbiAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKVxuICAgICAgLmZpbHRlcihlZGl0b3IgPT4gZWRpdG9yLmdldFBhdGgoKSA9PT0gcGF0aClcbiAgICAgIC5sZW5ndGg7XG4gIH1cbn1cbiJdfQ==