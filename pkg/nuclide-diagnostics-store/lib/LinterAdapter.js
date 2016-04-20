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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.linterMessageToDiagnosticMessage = linterMessageToDiagnosticMessage;
exports.linterMessagesToDiagnosticUpdate = linterMessagesToDiagnosticUpdate;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _nuclideDiagnosticsProviderBase = require('../../nuclide-diagnostics-provider-base');

var _nuclideCommons = require('../../nuclide-commons');

var RequestSerializer = _nuclideCommons.promises.RequestSerializer;

// Exported for testing.

function linterMessageToDiagnosticMessage(msg, providerName) {
  // The types are slightly different, so we need to copy to make Flow happy. Basically, a Trace
  // does not need a filePath property, but a LinterTrace does. Trace is a subtype of LinterTrace,
  // so copying works but aliasing does not. For a detailed explanation see
  // https://github.com/facebook/flow/issues/908
  var trace = msg.trace ? msg.trace.map(function (component) {
    return _extends({}, component);
  }) : undefined;
  if (msg.filePath) {
    return {
      scope: 'file',
      providerName: providerName,
      type: msg.type,
      filePath: msg.filePath,
      text: msg.text,
      html: msg.html,
      range: msg.range && _atom.Range.fromObject(msg.range),
      trace: trace,
      fix: msg.fix == null ? undefined : {
        oldRange: msg.fix.range,
        oldText: msg.fix.oldText,
        newText: msg.fix.newText
      }
    };
  } else {
    return {
      scope: 'project',
      providerName: providerName,
      type: msg.type,
      text: msg.text,
      html: msg.html,
      range: msg.range && _atom.Range.fromObject(msg.range),
      trace: trace
    };
  }
}

// Exported for testing.

function linterMessagesToDiagnosticUpdate(currentPath, msgs) {
  var providerName = arguments.length <= 2 || arguments[2] === undefined ? 'Unnamed Linter' : arguments[2];

  var filePathToMessages = new Map();
  if (currentPath) {
    // Make sure we invalidate the messages for the current path. We may want to
    // figure out which other paths we want to invalidate if it turns out that
    // linters regularly return messages for other files.
    filePathToMessages.set(currentPath, []);
  }
  var projectMessages = [];
  for (var msg of msgs) {
    var diagnosticMessage = linterMessageToDiagnosticMessage(msg, providerName);
    if (diagnosticMessage.scope === 'file') {
      var path = diagnosticMessage.filePath;
      var messages = filePathToMessages.get(path);
      if (messages == null) {
        messages = [];
        filePathToMessages.set(path, messages);
      }
      messages.push(diagnosticMessage);
    } else {
      // Project scope.
      projectMessages.push(diagnosticMessage);
    }
  }
  return {
    filePathToMessages: filePathToMessages,
    projectMessages: projectMessages
  };
}

/**
 * Provides an adapter between legacy linters (defined by the LinterProvider
 * type), and Nuclide Diagnostic Providers.
 *
 * The constructor takes a LinterProvider as an argument, and the resulting
 * LinterAdapter is a valid DiagnosticProvider.
 *
 * Note that this allows an extension to ordinary LinterProviders. We allow an
 * optional additional field, providerName, to indicate the display name of the
 * linter.
 */

