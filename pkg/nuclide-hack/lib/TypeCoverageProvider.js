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
//# sourceMappingURL=data:application/json;base64,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IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge0J1c3lTaWduYWxQcm92aWRlckJhc2V9IGZyb20gJy4uLy4uL251Y2xpZGUtYnVzeS1zaWduYWwtcHJvdmlkZXItYmFzZSc7XG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVEaWFnbm9zdGljTWVzc2FnZSxcbiAgTWVzc2FnZVVwZGF0ZUNhbGxiYWNrLFxuICBNZXNzYWdlSW52YWxpZGF0aW9uQ2FsbGJhY2ssXG59IGZyb20gJy4uLy4uL251Y2xpZGUtZGlhZ25vc3RpY3MtYmFzZSc7XG5pbXBvcnQgdHlwZSB7VHlwZUNvdmVyYWdlUmVnaW9ufSBmcm9tICcuL1R5cGVkUmVnaW9ucyc7XG5cbmltcG9ydCB7Z2V0SGFja0xhbmd1YWdlRm9yVXJpfSBmcm9tICcuL0hhY2tMYW5ndWFnZSc7XG5pbXBvcnQge0RpYWdub3N0aWNzUHJvdmlkZXJCYXNlfSBmcm9tICcuLi8uLi9udWNsaWRlLWRpYWdub3N0aWNzLXByb3ZpZGVyLWJhc2UnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBSYW5nZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5pbXBvcnQge3Byb21pc2VzfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHtleGlzdGluZ0VkaXRvckZvclVyaSwgb25XaWxsRGVzdHJveVRleHRCdWZmZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7SEFDS19HUkFNTUFSU19TRVR9IGZyb20gJy4uLy4uL251Y2xpZGUtaGFjay1jb21tb24nO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtbG9nZ2luZyc7XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuY29uc3Qge1JlcXVlc3RTZXJpYWxpemVyfSA9IHByb21pc2VzO1xuXG4vLyBQcm92aWRlcyBEaWFnbm9zdGljcyBmb3IgdW4tdHlwZWQgcmVnaW9ucyBvZiBIYWNrIGNvZGUuXG5leHBvcnQgY2xhc3MgVHlwZUNvdmVyYWdlUHJvdmlkZXIge1xuICBfcHJvdmlkZXJCYXNlOiBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZTtcbiAgX3JlcXVlc3RTZXJpYWxpemVyOiBSZXF1ZXN0U2VyaWFsaXplcjxBcnJheTxUeXBlQ292ZXJhZ2VSZWdpb24+PjtcbiAgX2J1c3lTaWduYWxQcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyQmFzZTtcbiAgX3N1YnNjcmlwdGlvbnM6IGF0b20kQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcihidXN5U2lnbmFsUHJvdmlkZXI6IEJ1c3lTaWduYWxQcm92aWRlckJhc2UpIHtcbiAgICB0aGlzLl9idXN5U2lnbmFsUHJvdmlkZXIgPSBidXN5U2lnbmFsUHJvdmlkZXI7XG4gICAgY29uc3Qgc2hvdWxkUnVuT25UaGVGbHkgPSBmYWxzZTtcbiAgICBjb25zdCB1dGlsc09wdGlvbnMgPSB7XG4gICAgICBncmFtbWFyU2NvcGVzOiBIQUNLX0dSQU1NQVJTX1NFVCxcbiAgICAgIHNob3VsZFJ1bk9uVGhlRmx5LFxuICAgICAgb25UZXh0RWRpdG9yRXZlbnQ6IGVkaXRvciA9PiB0aGlzLl9ydW5UeXBlQ292ZXJhZ2UoZWRpdG9yKSxcbiAgICAgIG9uTmV3VXBkYXRlU3Vic2NyaWJlcjogY2FsbGJhY2sgPT4gdGhpcy5fcmVjZWl2ZWROZXdVcGRhdGVTdWJzY3JpYmVyKGNhbGxiYWNrKSxcbiAgICB9O1xuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZSA9IG5ldyBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZSh1dGlsc09wdGlvbnMpO1xuICAgIHRoaXMuX3JlcXVlc3RTZXJpYWxpemVyID0gbmV3IFJlcXVlc3RTZXJpYWxpemVyKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQob25XaWxsRGVzdHJveVRleHRCdWZmZXIoYnVmZmVyID0+IHtcbiAgICAgIGNvbnN0IHBhdGg6ID9zdHJpbmcgPSBidWZmZXIuZ2V0UGF0aCgpO1xuICAgICAgaWYgKCFwYXRoKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5wdWJsaXNoTWVzc2FnZUludmFsaWRhdGlvbih7c2NvcGU6ICdmaWxlJywgZmlsZVBhdGhzOiBbcGF0aF19KTtcbiAgICB9KSk7XG5cbiAgICB0aGlzLl9jaGVja0V4aXN0aW5nQnVmZmVycygpO1xuICB9XG5cbiAgYXN5bmMgX2NoZWNrRXhpc3RpbmdCdWZmZXJzKCk6IFByb21pc2Uge1xuICAgIGNvbnN0IGV4aXN0aW5nRWRpdG9ycyA9IGF0b20ucHJvamVjdC5nZXRCdWZmZXJzKClcbiAgICAgIC5tYXAoYnVmZmVyID0+IHtcbiAgICAgICAgY29uc3QgcGF0aCA9IGJ1ZmZlci5nZXRQYXRoKCk7XG4gICAgICAgIGlmIChwYXRoID09IG51bGwgfHwgcGF0aCA9PT0gJycpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXhpc3RpbmdFZGl0b3JGb3JVcmkoYnVmZmVyLmdldFBhdGgoKSk7XG4gICAgICB9KVxuICAgICAgLmZpbHRlcihlZGl0b3IgPT4gZWRpdG9yICE9IG51bGwgJiYgSEFDS19HUkFNTUFSU19TRVQuaGFzKGVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lKSk7XG4gICAgZm9yIChjb25zdCBlZGl0b3Igb2YgZXhpc3RpbmdFZGl0b3JzKSB7XG4gICAgICBpbnZhcmlhbnQoZWRpdG9yKTtcbiAgICAgIC8qIGVzbGludC1kaXNhYmxlIGJhYmVsL25vLWF3YWl0LWluLWxvb3AgKi9cbiAgICAgIGF3YWl0IHRoaXMuX3J1blR5cGVDb3ZlcmFnZShlZGl0b3IpO1xuICAgICAgLyogZXNsaW50LWVuYWJsZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wICovXG4gICAgfVxuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9wcm92aWRlckJhc2UuZGlzcG9zZSgpO1xuICB9XG5cbiAgX3J1blR5cGVDb3ZlcmFnZSh0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX2J1c3lTaWduYWxQcm92aWRlci5yZXBvcnRCdXN5KFxuICAgICAgYEhhY2s6IFdhaXRpbmcgZm9yIHR5cGUgY292ZXJhZ2UgcmVzdWx0c2AsXG4gICAgICAoKSA9PiB0aGlzLl9ydW5UeXBlQ292ZXJhZ2VJbXBsKHRleHRFZGl0b3IpLFxuICAgICkuY2F0Y2goYXN5bmMgZSA9PiB7IGxvZ2dlci5lcnJvcihlKTsgfSk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2hhY2s6cnVuLXR5cGUtY292ZXJhZ2UnKVxuICBhc3luYyBfcnVuVHlwZUNvdmVyYWdlSW1wbCh0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZmlsZVBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAoZmlsZVBhdGggPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGhhY2tMYW5ndWFnZSA9IGF3YWl0IGdldEhhY2tMYW5ndWFnZUZvclVyaSh0ZXh0RWRpdG9yLmdldFBhdGgoKSk7XG4gICAgaWYgKGhhY2tMYW5ndWFnZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fcmVxdWVzdFNlcmlhbGl6ZXIucnVuKFxuICAgICAgaGFja0xhbmd1YWdlLmdldFR5cGVDb3ZlcmFnZShmaWxlUGF0aClcbiAgICApO1xuICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSAnb3V0ZGF0ZWQnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcmVnaW9uczogQXJyYXk8VHlwZUNvdmVyYWdlUmVnaW9uPiA9IHJlc3VsdC5yZXN1bHQ7XG4gICAgY29uc3QgZGlhZ25vc3RpY3MgPSByZWdpb25zLm1hcChyZWdpb24gPT4gY29udmVydFJlZ2lvblRvRGlhZ25vc3RpYyhmaWxlUGF0aCwgcmVnaW9uKSk7XG4gICAgY29uc3QgZGlhZ25vc3RpY3NVcGRhdGUgPSB7XG4gICAgICBmaWxlUGF0aFRvTWVzc2FnZXM6IG5ldyBNYXAoW1tmaWxlUGF0aCwgZGlhZ25vc3RpY3NdXSksXG4gICAgfTtcbiAgICB0aGlzLl9wcm92aWRlckJhc2UucHVibGlzaE1lc3NhZ2VVcGRhdGUoZGlhZ25vc3RpY3NVcGRhdGUpO1xuICB9XG5cbiAgX3JlY2VpdmVkTmV3VXBkYXRlU3Vic2NyaWJlcigpOiB2b2lkIHtcbiAgICAvLyBFdmVyeSB0aW1lIHdlIGdldCBhIG5ldyBzdWJzY3JpYmVyLCB3ZSBuZWVkIHRvIHB1c2ggcmVzdWx0cyB0byB0aGVtLiBUaGlzXG4gICAgLy8gbG9naWMgaXMgY29tbW9uIHRvIGFsbCBwcm92aWRlcnMgYW5kIHNob3VsZCBiZSBhYnN0cmFjdGVkIG91dCAodDc4MTMwNjkpXG4gICAgLy9cbiAgICAvLyBPbmNlIHdlIHByb3ZpZGUgYWxsIGRpYWdub3N0aWNzLCBpbnN0ZWFkIG9mIGp1c3QgdGhlIGN1cnJlbnQgZmlsZSwgd2UgY2FuXG4gICAgLy8gcHJvYmFibHkgcmVtb3ZlIHRoZSBhY3RpdmVUZXh0RWRpdG9yIHBhcmFtZXRlci5cbiAgICBjb25zdCBhY3RpdmVUZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmIChhY3RpdmVUZXh0RWRpdG9yKSB7XG4gICAgICBpZiAoSEFDS19HUkFNTUFSU19TRVQuaGFzKGFjdGl2ZVRleHRFZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSkpIHtcbiAgICAgICAgdGhpcy5fcnVuVHlwZUNvdmVyYWdlKGFjdGl2ZVRleHRFZGl0b3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG9uTWVzc2FnZVVwZGF0ZShjYWxsYmFjazogTWVzc2FnZVVwZGF0ZUNhbGxiYWNrKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9wcm92aWRlckJhc2Uub25NZXNzYWdlVXBkYXRlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjazogTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9wcm92aWRlckJhc2Uub25NZXNzYWdlSW52YWxpZGF0aW9uKGNhbGxiYWNrKTtcbiAgfVxufVxuXG5jb25zdCBFUlJPUl9NRVNTQUdFID0gJ1VuLXR5cGUgY2hlY2tlZCBjb2RlLiBDb25zaWRlciBhZGRpbmcgdHlwZSBhbm5vdGF0aW9ucy4nO1xuY29uc3QgV0FSTklOR19NRVNTQUdFID0gJ1BhcnRpYWxseSB0eXBlIGNoZWNrZWQgY29kZS4gQ29uc2lkZXIgYWRkaW5nIHR5cGUgYW5ub3RhdGlvbnMuJztcblxuZnVuY3Rpb24gY29udmVydFJlZ2lvblRvRGlhZ25vc3RpYyhmaWxlUGF0aDogTnVjbGlkZVVyaSwgcmVnaW9uOiBUeXBlQ292ZXJhZ2VSZWdpb24pXG4gICAgOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2Uge1xuICBjb25zdCBpc1dhcm5pbmcgPSByZWdpb24udHlwZSA9PT0gJ3BhcnRpYWwnO1xuICBjb25zdCBsaW5lID0gcmVnaW9uLmxpbmUgLSAxO1xuICByZXR1cm4ge1xuICAgIHNjb3BlOiAnZmlsZScsXG4gICAgcHJvdmlkZXJOYW1lOiAnSGFjaycsXG4gICAgdHlwZTogaXNXYXJuaW5nID8gJ1dhcm5pbmcnIDogJ0Vycm9yJyxcbiAgICB0ZXh0OiBpc1dhcm5pbmcgPyBXQVJOSU5HX01FU1NBR0UgOiBFUlJPUl9NRVNTQUdFLFxuICAgIGZpbGVQYXRoOiBmaWxlUGF0aCxcbiAgICByYW5nZTogbmV3IFJhbmdlKFtsaW5lLCByZWdpb24uc3RhcnQgLSAxXSwgW2xpbmUsIHJlZ2lvbi5lbmRdKSxcbiAgfTtcbn1cbiJdfQ==