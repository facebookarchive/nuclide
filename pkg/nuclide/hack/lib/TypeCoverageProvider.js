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

var _diagnosticsProviderBase = require('../../diagnostics/provider-base');

var _atom = require('atom');

var _analytics = require('../../analytics');

var _commons = require('../../commons');

var _atomHelpers = require('../../atom-helpers');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _hackCommonLibConstants = require('../../hack-common/lib/constants');

var _logging = require('../../logging');

var logger = (0, _logging.getLogger)();
var RequestSerializer = _commons.promises.RequestSerializer;

// Provides Diagnostics for un-typed regions of Hack code.

var TypeCoverageProvider = (function () {
  function TypeCoverageProvider(busySignalProvider) {
    var _this = this;

    _classCallCheck(this, TypeCoverageProvider);

    this._busySignalProvider = busySignalProvider;
    var shouldRunOnTheFly = false;
    var utilsOptions = {
      grammarScopes: _hackCommonLibConstants.HACK_GRAMMARS_SET,
      shouldRunOnTheFly: shouldRunOnTheFly,
      onTextEditorEvent: function onTextEditorEvent(editor) {
        return _this._runTypeCoverage(editor);
      },
      onNewUpdateSubscriber: function onNewUpdateSubscriber(callback) {
        return _this._receivedNewUpdateSubscriber(callback);
      }
    };
    this._providerBase = new _diagnosticsProviderBase.DiagnosticsProviderBase(utilsOptions);
    this._requestSerializer = new RequestSerializer();
    this._subscriptions = new _atom.CompositeDisposable();
    this._subscriptions.add((0, _atomHelpers.onWillDestroyTextBuffer)(function (buffer) {
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
        return (0, _atomHelpers.existingEditorForUri)(buffer.getPath());
      }).filter(function (editor) {
        return editor != null && _hackCommonLibConstants.HACK_GRAMMARS_SET.has(editor.getGrammar().scopeName);
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
    decorators: [(0, _analytics.trackTiming)('hack:run-type-coverage')],
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
        if (_hackCommonLibConstants.HACK_GRAMMARS_SET.has(activeTextEditor.getGrammar().scopeName)) {
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
//# sourceMappingURL=data:application/json;base64,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dXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7QnVzeVNpZ25hbFByb3ZpZGVyQmFzZX0gZnJvbSAnLi4vLi4vYnVzeS1zaWduYWwtcHJvdmlkZXItYmFzZSc7XG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVEaWFnbm9zdGljTWVzc2FnZSxcbiAgTWVzc2FnZVVwZGF0ZUNhbGxiYWNrLFxuICBNZXNzYWdlSW52YWxpZGF0aW9uQ2FsbGJhY2ssXG59IGZyb20gJy4uLy4uL2RpYWdub3N0aWNzL2Jhc2UnO1xuaW1wb3J0IHR5cGUge1R5cGVDb3ZlcmFnZVJlZ2lvbn0gZnJvbSAnLi9UeXBlZFJlZ2lvbnMnO1xuXG5pbXBvcnQge2dldEhhY2tMYW5ndWFnZUZvclVyaX0gZnJvbSAnLi9oYWNrJztcbmltcG9ydCB7RGlhZ25vc3RpY3NQcm92aWRlckJhc2V9IGZyb20gJy4uLy4uL2RpYWdub3N0aWNzL3Byb3ZpZGVyLWJhc2UnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBSYW5nZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IHtwcm9taXNlc30gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQge2V4aXN0aW5nRWRpdG9yRm9yVXJpLCBvbldpbGxEZXN0cm95VGV4dEJ1ZmZlcn0gZnJvbSAnLi4vLi4vYXRvbS1oZWxwZXJzJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7SEFDS19HUkFNTUFSU19TRVR9IGZyb20gJy4uLy4uL2hhY2stY29tbW9uL2xpYi9jb25zdGFudHMnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuXG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcbmNvbnN0IHtSZXF1ZXN0U2VyaWFsaXplcn0gPSBwcm9taXNlcztcblxuLy8gUHJvdmlkZXMgRGlhZ25vc3RpY3MgZm9yIHVuLXR5cGVkIHJlZ2lvbnMgb2YgSGFjayBjb2RlLlxuZXhwb3J0IGNsYXNzIFR5cGVDb3ZlcmFnZVByb3ZpZGVyIHtcbiAgX3Byb3ZpZGVyQmFzZTogRGlhZ25vc3RpY3NQcm92aWRlckJhc2U7XG4gIF9yZXF1ZXN0U2VyaWFsaXplcjogUmVxdWVzdFNlcmlhbGl6ZXI8QXJyYXk8VHlwZUNvdmVyYWdlUmVnaW9uPj47XG4gIF9idXN5U2lnbmFsUHJvdmlkZXI6IEJ1c3lTaWduYWxQcm92aWRlckJhc2U7XG4gIF9zdWJzY3JpcHRpb25zOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoYnVzeVNpZ25hbFByb3ZpZGVyOiBCdXN5U2lnbmFsUHJvdmlkZXJCYXNlKSB7XG4gICAgdGhpcy5fYnVzeVNpZ25hbFByb3ZpZGVyID0gYnVzeVNpZ25hbFByb3ZpZGVyO1xuICAgIGNvbnN0IHNob3VsZFJ1bk9uVGhlRmx5ID0gZmFsc2U7XG4gICAgY29uc3QgdXRpbHNPcHRpb25zID0ge1xuICAgICAgZ3JhbW1hclNjb3BlczogSEFDS19HUkFNTUFSU19TRVQsXG4gICAgICBzaG91bGRSdW5PblRoZUZseSxcbiAgICAgIG9uVGV4dEVkaXRvckV2ZW50OiBlZGl0b3IgPT4gdGhpcy5fcnVuVHlwZUNvdmVyYWdlKGVkaXRvciksXG4gICAgICBvbk5ld1VwZGF0ZVN1YnNjcmliZXI6IGNhbGxiYWNrID0+IHRoaXMuX3JlY2VpdmVkTmV3VXBkYXRlU3Vic2NyaWJlcihjYWxsYmFjayksXG4gICAgfTtcbiAgICB0aGlzLl9wcm92aWRlckJhc2UgPSBuZXcgRGlhZ25vc3RpY3NQcm92aWRlckJhc2UodXRpbHNPcHRpb25zKTtcbiAgICB0aGlzLl9yZXF1ZXN0U2VyaWFsaXplciA9IG5ldyBSZXF1ZXN0U2VyaWFsaXplcigpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKG9uV2lsbERlc3Ryb3lUZXh0QnVmZmVyKGJ1ZmZlciA9PiB7XG4gICAgICBjb25zdCBwYXRoOiA/c3RyaW5nID0gYnVmZmVyLmdldFBhdGgoKTtcbiAgICAgIGlmICghcGF0aCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl9wcm92aWRlckJhc2UucHVibGlzaE1lc3NhZ2VJbnZhbGlkYXRpb24oe3Njb3BlOiAnZmlsZScsIGZpbGVQYXRoczogW3BhdGhdfSk7XG4gICAgfSkpO1xuXG4gICAgdGhpcy5fY2hlY2tFeGlzdGluZ0J1ZmZlcnMoKTtcbiAgfVxuXG4gIGFzeW5jIF9jaGVja0V4aXN0aW5nQnVmZmVycygpOiBQcm9taXNlIHtcbiAgICBjb25zdCBleGlzdGluZ0VkaXRvcnMgPSBhdG9tLnByb2plY3QuZ2V0QnVmZmVycygpXG4gICAgICAubWFwKGJ1ZmZlciA9PiB7XG4gICAgICAgIGNvbnN0IHBhdGggPSBidWZmZXIuZ2V0UGF0aCgpO1xuICAgICAgICBpZiAocGF0aCA9PSBudWxsIHx8IHBhdGggPT09ICcnKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV4aXN0aW5nRWRpdG9yRm9yVXJpKGJ1ZmZlci5nZXRQYXRoKCkpO1xuICAgICAgfSlcbiAgICAgIC5maWx0ZXIoZWRpdG9yID0+IGVkaXRvciAhPSBudWxsICYmIEhBQ0tfR1JBTU1BUlNfU0VULmhhcyhlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSkpO1xuICAgIGZvciAoY29uc3QgZWRpdG9yIG9mIGV4aXN0aW5nRWRpdG9ycykge1xuICAgICAgaW52YXJpYW50KGVkaXRvcik7XG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wICovXG4gICAgICBhd2FpdCB0aGlzLl9ydW5UeXBlQ292ZXJhZ2UoZWRpdG9yKTtcbiAgICAgIC8qIGVzbGludC1lbmFibGUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcCAqL1xuICAgIH1cbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9ydW5UeXBlQ292ZXJhZ2UodGV4dEVkaXRvcjogVGV4dEVkaXRvcik6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9idXN5U2lnbmFsUHJvdmlkZXIucmVwb3J0QnVzeShcbiAgICAgIGBIYWNrOiBXYWl0aW5nIGZvciB0eXBlIGNvdmVyYWdlIHJlc3VsdHNgLFxuICAgICAgKCkgPT4gdGhpcy5fcnVuVHlwZUNvdmVyYWdlSW1wbCh0ZXh0RWRpdG9yKSxcbiAgICApLmNhdGNoKGFzeW5jIGUgPT4geyBsb2dnZXIuZXJyb3IoZSk7IH0pO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdoYWNrOnJ1bi10eXBlLWNvdmVyYWdlJylcbiAgYXN5bmMgX3J1blR5cGVDb3ZlcmFnZUltcGwodGV4dEVkaXRvcjogVGV4dEVkaXRvcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgaWYgKGZpbGVQYXRoID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBoYWNrTGFuZ3VhZ2UgPSBhd2FpdCBnZXRIYWNrTGFuZ3VhZ2VGb3JVcmkodGV4dEVkaXRvci5nZXRQYXRoKCkpO1xuICAgIGlmIChoYWNrTGFuZ3VhZ2UgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX3JlcXVlc3RTZXJpYWxpemVyLnJ1bihcbiAgICAgIGhhY2tMYW5ndWFnZS5nZXRUeXBlQ292ZXJhZ2UoZmlsZVBhdGgpXG4gICAgKTtcbiAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ291dGRhdGVkJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHJlZ2lvbnM6IEFycmF5PFR5cGVDb3ZlcmFnZVJlZ2lvbj4gPSByZXN1bHQucmVzdWx0O1xuICAgIGNvbnN0IGRpYWdub3N0aWNzID0gcmVnaW9ucy5tYXAocmVnaW9uID0+IGNvbnZlcnRSZWdpb25Ub0RpYWdub3N0aWMoZmlsZVBhdGgsIHJlZ2lvbikpO1xuICAgIGNvbnN0IGRpYWdub3N0aWNzVXBkYXRlID0ge1xuICAgICAgZmlsZVBhdGhUb01lc3NhZ2VzOiBuZXcgTWFwKFtbZmlsZVBhdGgsIGRpYWdub3N0aWNzXV0pLFxuICAgIH07XG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlVXBkYXRlKGRpYWdub3N0aWNzVXBkYXRlKTtcbiAgfVxuXG4gIF9yZWNlaXZlZE5ld1VwZGF0ZVN1YnNjcmliZXIoKTogdm9pZCB7XG4gICAgLy8gRXZlcnkgdGltZSB3ZSBnZXQgYSBuZXcgc3Vic2NyaWJlciwgd2UgbmVlZCB0byBwdXNoIHJlc3VsdHMgdG8gdGhlbS4gVGhpc1xuICAgIC8vIGxvZ2ljIGlzIGNvbW1vbiB0byBhbGwgcHJvdmlkZXJzIGFuZCBzaG91bGQgYmUgYWJzdHJhY3RlZCBvdXQgKHQ3ODEzMDY5KVxuICAgIC8vXG4gICAgLy8gT25jZSB3ZSBwcm92aWRlIGFsbCBkaWFnbm9zdGljcywgaW5zdGVhZCBvZiBqdXN0IHRoZSBjdXJyZW50IGZpbGUsIHdlIGNhblxuICAgIC8vIHByb2JhYmx5IHJlbW92ZSB0aGUgYWN0aXZlVGV4dEVkaXRvciBwYXJhbWV0ZXIuXG4gICAgY29uc3QgYWN0aXZlVGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoYWN0aXZlVGV4dEVkaXRvcikge1xuICAgICAgaWYgKEhBQ0tfR1JBTU1BUlNfU0VULmhhcyhhY3RpdmVUZXh0RWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUpKSB7XG4gICAgICAgIHRoaXMuX3J1blR5cGVDb3ZlcmFnZShhY3RpdmVUZXh0RWRpdG9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBvbk1lc3NhZ2VVcGRhdGUoY2FsbGJhY2s6IE1lc3NhZ2VVcGRhdGVDYWxsYmFjayk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvdmlkZXJCYXNlLm9uTWVzc2FnZVVwZGF0ZShjYWxsYmFjayk7XG4gIH1cblxuICBvbk1lc3NhZ2VJbnZhbGlkYXRpb24oY2FsbGJhY2s6IE1lc3NhZ2VJbnZhbGlkYXRpb25DYWxsYmFjayk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvdmlkZXJCYXNlLm9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjayk7XG4gIH1cbn1cblxuY29uc3QgRVJST1JfTUVTU0FHRSA9ICdVbi10eXBlIGNoZWNrZWQgY29kZS4gQ29uc2lkZXIgYWRkaW5nIHR5cGUgYW5ub3RhdGlvbnMuJztcbmNvbnN0IFdBUk5JTkdfTUVTU0FHRSA9ICdQYXJ0aWFsbHkgdHlwZSBjaGVja2VkIGNvZGUuIENvbnNpZGVyIGFkZGluZyB0eXBlIGFubm90YXRpb25zLic7XG5cbmZ1bmN0aW9uIGNvbnZlcnRSZWdpb25Ub0RpYWdub3N0aWMoZmlsZVBhdGg6IE51Y2xpZGVVcmksIHJlZ2lvbjogVHlwZUNvdmVyYWdlUmVnaW9uKVxuICAgIDogRmlsZURpYWdub3N0aWNNZXNzYWdlIHtcbiAgY29uc3QgaXNXYXJuaW5nID0gcmVnaW9uLnR5cGUgPT09ICdwYXJ0aWFsJztcbiAgY29uc3QgbGluZSA9IHJlZ2lvbi5saW5lIC0gMTtcbiAgcmV0dXJuIHtcbiAgICBzY29wZTogJ2ZpbGUnLFxuICAgIHByb3ZpZGVyTmFtZTogJ0hhY2snLFxuICAgIHR5cGU6IGlzV2FybmluZyA/ICdXYXJuaW5nJyA6ICdFcnJvcicsXG4gICAgdGV4dDogaXNXYXJuaW5nID8gV0FSTklOR19NRVNTQUdFIDogRVJST1JfTUVTU0FHRSxcbiAgICBmaWxlUGF0aDogZmlsZVBhdGgsXG4gICAgcmFuZ2U6IG5ldyBSYW5nZShbbGluZSwgcmVnaW9uLnN0YXJ0IC0gMV0sIFtsaW5lLCByZWdpb24uZW5kXSksXG4gIH07XG59XG4iXX0=