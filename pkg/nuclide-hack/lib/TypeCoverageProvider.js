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

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _HackLanguage = require('./HackLanguage');

var _nuclideDiagnosticsProviderBase = require('../../nuclide-diagnostics-provider-base');

var _atom = require('atom');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideHackCommon = require('../../nuclide-hack-common');

var _nuclideLogging = require('../../nuclide-logging');

var logger = (0, _nuclideLogging.getLogger)();
var RequestSerializer = _nuclideCommons.promises.RequestSerializer;

// Provides Diagnostics for un-typed regions of Hack code.

var TypeCoverageProvider = (function () {
  function TypeCoverageProvider(busySignalProvider) {
    var _this = this;

    _classCallCheck(this, TypeCoverageProvider);

    this._busySignalProvider = busySignalProvider;
    var shouldRunOnTheFly = false;
    var utilsOptions = {
      grammarScopes: _nuclideHackCommon.HACK_GRAMMARS_SET,
      shouldRunOnTheFly: shouldRunOnTheFly,
      onTextEditorEvent: function onTextEditorEvent(editor) {
        return _this._runTypeCoverage(editor);
      },
      onNewUpdateSubscriber: function onNewUpdateSubscriber(callback) {
        return _this._receivedNewUpdateSubscriber(callback);
      }
    };
    this._providerBase = new _nuclideDiagnosticsProviderBase.DiagnosticsProviderBase(utilsOptions);
    this._requestSerializer = new RequestSerializer();
    this._subscriptions = new _atom.CompositeDisposable();
    this._subscriptions.add((0, _nuclideAtomHelpers.onWillDestroyTextBuffer)(function (buffer) {
      var path = buffer.getPath();
      if (!path) {
        return;
      }
      _this._providerBase.publishMessageInvalidation({ scope: 'file', filePaths: [path] });
    }));

    this._checkExistingBuffers();
  }

  _createDecoratedClass(TypeCoverageProvider, [{
    key: '_checkExistingBuffers',
    value: _asyncToGenerator(function* () {
      var existingEditors = atom.project.getBuffers().map(function (buffer) {
        var path = buffer.getPath();
        if (path == null || path === '') {
          return null;
        }
        return (0, _nuclideAtomHelpers.existingEditorForUri)(buffer.getPath());
      }).filter(function (editor) {
        return editor != null && _nuclideHackCommon.HACK_GRAMMARS_SET.has(editor.getGrammar().scopeName);
      });
      for (var editor of existingEditors) {
        (0, _assert2['default'])(editor);
        /* eslint-disable babel/no-await-in-loop */
        yield this._runTypeCoverage(editor);
        /* eslint-enable babel/no-await-in-loop */
      }
    })
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
      this._providerBase.dispose();
    }
  }, {
    key: '_runTypeCoverage',
    value: function _runTypeCoverage(textEditor) {
      var _this2 = this;

      return this._busySignalProvider.reportBusy('Hack: Waiting for type coverage results', function () {
        return _this2._runTypeCoverageImpl(textEditor);
      })['catch'](_asyncToGenerator(function* (e) {
        logger.error(e);
      }));
    }
  }, {
    key: '_runTypeCoverageImpl',
    decorators: [(0, _nuclideAnalytics.trackTiming)('hack:run-type-coverage')],
    value: _asyncToGenerator(function* (textEditor) {
      var filePath = textEditor.getPath();
      if (filePath == null) {
        return;
      }

      var hackLanguage = yield (0, _HackLanguage.getHackLanguageForUri)(textEditor.getPath());
      if (hackLanguage == null) {
        return;
      }

      var result = yield this._requestSerializer.run(hackLanguage.getTypeCoverage(filePath));
      if (result.status === 'outdated') {
        return;
      }

      var regions = result.result;
      var diagnostics = regions.map(function (region) {
        return convertRegionToDiagnostic(filePath, region);
      });
      var diagnosticsUpdate = {
        filePathToMessages: new Map([[filePath, diagnostics]])
      };
      this._providerBase.publishMessageUpdate(diagnosticsUpdate);
    })
  }, {
    key: '_receivedNewUpdateSubscriber',
    value: function _receivedNewUpdateSubscriber() {
      // Every time we get a new subscriber, we need to push results to them. This
      // logic is common to all providers and should be abstracted out (t7813069)
      //
      // Once we provide all diagnostics, instead of just the current file, we can
      // probably remove the activeTextEditor parameter.
      var activeTextEditor = atom.workspace.getActiveTextEditor();
      if (activeTextEditor) {
        if (_nuclideHackCommon.HACK_GRAMMARS_SET.has(activeTextEditor.getGrammar().scopeName)) {
          this._runTypeCoverage(activeTextEditor);
        }
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

  return TypeCoverageProvider;
})();

exports.TypeCoverageProvider = TypeCoverageProvider;

var ERROR_MESSAGE = 'Un-type checked code. Consider adding type annotations.';
var WARNING_MESSAGE = 'Partially type checked code. Consider adding type annotations.';

function convertRegionToDiagnostic(filePath, region) {
  var isWarning = region.type === 'partial';
  var line = region.line - 1;
  return {
    scope: 'file',
    providerName: 'Hack',
    type: isWarning ? 'Warning' : 'Error',
    text: isWarning ? WARNING_MESSAGE : ERROR_MESSAGE,
    filePath: filePath,
    range: new _atom.Range([line, region.start - 1], [line, region.end])
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlR5cGVDb3ZlcmFnZVByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQW9Cb0MsZ0JBQWdCOzs4Q0FDZCx5Q0FBeUM7O29CQUN0QyxNQUFNOztnQ0FDckIseUJBQXlCOzs4QkFDNUIsdUJBQXVCOztrQ0FDYyw0QkFBNEI7O3NCQUNsRSxRQUFROzs7O2lDQUNFLDJCQUEyQjs7OEJBQ25DLHVCQUF1Qjs7QUFFL0MsSUFBTSxNQUFNLEdBQUcsZ0NBQVcsQ0FBQztJQUNwQixpQkFBaUIsNEJBQWpCLGlCQUFpQjs7OztJQUdYLG9CQUFvQjtBQU1wQixXQU5BLG9CQUFvQixDQU1uQixrQkFBMEMsRUFBRTs7OzBCQU43QyxvQkFBb0I7O0FBTzdCLFFBQUksQ0FBQyxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQztBQUM5QyxRQUFNLGlCQUFpQixHQUFHLEtBQUssQ0FBQztBQUNoQyxRQUFNLFlBQVksR0FBRztBQUNuQixtQkFBYSxzQ0FBbUI7QUFDaEMsdUJBQWlCLEVBQWpCLGlCQUFpQjtBQUNqQix1QkFBaUIsRUFBRSwyQkFBQSxNQUFNO2VBQUksTUFBSyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7T0FBQTtBQUMxRCwyQkFBcUIsRUFBRSwrQkFBQSxRQUFRO2VBQUksTUFBSyw0QkFBNEIsQ0FBQyxRQUFRLENBQUM7T0FBQTtLQUMvRSxDQUFDO0FBQ0YsUUFBSSxDQUFDLGFBQWEsR0FBRyw0REFBNEIsWUFBWSxDQUFDLENBQUM7QUFDL0QsUUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksaUJBQWlCLEVBQUUsQ0FBQztBQUNsRCxRQUFJLENBQUMsY0FBYyxHQUFHLCtCQUF5QixDQUFDO0FBQ2hELFFBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLGlEQUF3QixVQUFBLE1BQU0sRUFBSTtBQUN4RCxVQUFNLElBQWEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdkMsVUFBSSxDQUFDLElBQUksRUFBRTtBQUNULGVBQU87T0FDUjtBQUNELFlBQUssYUFBYSxDQUFDLDBCQUEwQixDQUFDLEVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDLENBQUM7S0FDbkYsQ0FBQyxDQUFDLENBQUM7O0FBRUosUUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7R0FDOUI7O3dCQTNCVSxvQkFBb0I7OzZCQTZCSixhQUFZO0FBQ3JDLFVBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQzlDLEdBQUcsQ0FBQyxVQUFBLE1BQU0sRUFBSTtBQUNiLFlBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM5QixZQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLEVBQUUsRUFBRTtBQUMvQixpQkFBTyxJQUFJLENBQUM7U0FDYjtBQUNELGVBQU8sOENBQXFCLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO09BQy9DLENBQUMsQ0FDRCxNQUFNLENBQUMsVUFBQSxNQUFNO2VBQUksTUFBTSxJQUFJLElBQUksSUFBSSxxQ0FBa0IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxTQUFTLENBQUM7T0FBQSxDQUFDLENBQUM7QUFDNUYsV0FBSyxJQUFNLE1BQU0sSUFBSSxlQUFlLEVBQUU7QUFDcEMsaUNBQVUsTUFBTSxDQUFDLENBQUM7O0FBRWxCLGNBQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDOztPQUVyQztLQUNGOzs7V0FFTSxtQkFBUztBQUNkLFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM5Qjs7O1dBRWUsMEJBQUMsVUFBc0IsRUFBaUI7OztBQUN0RCxhQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLDRDQUV4QztlQUFNLE9BQUssb0JBQW9CLENBQUMsVUFBVSxDQUFDO09BQUEsQ0FDNUMsU0FBTSxtQkFBQyxXQUFNLENBQUMsRUFBSTtBQUFFLGNBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FBRSxFQUFDLENBQUM7S0FDMUM7OztpQkFFQSxtQ0FBWSx3QkFBd0IsQ0FBQzs2QkFDWixXQUFDLFVBQXNCLEVBQWlCO0FBQ2hFLFVBQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN0QyxVQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7QUFDcEIsZUFBTztPQUNSOztBQUVELFVBQU0sWUFBWSxHQUFHLE1BQU0seUNBQXNCLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZFLFVBQUksWUFBWSxJQUFJLElBQUksRUFBRTtBQUN4QixlQUFPO09BQ1I7O0FBRUQsVUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUM5QyxZQUFZLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUN2QyxDQUFDO0FBQ0YsVUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLFVBQVUsRUFBRTtBQUNoQyxlQUFPO09BQ1I7O0FBRUQsVUFBTSxPQUFrQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDekQsVUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFBLE1BQU07ZUFBSSx5QkFBeUIsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDO09BQUEsQ0FBQyxDQUFDO0FBQ3ZGLFVBQU0saUJBQWlCLEdBQUc7QUFDeEIsMEJBQWtCLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO09BQ3ZELENBQUM7QUFDRixVQUFJLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDNUQ7OztXQUUyQix3Q0FBUzs7Ozs7O0FBTW5DLFVBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzlELFVBQUksZ0JBQWdCLEVBQUU7QUFDcEIsWUFBSSxxQ0FBa0IsR0FBRyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQ2xFLGNBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1NBQ3pDO09BQ0Y7S0FDRjs7O1dBRWMseUJBQUMsUUFBK0IsRUFBZTtBQUM1RCxhQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3JEOzs7V0FFb0IsK0JBQUMsUUFBcUMsRUFBZTtBQUN4RSxhQUFPLElBQUksQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDM0Q7OztTQTFHVSxvQkFBb0I7Ozs7O0FBNkdqQyxJQUFNLGFBQWEsR0FBRyx5REFBeUQsQ0FBQztBQUNoRixJQUFNLGVBQWUsR0FBRyxnRUFBZ0UsQ0FBQzs7QUFFekYsU0FBUyx5QkFBeUIsQ0FBQyxRQUFvQixFQUFFLE1BQTBCLEVBQ3ZEO0FBQzFCLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDO0FBQzVDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLFNBQU87QUFDTCxTQUFLLEVBQUUsTUFBTTtBQUNiLGdCQUFZLEVBQUUsTUFBTTtBQUNwQixRQUFJLEVBQUUsU0FBUyxHQUFHLFNBQVMsR0FBRyxPQUFPO0FBQ3JDLFFBQUksRUFBRSxTQUFTLEdBQUcsZUFBZSxHQUFHLGFBQWE7QUFDakQsWUFBUSxFQUFFLFFBQVE7QUFDbEIsU0FBSyxFQUFFLGdCQUFVLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQy9ELENBQUM7Q0FDSCIsImZpbGUiOiJUeXBlQ292ZXJhZ2VQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge0J1c3lTaWduYWxQcm92aWRlckJhc2V9IGZyb20gJy4uLy4uL251Y2xpZGUtYnVzeS1zaWduYWwnO1xuaW1wb3J0IHR5cGUge1xuICBGaWxlRGlhZ25vc3RpY01lc3NhZ2UsXG4gIE1lc3NhZ2VVcGRhdGVDYWxsYmFjayxcbiAgTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRpYWdub3N0aWNzLWJhc2UnO1xuaW1wb3J0IHR5cGUge1R5cGVDb3ZlcmFnZVJlZ2lvbn0gZnJvbSAnLi9UeXBlZFJlZ2lvbnMnO1xuXG5pbXBvcnQge2dldEhhY2tMYW5ndWFnZUZvclVyaX0gZnJvbSAnLi9IYWNrTGFuZ3VhZ2UnO1xuaW1wb3J0IHtEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kaWFnbm9zdGljcy1wcm92aWRlci1iYXNlJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgUmFuZ2V9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuaW1wb3J0IHtwcm9taXNlc30gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCB7ZXhpc3RpbmdFZGl0b3JGb3JVcmksIG9uV2lsbERlc3Ryb3lUZXh0QnVmZmVyfSBmcm9tICcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0hBQ0tfR1JBTU1BUlNfU0VUfSBmcm9tICcuLi8uLi9udWNsaWRlLWhhY2stY29tbW9uJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuXG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcbmNvbnN0IHtSZXF1ZXN0U2VyaWFsaXplcn0gPSBwcm9taXNlcztcblxuLy8gUHJvdmlkZXMgRGlhZ25vc3RpY3MgZm9yIHVuLXR5cGVkIHJlZ2lvbnMgb2YgSGFjayBjb2RlLlxuZXhwb3J0IGNsYXNzIFR5cGVDb3ZlcmFnZVByb3ZpZGVyIHtcbiAgX3Byb3ZpZGVyQmFzZTogRGlhZ25vc3RpY3NQcm92aWRlckJhc2U7XG4gIF9yZXF1ZXN0U2VyaWFsaXplcjogUmVxdWVzdFNlcmlhbGl6ZXI8QXJyYXk8VHlwZUNvdmVyYWdlUmVnaW9uPj47XG4gIF9idXN5U2lnbmFsUHJvdmlkZXI6IEJ1c3lTaWduYWxQcm92aWRlckJhc2U7XG4gIF9zdWJzY3JpcHRpb25zOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoYnVzeVNpZ25hbFByb3ZpZGVyOiBCdXN5U2lnbmFsUHJvdmlkZXJCYXNlKSB7XG4gICAgdGhpcy5fYnVzeVNpZ25hbFByb3ZpZGVyID0gYnVzeVNpZ25hbFByb3ZpZGVyO1xuICAgIGNvbnN0IHNob3VsZFJ1bk9uVGhlRmx5ID0gZmFsc2U7XG4gICAgY29uc3QgdXRpbHNPcHRpb25zID0ge1xuICAgICAgZ3JhbW1hclNjb3BlczogSEFDS19HUkFNTUFSU19TRVQsXG4gICAgICBzaG91bGRSdW5PblRoZUZseSxcbiAgICAgIG9uVGV4dEVkaXRvckV2ZW50OiBlZGl0b3IgPT4gdGhpcy5fcnVuVHlwZUNvdmVyYWdlKGVkaXRvciksXG4gICAgICBvbk5ld1VwZGF0ZVN1YnNjcmliZXI6IGNhbGxiYWNrID0+IHRoaXMuX3JlY2VpdmVkTmV3VXBkYXRlU3Vic2NyaWJlcihjYWxsYmFjayksXG4gICAgfTtcbiAgICB0aGlzLl9wcm92aWRlckJhc2UgPSBuZXcgRGlhZ25vc3RpY3NQcm92aWRlckJhc2UodXRpbHNPcHRpb25zKTtcbiAgICB0aGlzLl9yZXF1ZXN0U2VyaWFsaXplciA9IG5ldyBSZXF1ZXN0U2VyaWFsaXplcigpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKG9uV2lsbERlc3Ryb3lUZXh0QnVmZmVyKGJ1ZmZlciA9PiB7XG4gICAgICBjb25zdCBwYXRoOiA/c3RyaW5nID0gYnVmZmVyLmdldFBhdGgoKTtcbiAgICAgIGlmICghcGF0aCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl9wcm92aWRlckJhc2UucHVibGlzaE1lc3NhZ2VJbnZhbGlkYXRpb24oe3Njb3BlOiAnZmlsZScsIGZpbGVQYXRoczogW3BhdGhdfSk7XG4gICAgfSkpO1xuXG4gICAgdGhpcy5fY2hlY2tFeGlzdGluZ0J1ZmZlcnMoKTtcbiAgfVxuXG4gIGFzeW5jIF9jaGVja0V4aXN0aW5nQnVmZmVycygpOiBQcm9taXNlIHtcbiAgICBjb25zdCBleGlzdGluZ0VkaXRvcnMgPSBhdG9tLnByb2plY3QuZ2V0QnVmZmVycygpXG4gICAgICAubWFwKGJ1ZmZlciA9PiB7XG4gICAgICAgIGNvbnN0IHBhdGggPSBidWZmZXIuZ2V0UGF0aCgpO1xuICAgICAgICBpZiAocGF0aCA9PSBudWxsIHx8IHBhdGggPT09ICcnKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV4aXN0aW5nRWRpdG9yRm9yVXJpKGJ1ZmZlci5nZXRQYXRoKCkpO1xuICAgICAgfSlcbiAgICAgIC5maWx0ZXIoZWRpdG9yID0+IGVkaXRvciAhPSBudWxsICYmIEhBQ0tfR1JBTU1BUlNfU0VULmhhcyhlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSkpO1xuICAgIGZvciAoY29uc3QgZWRpdG9yIG9mIGV4aXN0aW5nRWRpdG9ycykge1xuICAgICAgaW52YXJpYW50KGVkaXRvcik7XG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wICovXG4gICAgICBhd2FpdCB0aGlzLl9ydW5UeXBlQ292ZXJhZ2UoZWRpdG9yKTtcbiAgICAgIC8qIGVzbGludC1lbmFibGUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcCAqL1xuICAgIH1cbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9ydW5UeXBlQ292ZXJhZ2UodGV4dEVkaXRvcjogVGV4dEVkaXRvcik6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9idXN5U2lnbmFsUHJvdmlkZXIucmVwb3J0QnVzeShcbiAgICAgIGBIYWNrOiBXYWl0aW5nIGZvciB0eXBlIGNvdmVyYWdlIHJlc3VsdHNgLFxuICAgICAgKCkgPT4gdGhpcy5fcnVuVHlwZUNvdmVyYWdlSW1wbCh0ZXh0RWRpdG9yKSxcbiAgICApLmNhdGNoKGFzeW5jIGUgPT4geyBsb2dnZXIuZXJyb3IoZSk7IH0pO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdoYWNrOnJ1bi10eXBlLWNvdmVyYWdlJylcbiAgYXN5bmMgX3J1blR5cGVDb3ZlcmFnZUltcGwodGV4dEVkaXRvcjogVGV4dEVkaXRvcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgaWYgKGZpbGVQYXRoID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBoYWNrTGFuZ3VhZ2UgPSBhd2FpdCBnZXRIYWNrTGFuZ3VhZ2VGb3JVcmkodGV4dEVkaXRvci5nZXRQYXRoKCkpO1xuICAgIGlmIChoYWNrTGFuZ3VhZ2UgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX3JlcXVlc3RTZXJpYWxpemVyLnJ1bihcbiAgICAgIGhhY2tMYW5ndWFnZS5nZXRUeXBlQ292ZXJhZ2UoZmlsZVBhdGgpXG4gICAgKTtcbiAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ291dGRhdGVkJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHJlZ2lvbnM6IEFycmF5PFR5cGVDb3ZlcmFnZVJlZ2lvbj4gPSByZXN1bHQucmVzdWx0O1xuICAgIGNvbnN0IGRpYWdub3N0aWNzID0gcmVnaW9ucy5tYXAocmVnaW9uID0+IGNvbnZlcnRSZWdpb25Ub0RpYWdub3N0aWMoZmlsZVBhdGgsIHJlZ2lvbikpO1xuICAgIGNvbnN0IGRpYWdub3N0aWNzVXBkYXRlID0ge1xuICAgICAgZmlsZVBhdGhUb01lc3NhZ2VzOiBuZXcgTWFwKFtbZmlsZVBhdGgsIGRpYWdub3N0aWNzXV0pLFxuICAgIH07XG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlVXBkYXRlKGRpYWdub3N0aWNzVXBkYXRlKTtcbiAgfVxuXG4gIF9yZWNlaXZlZE5ld1VwZGF0ZVN1YnNjcmliZXIoKTogdm9pZCB7XG4gICAgLy8gRXZlcnkgdGltZSB3ZSBnZXQgYSBuZXcgc3Vic2NyaWJlciwgd2UgbmVlZCB0byBwdXNoIHJlc3VsdHMgdG8gdGhlbS4gVGhpc1xuICAgIC8vIGxvZ2ljIGlzIGNvbW1vbiB0byBhbGwgcHJvdmlkZXJzIGFuZCBzaG91bGQgYmUgYWJzdHJhY3RlZCBvdXQgKHQ3ODEzMDY5KVxuICAgIC8vXG4gICAgLy8gT25jZSB3ZSBwcm92aWRlIGFsbCBkaWFnbm9zdGljcywgaW5zdGVhZCBvZiBqdXN0IHRoZSBjdXJyZW50IGZpbGUsIHdlIGNhblxuICAgIC8vIHByb2JhYmx5IHJlbW92ZSB0aGUgYWN0aXZlVGV4dEVkaXRvciBwYXJhbWV0ZXIuXG4gICAgY29uc3QgYWN0aXZlVGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoYWN0aXZlVGV4dEVkaXRvcikge1xuICAgICAgaWYgKEhBQ0tfR1JBTU1BUlNfU0VULmhhcyhhY3RpdmVUZXh0RWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUpKSB7XG4gICAgICAgIHRoaXMuX3J1blR5cGVDb3ZlcmFnZShhY3RpdmVUZXh0RWRpdG9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBvbk1lc3NhZ2VVcGRhdGUoY2FsbGJhY2s6IE1lc3NhZ2VVcGRhdGVDYWxsYmFjayk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvdmlkZXJCYXNlLm9uTWVzc2FnZVVwZGF0ZShjYWxsYmFjayk7XG4gIH1cblxuICBvbk1lc3NhZ2VJbnZhbGlkYXRpb24oY2FsbGJhY2s6IE1lc3NhZ2VJbnZhbGlkYXRpb25DYWxsYmFjayk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvdmlkZXJCYXNlLm9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjayk7XG4gIH1cbn1cblxuY29uc3QgRVJST1JfTUVTU0FHRSA9ICdVbi10eXBlIGNoZWNrZWQgY29kZS4gQ29uc2lkZXIgYWRkaW5nIHR5cGUgYW5ub3RhdGlvbnMuJztcbmNvbnN0IFdBUk5JTkdfTUVTU0FHRSA9ICdQYXJ0aWFsbHkgdHlwZSBjaGVja2VkIGNvZGUuIENvbnNpZGVyIGFkZGluZyB0eXBlIGFubm90YXRpb25zLic7XG5cbmZ1bmN0aW9uIGNvbnZlcnRSZWdpb25Ub0RpYWdub3N0aWMoZmlsZVBhdGg6IE51Y2xpZGVVcmksIHJlZ2lvbjogVHlwZUNvdmVyYWdlUmVnaW9uKVxuICAgIDogRmlsZURpYWdub3N0aWNNZXNzYWdlIHtcbiAgY29uc3QgaXNXYXJuaW5nID0gcmVnaW9uLnR5cGUgPT09ICdwYXJ0aWFsJztcbiAgY29uc3QgbGluZSA9IHJlZ2lvbi5saW5lIC0gMTtcbiAgcmV0dXJuIHtcbiAgICBzY29wZTogJ2ZpbGUnLFxuICAgIHByb3ZpZGVyTmFtZTogJ0hhY2snLFxuICAgIHR5cGU6IGlzV2FybmluZyA/ICdXYXJuaW5nJyA6ICdFcnJvcicsXG4gICAgdGV4dDogaXNXYXJuaW5nID8gV0FSTklOR19NRVNTQUdFIDogRVJST1JfTUVTU0FHRSxcbiAgICBmaWxlUGF0aDogZmlsZVBhdGgsXG4gICAgcmFuZ2U6IG5ldyBSYW5nZShbbGluZSwgcmVnaW9uLnN0YXJ0IC0gMV0sIFtsaW5lLCByZWdpb24uZW5kXSksXG4gIH07XG59XG4iXX0=