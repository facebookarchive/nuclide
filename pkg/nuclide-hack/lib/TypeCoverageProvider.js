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

var _hack = require('./hack');

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

      var hackLanguage = yield (0, _hack.getHackLanguageForUri)(textEditor.getPath());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlR5cGVDb3ZlcmFnZVByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQW9Cb0MsUUFBUTs7OENBQ04seUNBQXlDOztvQkFDdEMsTUFBTTs7Z0NBQ3JCLHlCQUF5Qjs7OEJBQzVCLHVCQUF1Qjs7a0NBQ2MsNEJBQTRCOztzQkFDbEUsUUFBUTs7OztpQ0FDRSwyQkFBMkI7OzhCQUNuQyx1QkFBdUI7O0FBRS9DLElBQU0sTUFBTSxHQUFHLGdDQUFXLENBQUM7SUFDcEIsaUJBQWlCLDRCQUFqQixpQkFBaUI7Ozs7SUFHWCxvQkFBb0I7QUFNcEIsV0FOQSxvQkFBb0IsQ0FNbkIsa0JBQTBDLEVBQUU7OzswQkFON0Msb0JBQW9COztBQU83QixRQUFJLENBQUMsbUJBQW1CLEdBQUcsa0JBQWtCLENBQUM7QUFDOUMsUUFBTSxpQkFBaUIsR0FBRyxLQUFLLENBQUM7QUFDaEMsUUFBTSxZQUFZLEdBQUc7QUFDbkIsbUJBQWEsc0NBQW1CO0FBQ2hDLHVCQUFpQixFQUFqQixpQkFBaUI7QUFDakIsdUJBQWlCLEVBQUUsMkJBQUEsTUFBTTtlQUFJLE1BQUssZ0JBQWdCLENBQUMsTUFBTSxDQUFDO09BQUE7QUFDMUQsMkJBQXFCLEVBQUUsK0JBQUEsUUFBUTtlQUFJLE1BQUssNEJBQTRCLENBQUMsUUFBUSxDQUFDO09BQUE7S0FDL0UsQ0FBQztBQUNGLFFBQUksQ0FBQyxhQUFhLEdBQUcsNERBQTRCLFlBQVksQ0FBQyxDQUFDO0FBQy9ELFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLGlCQUFpQixFQUFFLENBQUM7QUFDbEQsUUFBSSxDQUFDLGNBQWMsR0FBRywrQkFBeUIsQ0FBQztBQUNoRCxRQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxpREFBd0IsVUFBQSxNQUFNLEVBQUk7QUFDeEQsVUFBTSxJQUFhLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3ZDLFVBQUksQ0FBQyxJQUFJLEVBQUU7QUFD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WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtCdXN5U2lnbmFsUHJvdmlkZXJCYXNlfSBmcm9tICcuLi8uLi9udWNsaWRlLWJ1c3ktc2lnbmFsLXByb3ZpZGVyLWJhc2UnO1xuaW1wb3J0IHR5cGUge1xuICBGaWxlRGlhZ25vc3RpY01lc3NhZ2UsXG4gIE1lc3NhZ2VVcGRhdGVDYWxsYmFjayxcbiAgTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRpYWdub3N0aWNzLWJhc2UnO1xuaW1wb3J0IHR5cGUge1R5cGVDb3ZlcmFnZVJlZ2lvbn0gZnJvbSAnLi9UeXBlZFJlZ2lvbnMnO1xuXG5pbXBvcnQge2dldEhhY2tMYW5ndWFnZUZvclVyaX0gZnJvbSAnLi9oYWNrJztcbmltcG9ydCB7RGlhZ25vc3RpY3NQcm92aWRlckJhc2V9IGZyb20gJy4uLy4uL251Y2xpZGUtZGlhZ25vc3RpY3MtcHJvdmlkZXItYmFzZSc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIFJhbmdlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7dHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCB7cHJvbWlzZXN9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQge2V4aXN0aW5nRWRpdG9yRm9yVXJpLCBvbldpbGxEZXN0cm95VGV4dEJ1ZmZlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1hdG9tLWhlbHBlcnMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtIQUNLX0dSQU1NQVJTX1NFVH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1oYWNrLWNvbW1vbic7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJztcblxuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5jb25zdCB7UmVxdWVzdFNlcmlhbGl6ZXJ9ID0gcHJvbWlzZXM7XG5cbi8vIFByb3ZpZGVzIERpYWdub3N0aWNzIGZvciB1bi10eXBlZCByZWdpb25zIG9mIEhhY2sgY29kZS5cbmV4cG9ydCBjbGFzcyBUeXBlQ292ZXJhZ2VQcm92aWRlciB7XG4gIF9wcm92aWRlckJhc2U6IERpYWdub3N0aWNzUHJvdmlkZXJCYXNlO1xuICBfcmVxdWVzdFNlcmlhbGl6ZXI6IFJlcXVlc3RTZXJpYWxpemVyPEFycmF5PFR5cGVDb3ZlcmFnZVJlZ2lvbj4+O1xuICBfYnVzeVNpZ25hbFByb3ZpZGVyOiBCdXN5U2lnbmFsUHJvdmlkZXJCYXNlO1xuICBfc3Vic2NyaXB0aW9uczogYXRvbSRDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKGJ1c3lTaWduYWxQcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyQmFzZSkge1xuICAgIHRoaXMuX2J1c3lTaWduYWxQcm92aWRlciA9IGJ1c3lTaWduYWxQcm92aWRlcjtcbiAgICBjb25zdCBzaG91bGRSdW5PblRoZUZseSA9IGZhbHNlO1xuICAgIGNvbnN0IHV0aWxzT3B0aW9ucyA9IHtcbiAgICAgIGdyYW1tYXJTY29wZXM6IEhBQ0tfR1JBTU1BUlNfU0VULFxuICAgICAgc2hvdWxkUnVuT25UaGVGbHksXG4gICAgICBvblRleHRFZGl0b3JFdmVudDogZWRpdG9yID0+IHRoaXMuX3J1blR5cGVDb3ZlcmFnZShlZGl0b3IpLFxuICAgICAgb25OZXdVcGRhdGVTdWJzY3JpYmVyOiBjYWxsYmFjayA9PiB0aGlzLl9yZWNlaXZlZE5ld1VwZGF0ZVN1YnNjcmliZXIoY2FsbGJhY2spLFxuICAgIH07XG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlID0gbmV3IERpYWdub3N0aWNzUHJvdmlkZXJCYXNlKHV0aWxzT3B0aW9ucyk7XG4gICAgdGhpcy5fcmVxdWVzdFNlcmlhbGl6ZXIgPSBuZXcgUmVxdWVzdFNlcmlhbGl6ZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChvbldpbGxEZXN0cm95VGV4dEJ1ZmZlcihidWZmZXIgPT4ge1xuICAgICAgY29uc3QgcGF0aDogP3N0cmluZyA9IGJ1ZmZlci5nZXRQYXRoKCk7XG4gICAgICBpZiAoIXBhdGgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlSW52YWxpZGF0aW9uKHtzY29wZTogJ2ZpbGUnLCBmaWxlUGF0aHM6IFtwYXRoXX0pO1xuICAgIH0pKTtcblxuICAgIHRoaXMuX2NoZWNrRXhpc3RpbmdCdWZmZXJzKCk7XG4gIH1cblxuICBhc3luYyBfY2hlY2tFeGlzdGluZ0J1ZmZlcnMoKTogUHJvbWlzZSB7XG4gICAgY29uc3QgZXhpc3RpbmdFZGl0b3JzID0gYXRvbS5wcm9qZWN0LmdldEJ1ZmZlcnMoKVxuICAgICAgLm1hcChidWZmZXIgPT4ge1xuICAgICAgICBjb25zdCBwYXRoID0gYnVmZmVyLmdldFBhdGgoKTtcbiAgICAgICAgaWYgKHBhdGggPT0gbnVsbCB8fCBwYXRoID09PSAnJykge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBleGlzdGluZ0VkaXRvckZvclVyaShidWZmZXIuZ2V0UGF0aCgpKTtcbiAgICAgIH0pXG4gICAgICAuZmlsdGVyKGVkaXRvciA9PiBlZGl0b3IgIT0gbnVsbCAmJiBIQUNLX0dSQU1NQVJTX1NFVC5oYXMoZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUpKTtcbiAgICBmb3IgKGNvbnN0IGVkaXRvciBvZiBleGlzdGluZ0VkaXRvcnMpIHtcbiAgICAgIGludmFyaWFudChlZGl0b3IpO1xuICAgICAgLyogZXNsaW50LWRpc2FibGUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcCAqL1xuICAgICAgYXdhaXQgdGhpcy5fcnVuVHlwZUNvdmVyYWdlKGVkaXRvcik7XG4gICAgICAvKiBlc2xpbnQtZW5hYmxlIGJhYmVsL25vLWF3YWl0LWluLWxvb3AgKi9cbiAgICB9XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5kaXNwb3NlKCk7XG4gIH1cblxuICBfcnVuVHlwZUNvdmVyYWdlKHRleHRFZGl0b3I6IFRleHRFZGl0b3IpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fYnVzeVNpZ25hbFByb3ZpZGVyLnJlcG9ydEJ1c3koXG4gICAgICBgSGFjazogV2FpdGluZyBmb3IgdHlwZSBjb3ZlcmFnZSByZXN1bHRzYCxcbiAgICAgICgpID0+IHRoaXMuX3J1blR5cGVDb3ZlcmFnZUltcGwodGV4dEVkaXRvciksXG4gICAgKS5jYXRjaChhc3luYyBlID0+IHsgbG9nZ2VyLmVycm9yKGUpOyB9KTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnaGFjazpydW4tdHlwZS1jb3ZlcmFnZScpXG4gIGFzeW5jIF9ydW5UeXBlQ292ZXJhZ2VJbXBsKHRleHRFZGl0b3I6IFRleHRFZGl0b3IpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmIChmaWxlUGF0aCA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaGFja0xhbmd1YWdlID0gYXdhaXQgZ2V0SGFja0xhbmd1YWdlRm9yVXJpKHRleHRFZGl0b3IuZ2V0UGF0aCgpKTtcbiAgICBpZiAoaGFja0xhbmd1YWdlID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9yZXF1ZXN0U2VyaWFsaXplci5ydW4oXG4gICAgICBoYWNrTGFuZ3VhZ2UuZ2V0VHlwZUNvdmVyYWdlKGZpbGVQYXRoKVxuICAgICk7XG4gICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09ICdvdXRkYXRlZCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByZWdpb25zOiBBcnJheTxUeXBlQ292ZXJhZ2VSZWdpb24+ID0gcmVzdWx0LnJlc3VsdDtcbiAgICBjb25zdCBkaWFnbm9zdGljcyA9IHJlZ2lvbnMubWFwKHJlZ2lvbiA9PiBjb252ZXJ0UmVnaW9uVG9EaWFnbm9zdGljKGZpbGVQYXRoLCByZWdpb24pKTtcbiAgICBjb25zdCBkaWFnbm9zdGljc1VwZGF0ZSA9IHtcbiAgICAgIGZpbGVQYXRoVG9NZXNzYWdlczogbmV3IE1hcChbW2ZpbGVQYXRoLCBkaWFnbm9zdGljc11dKSxcbiAgICB9O1xuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5wdWJsaXNoTWVzc2FnZVVwZGF0ZShkaWFnbm9zdGljc1VwZGF0ZSk7XG4gIH1cblxuICBfcmVjZWl2ZWROZXdVcGRhdGVTdWJzY3JpYmVyKCk6IHZvaWQge1xuICAgIC8vIEV2ZXJ5IHRpbWUgd2UgZ2V0IGEgbmV3IHN1YnNjcmliZXIsIHdlIG5lZWQgdG8gcHVzaCByZXN1bHRzIHRvIHRoZW0uIFRoaXNcbiAgICAvLyBsb2dpYyBpcyBjb21tb24gdG8gYWxsIHByb3ZpZGVycyBhbmQgc2hvdWxkIGJlIGFic3RyYWN0ZWQgb3V0ICh0NzgxMzA2OSlcbiAgICAvL1xuICAgIC8vIE9uY2Ugd2UgcHJvdmlkZSBhbGwgZGlhZ25vc3RpY3MsIGluc3RlYWQgb2YganVzdCB0aGUgY3VycmVudCBmaWxlLCB3ZSBjYW5cbiAgICAvLyBwcm9iYWJseSByZW1vdmUgdGhlIGFjdGl2ZVRleHRFZGl0b3IgcGFyYW1ldGVyLlxuICAgIGNvbnN0IGFjdGl2ZVRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgaWYgKGFjdGl2ZVRleHRFZGl0b3IpIHtcbiAgICAgIGlmIChIQUNLX0dSQU1NQVJTX1NFVC5oYXMoYWN0aXZlVGV4dEVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lKSkge1xuICAgICAgICB0aGlzLl9ydW5UeXBlQ292ZXJhZ2UoYWN0aXZlVGV4dEVkaXRvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgb25NZXNzYWdlVXBkYXRlKGNhbGxiYWNrOiBNZXNzYWdlVXBkYXRlQ2FsbGJhY2spOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3ZpZGVyQmFzZS5vbk1lc3NhZ2VVcGRhdGUoY2FsbGJhY2spO1xuICB9XG5cbiAgb25NZXNzYWdlSW52YWxpZGF0aW9uKGNhbGxiYWNrOiBNZXNzYWdlSW52YWxpZGF0aW9uQ2FsbGJhY2spOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3ZpZGVyQmFzZS5vbk1lc3NhZ2VJbnZhbGlkYXRpb24oY2FsbGJhY2spO1xuICB9XG59XG5cbmNvbnN0IEVSUk9SX01FU1NBR0UgPSAnVW4tdHlwZSBjaGVja2VkIGNvZGUuIENvbnNpZGVyIGFkZGluZyB0eXBlIGFubm90YXRpb25zLic7XG5jb25zdCBXQVJOSU5HX01FU1NBR0UgPSAnUGFydGlhbGx5IHR5cGUgY2hlY2tlZCBjb2RlLiBDb25zaWRlciBhZGRpbmcgdHlwZSBhbm5vdGF0aW9ucy4nO1xuXG5mdW5jdGlvbiBjb252ZXJ0UmVnaW9uVG9EaWFnbm9zdGljKGZpbGVQYXRoOiBOdWNsaWRlVXJpLCByZWdpb246IFR5cGVDb3ZlcmFnZVJlZ2lvbilcbiAgICA6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSB7XG4gIGNvbnN0IGlzV2FybmluZyA9IHJlZ2lvbi50eXBlID09PSAncGFydGlhbCc7XG4gIGNvbnN0IGxpbmUgPSByZWdpb24ubGluZSAtIDE7XG4gIHJldHVybiB7XG4gICAgc2NvcGU6ICdmaWxlJyxcbiAgICBwcm92aWRlck5hbWU6ICdIYWNrJyxcbiAgICB0eXBlOiBpc1dhcm5pbmcgPyAnV2FybmluZycgOiAnRXJyb3InLFxuICAgIHRleHQ6IGlzV2FybmluZyA/IFdBUk5JTkdfTUVTU0FHRSA6IEVSUk9SX01FU1NBR0UsXG4gICAgZmlsZVBhdGg6IGZpbGVQYXRoLFxuICAgIHJhbmdlOiBuZXcgUmFuZ2UoW2xpbmUsIHJlZ2lvbi5zdGFydCAtIDFdLCBbbGluZSwgcmVnaW9uLmVuZF0pLFxuICB9O1xufVxuIl19