var LinterAdapter = (function () {
  function LinterAdapter(provider) {
    var _this = this;

    var ProviderBase = arguments.length <= 1 || arguments[1] === undefined ? _nuclideDiagnosticsProviderBase.DiagnosticsProviderBase : arguments[1];

    _classCallCheck(this, LinterAdapter);

    var utilsOptions = {
      grammarScopes: new Set(provider.grammarScopes),
      enableForAllGrammars: provider.allGrammarScopes,
      shouldRunOnTheFly: provider.lintOnFly,
      onTextEditorEvent: function onTextEditorEvent(editor) {
        return _this._runLint(editor);
      },
      onNewUpdateSubscriber: function onNewUpdateSubscriber(callback) {
        return _this._newUpdateSubscriber(callback);
      }
    };
    this._providerUtils = new ProviderBase(utilsOptions);
    this._provider = provider;
    this._enabled = true;
    this._requestSerializer = new RequestSerializer();
  }

  _createClass(LinterAdapter, [{
    key: '_runLint',
    value: _asyncToGenerator(function* (editor) {
      if (this._enabled) {
        var result = yield this._requestSerializer.run(this._provider.lint(editor));
        if (result.status === 'success') {
          var linterMessages = result.result;
          var diagnosticUpdate = linterMessagesToDiagnosticUpdate(editor.getPath(), linterMessages, this._provider.providerName || this._provider.name);
          this._providerUtils.publishMessageUpdate(diagnosticUpdate);
        }
      }
    })
  }, {
    key: '_newUpdateSubscriber',
    value: function _newUpdateSubscriber(callback) {
      var activeTextEditor = atom.workspace.getActiveTextEditor();
      if (activeTextEditor) {
        var matchesGrammar = this._provider.grammarScopes.indexOf(activeTextEditor.getGrammar().scopeName) !== -1;
        if (!this._lintInProgress() && matchesGrammar) {
          this._runLint(activeTextEditor);
        }
      }
    }
  }, {
    key: 'setEnabled',
    value: function setEnabled(enabled) {
      this._enabled = enabled;
    }
  }, {
    key: 'setLintOnFly',
    value: function setLintOnFly(lintOnFly) {
      this._providerUtils.setRunOnTheFly(lintOnFly && this._provider.lintOnFly);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._providerUtils.dispose();
    }
  }, {
    key: '_lintInProgress',
    value: function _lintInProgress() {
      return this._requestSerializer.isRunInProgress();
    }
  }, {
    key: 'onMessageUpdate',
    value: function onMessageUpdate(callback) {
      return this._providerUtils.onMessageUpdate(callback);
    }
  }, {
    key: 'onMessageInvalidation',
    value: function onMessageInvalidation(callback) {
      return this._providerUtils.onMessageInvalidation(callback);
    }
  }]);

  return LinterAdapter;
})();

exports.LinterAdapter = LinterAdapter;
//# sourceMappingURL=data:application/json;base64,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b0IsK0JBQUMsUUFBcUMsRUFBZTtBQUN4RSxhQUFPLElBQUksQ0FBQyxjQUFjLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDNUQ7OztTQXpFVSxhQUFhIiwiZmlsZSI6IkxpbnRlckFkYXB0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcblxuaW1wb3J0IHR5cGUge1xuICBEaWFnbm9zdGljTWVzc2FnZSxcbiAgRGlhZ25vc3RpY1Byb3ZpZGVyVXBkYXRlLFxuICBGaWxlRGlhZ25vc3RpY01lc3NhZ2UsXG4gIExpbnRlck1lc3NhZ2UsXG4gIExpbnRlclByb3ZpZGVyLFxuICBQcm9qZWN0RGlhZ25vc3RpY01lc3NhZ2UsXG4gIE1lc3NhZ2VVcGRhdGVDYWxsYmFjayxcbiAgTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRpYWdub3N0aWNzLWJhc2UnO1xuXG5pbXBvcnQge1JhbmdlfSBmcm9tICdhdG9tJztcblxuaW1wb3J0IHtEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kaWFnbm9zdGljcy1wcm92aWRlci1iYXNlJztcblxuaW1wb3J0IHtwcm9taXNlcyBhcyBjb21tb25zUHJvbWlzZXN9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5cbmNvbnN0IHtSZXF1ZXN0U2VyaWFsaXplcn0gPSBjb21tb25zUHJvbWlzZXM7XG5cbi8vIEV4cG9ydGVkIGZvciB0ZXN0aW5nLlxuZXhwb3J0IGZ1bmN0aW9uIGxpbnRlck1lc3NhZ2VUb0RpYWdub3N0aWNNZXNzYWdlKFxuICBtc2c6IExpbnRlck1lc3NhZ2UsXG4gIHByb3ZpZGVyTmFtZTogc3RyaW5nLFxuKTogRGlhZ25vc3RpY01lc3NhZ2Uge1xuICAvLyBUaGUgdHlwZXMgYXJlIHNsaWdodGx5IGRpZmZlcmVudCwgc28gd2UgbmVlZCB0byBjb3B5IHRvIG1ha2UgRmxvdyBoYXBweS4gQmFzaWNhbGx5LCBhIFRyYWNlXG4gIC8vIGRvZXMgbm90IG5lZWQgYSBmaWxlUGF0aCBwcm9wZXJ0eSwgYnV0IGEgTGludGVyVHJhY2UgZG9lcy4gVHJhY2UgaXMgYSBzdWJ0eXBlIG9mIExpbnRlclRyYWNlLFxuICAvLyBzbyBjb3B5aW5nIHdvcmtzIGJ1dCBhbGlhc2luZyBkb2VzIG5vdC4gRm9yIGEgZGV0YWlsZWQgZXhwbGFuYXRpb24gc2VlXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9mbG93L2lzc3Vlcy85MDhcbiAgY29uc3QgdHJhY2UgPSBtc2cudHJhY2UgPyBtc2cudHJhY2UubWFwKGNvbXBvbmVudCA9PiAoey4uLmNvbXBvbmVudH0pKSA6IHVuZGVmaW5lZDtcbiAgaWYgKG1zZy5maWxlUGF0aCkge1xuICAgIHJldHVybiAoe1xuICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgIHByb3ZpZGVyTmFtZSxcbiAgICAgIHR5cGU6IG1zZy50eXBlLFxuICAgICAgZmlsZVBhdGg6IG1zZy5maWxlUGF0aCxcbiAgICAgIHRleHQ6IG1zZy50ZXh0LFxuICAgICAgaHRtbDogbXNnLmh0bWwsXG4gICAgICByYW5nZTogbXNnLnJhbmdlICYmIFJhbmdlLmZyb21PYmplY3QobXNnLnJhbmdlKSxcbiAgICAgIHRyYWNlOiB0cmFjZSxcbiAgICAgIGZpeDogbXNnLmZpeCA9PSBudWxsID8gdW5kZWZpbmVkIDoge1xuICAgICAgICBvbGRSYW5nZTogbXNnLmZpeC5yYW5nZSxcbiAgICAgICAgb2xkVGV4dDogbXNnLmZpeC5vbGRUZXh0LFxuICAgICAgICBuZXdUZXh0OiBtc2cuZml4Lm5ld1RleHQsXG4gICAgICB9LFxuICAgIH06IEZpbGVEaWFnbm9zdGljTWVzc2FnZSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICh7XG4gICAgICBzY29wZTogJ3Byb2plY3QnLFxuICAgICAgcHJvdmlkZXJOYW1lLFxuICAgICAgdHlwZTogbXNnLnR5cGUsXG4gICAgICB0ZXh0OiBtc2cudGV4dCxcbiAgICAgIGh0bWw6IG1zZy5odG1sLFxuICAgICAgcmFuZ2U6IG1zZy5yYW5nZSAmJiBSYW5nZS5mcm9tT2JqZWN0KG1zZy5yYW5nZSksXG4gICAgICB0cmFjZTogdHJhY2UsXG4gICAgfTogUHJvamVjdERpYWdub3N0aWNNZXNzYWdlKTtcbiAgfVxufVxuXG4vLyBFeHBvcnRlZCBmb3IgdGVzdGluZy5cbmV4cG9ydCBmdW5jdGlvbiBsaW50ZXJNZXNzYWdlc1RvRGlhZ25vc3RpY1VwZGF0ZShcbiAgY3VycmVudFBhdGg6ID9OdWNsaWRlVXJpLFxuICBtc2dzOiBBcnJheTxMaW50ZXJNZXNzYWdlPixcbiAgcHJvdmlkZXJOYW1lPzogc3RyaW5nID0gJ1VubmFtZWQgTGludGVyJyxcbik6IERpYWdub3N0aWNQcm92aWRlclVwZGF0ZSB7XG4gIGNvbnN0IGZpbGVQYXRoVG9NZXNzYWdlczogTWFwPE51Y2xpZGVVcmksIEFycmF5PEZpbGVEaWFnbm9zdGljTWVzc2FnZT4+ID0gbmV3IE1hcCgpO1xuICBpZiAoY3VycmVudFBhdGgpIHtcbiAgICAvLyBNYWtlIHN1cmUgd2UgaW52YWxpZGF0ZSB0aGUgbWVzc2FnZXMgZm9yIHRoZSBjdXJyZW50IHBhdGguIFdlIG1heSB3YW50IHRvXG4gICAgLy8gZmlndXJlIG91dCB3aGljaCBvdGhlciBwYXRocyB3ZSB3YW50IHRvIGludmFsaWRhdGUgaWYgaXQgdHVybnMgb3V0IHRoYXRcbiAgICAvLyBsaW50ZXJzIHJlZ3VsYXJseSByZXR1cm4gbWVzc2FnZXMgZm9yIG90aGVyIGZpbGVzLlxuICAgIGZpbGVQYXRoVG9NZXNzYWdlcy5zZXQoY3VycmVudFBhdGgsIFtdKTtcbiAgfVxuICBjb25zdCBwcm9qZWN0TWVzc2FnZXMgPSBbXTtcbiAgZm9yIChjb25zdCBtc2cgb2YgbXNncykge1xuICAgIGNvbnN0IGRpYWdub3N0aWNNZXNzYWdlID0gbGludGVyTWVzc2FnZVRvRGlhZ25vc3RpY01lc3NhZ2UobXNnLCBwcm92aWRlck5hbWUpO1xuICAgIGlmIChkaWFnbm9zdGljTWVzc2FnZS5zY29wZSA9PT0gJ2ZpbGUnKSB7XG4gICAgICBjb25zdCBwYXRoID0gZGlhZ25vc3RpY01lc3NhZ2UuZmlsZVBhdGg7XG4gICAgICBsZXQgbWVzc2FnZXMgPSBmaWxlUGF0aFRvTWVzc2FnZXMuZ2V0KHBhdGgpO1xuICAgICAgaWYgKG1lc3NhZ2VzID09IG51bGwpIHtcbiAgICAgICAgbWVzc2FnZXMgPSBbXTtcbiAgICAgICAgZmlsZVBhdGhUb01lc3NhZ2VzLnNldChwYXRoLCBtZXNzYWdlcyk7XG4gICAgICB9XG4gICAgICBtZXNzYWdlcy5wdXNoKGRpYWdub3N0aWNNZXNzYWdlKTtcbiAgICB9IGVsc2UgeyAvLyBQcm9qZWN0IHNjb3BlLlxuICAgICAgcHJvamVjdE1lc3NhZ2VzLnB1c2goZGlhZ25vc3RpY01lc3NhZ2UpO1xuICAgIH1cbiAgfVxuICByZXR1cm4ge1xuICAgIGZpbGVQYXRoVG9NZXNzYWdlcyxcbiAgICBwcm9qZWN0TWVzc2FnZXMsXG4gIH07XG59XG5cbi8qKlxuICogUHJvdmlkZXMgYW4gYWRhcHRlciBiZXR3ZWVuIGxlZ2FjeSBsaW50ZXJzIChkZWZpbmVkIGJ5IHRoZSBMaW50ZXJQcm92aWRlclxuICogdHlwZSksIGFuZCBOdWNsaWRlIERpYWdub3N0aWMgUHJvdmlkZXJzLlxuICpcbiAqIFRoZSBjb25zdHJ1Y3RvciB0YWtlcyBhIExpbnRlclByb3ZpZGVyIGFzIGFuIGFyZ3VtZW50LCBhbmQgdGhlIHJlc3VsdGluZ1xuICogTGludGVyQWRhcHRlciBpcyBhIHZhbGlkIERpYWdub3N0aWNQcm92aWRlci5cbiAqXG4gKiBOb3RlIHRoYXQgdGhpcyBhbGxvd3MgYW4gZXh0ZW5zaW9uIHRvIG9yZGluYXJ5IExpbnRlclByb3ZpZGVycy4gV2UgYWxsb3cgYW5cbiAqIG9wdGlvbmFsIGFkZGl0aW9uYWwgZmllbGQsIHByb3ZpZGVyTmFtZSwgdG8gaW5kaWNhdGUgdGhlIGRpc3BsYXkgbmFtZSBvZiB0aGVcbiAqIGxpbnRlci5cbiAqL1xuZXhwb3J0IGNsYXNzIExpbnRlckFkYXB0ZXIge1xuICBfcHJvdmlkZXI6IExpbnRlclByb3ZpZGVyO1xuXG4gIF9lbmFibGVkOiBib29sZWFuO1xuXG4gIF9yZXF1ZXN0U2VyaWFsaXplcjogUmVxdWVzdFNlcmlhbGl6ZXI7XG5cbiAgX3Byb3ZpZGVyVXRpbHM6IERpYWdub3N0aWNzUHJvdmlkZXJCYXNlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByb3ZpZGVyOiBMaW50ZXJQcm92aWRlcixcbiAgICBQcm92aWRlckJhc2U/OiB0eXBlb2YgRGlhZ25vc3RpY3NQcm92aWRlckJhc2UgPSBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZSxcbiAgKSB7XG4gICAgY29uc3QgdXRpbHNPcHRpb25zID0ge1xuICAgICAgZ3JhbW1hclNjb3BlczogbmV3IFNldChwcm92aWRlci5ncmFtbWFyU2NvcGVzKSxcbiAgICAgIGVuYWJsZUZvckFsbEdyYW1tYXJzOiBwcm92aWRlci5hbGxHcmFtbWFyU2NvcGVzLFxuICAgICAgc2hvdWxkUnVuT25UaGVGbHk6IHByb3ZpZGVyLmxpbnRPbkZseSxcbiAgICAgIG9uVGV4dEVkaXRvckV2ZW50OiBlZGl0b3IgPT4gdGhpcy5fcnVuTGludChlZGl0b3IpLFxuICAgICAgb25OZXdVcGRhdGVTdWJzY3JpYmVyOiBjYWxsYmFjayA9PiB0aGlzLl9uZXdVcGRhdGVTdWJzY3JpYmVyKGNhbGxiYWNrKSxcbiAgICB9O1xuICAgIHRoaXMuX3Byb3ZpZGVyVXRpbHMgPSBuZXcgUHJvdmlkZXJCYXNlKHV0aWxzT3B0aW9ucyk7XG4gICAgdGhpcy5fcHJvdmlkZXIgPSBwcm92aWRlcjtcbiAgICB0aGlzLl9lbmFibGVkID0gdHJ1ZTtcbiAgICB0aGlzLl9yZXF1ZXN0U2VyaWFsaXplciA9IG5ldyBSZXF1ZXN0U2VyaWFsaXplcigpO1xuICB9XG5cbiAgYXN5bmMgX3J1bkxpbnQoZWRpdG9yOiBUZXh0RWRpdG9yKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuX2VuYWJsZWQpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX3JlcXVlc3RTZXJpYWxpemVyLnJ1bih0aGlzLl9wcm92aWRlci5saW50KGVkaXRvcikpO1xuICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09ICdzdWNjZXNzJykge1xuICAgICAgICBjb25zdCBsaW50ZXJNZXNzYWdlcyA9IHJlc3VsdC5yZXN1bHQ7XG4gICAgICAgIGNvbnN0IGRpYWdub3N0aWNVcGRhdGUgPSBsaW50ZXJNZXNzYWdlc1RvRGlhZ25vc3RpY1VwZGF0ZShcbiAgICAgICAgICBlZGl0b3IuZ2V0UGF0aCgpLFxuICAgICAgICAgIGxpbnRlck1lc3NhZ2VzLCB0aGlzLl9wcm92aWRlci5wcm92aWRlck5hbWUgfHwgdGhpcy5fcHJvdmlkZXIubmFtZVxuICAgICAgICApO1xuICAgICAgICB0aGlzLl9wcm92aWRlclV0aWxzLnB1Ymxpc2hNZXNzYWdlVXBkYXRlKGRpYWdub3N0aWNVcGRhdGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9uZXdVcGRhdGVTdWJzY3JpYmVyKGNhbGxiYWNrOiBNZXNzYWdlVXBkYXRlQ2FsbGJhY2spOiB2b2lkIHtcbiAgICBjb25zdCBhY3RpdmVUZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmIChhY3RpdmVUZXh0RWRpdG9yKSB7XG4gICAgICBjb25zdCBtYXRjaGVzR3JhbW1hciA9XG4gICAgICAgIHRoaXMuX3Byb3ZpZGVyLmdyYW1tYXJTY29wZXMuaW5kZXhPZihhY3RpdmVUZXh0RWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUpICE9PSAtMTtcbiAgICAgIGlmICghdGhpcy5fbGludEluUHJvZ3Jlc3MoKSAmJiBtYXRjaGVzR3JhbW1hcikge1xuICAgICAgICB0aGlzLl9ydW5MaW50KGFjdGl2ZVRleHRFZGl0b3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldEVuYWJsZWQoZW5hYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2VuYWJsZWQgPSBlbmFibGVkO1xuICB9XG5cbiAgc2V0TGludE9uRmx5KGxpbnRPbkZseTogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX3Byb3ZpZGVyVXRpbHMuc2V0UnVuT25UaGVGbHkobGludE9uRmx5ICYmIHRoaXMuX3Byb3ZpZGVyLmxpbnRPbkZseSk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3Byb3ZpZGVyVXRpbHMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX2xpbnRJblByb2dyZXNzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0U2VyaWFsaXplci5pc1J1bkluUHJvZ3Jlc3MoKTtcbiAgfVxuXG4gIG9uTWVzc2FnZVVwZGF0ZShjYWxsYmFjazogTWVzc2FnZVVwZGF0ZUNhbGxiYWNrKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9wcm92aWRlclV0aWxzLm9uTWVzc2FnZVVwZGF0ZShjYWxsYmFjayk7XG4gIH1cblxuICBvbk1lc3NhZ2VJbnZhbGlkYXRpb24oY2FsbGJhY2s6IE1lc3NhZ2VJbnZhbGlkYXRpb25DYWxsYmFjayk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvdmlkZXJVdGlscy5vbk1lc3NhZ2VJbnZhbGlkYXRpb24oY2FsbGJhY2spO1xuICB9XG59XG4iXX0=