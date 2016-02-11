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

var _providerBase = require('../../provider-base');

var _commons = require('../../../commons');

var RequestSerializer = _commons.promises.RequestSerializer;

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

    var ProviderBase = arguments.length <= 1 || arguments[1] === undefined ? _providerBase.DiagnosticsProviderBase : arguments[1];

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

/**
 * Extension: Allows a provider to include a display name that will be shown with its messages.
 */

/**
 * In the official Linter API, the providerName is just "name".
 */

/**
 * Extension: Intended for developers who want to provide both interfaces to cater towards people
 * who use only the `linter` package. This way you can provide both, but tell Nuclide to ignore
 * the `linter` provider so that duplicate results do not appear.
 */

/**
 * Extension: Overrides `grammarScopes` and triggers the linter on changes to any file, rather
 * than just files with specific grammar scopes.
 */
//# sourceMappingURL=data:application/json;base64,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b0IsK0JBQUMsUUFBcUMsRUFBZTtBQUN4RSxhQUFPLElBQUksQ0FBQyxjQUFjLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDNUQ7OztTQXpFVSxhQUFhIiwiZmlsZSI6IkxpbnRlckFkYXB0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmltcG9ydCB0eXBlIHtcbiAgRGlhZ25vc3RpY01lc3NhZ2UsXG4gIERpYWdub3N0aWNQcm92aWRlclVwZGF0ZSxcbiAgRmlsZURpYWdub3N0aWNNZXNzYWdlLFxuICBQcm9qZWN0RGlhZ25vc3RpY01lc3NhZ2UsXG4gIE1lc3NhZ2VVcGRhdGVDYWxsYmFjayxcbiAgTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrLFxufSBmcm9tICcuLi8uLi9iYXNlJztcblxudHlwZSBMaW50ZXJUcmFjZSA9IHtcbiAgdHlwZTogJ1RyYWNlJztcbiAgdGV4dD86IHN0cmluZztcbiAgaHRtbD86IHN0cmluZztcbiAgZmlsZVBhdGg6IHN0cmluZztcbiAgcmFuZ2U/OiBhdG9tJFJhbmdlO1xufTtcblxudHlwZSBMaW50ZXJNZXNzYWdlID0ge1xuICB0eXBlOiAnRXJyb3InIHwgJ1dhcm5pbmcnLFxuICB0ZXh0Pzogc3RyaW5nLFxuICBodG1sPzogc3RyaW5nLFxuICBmaWxlUGF0aD86IE51Y2xpZGVVcmksXG4gIHJhbmdlPzogYXRvbSRSYW5nZSxcbiAgdHJhY2U/OiBBcnJheTxMaW50ZXJUcmFjZT4sXG4gIGZpeD86IHtcbiAgICByYW5nZTogYXRvbSRSYW5nZSxcbiAgICBuZXdUZXh0OiBzdHJpbmcsXG4gICAgb2xkVGV4dD86IHN0cmluZyxcbiAgfSxcbn07XG5cbmV4cG9ydCB0eXBlIExpbnRlclByb3ZpZGVyID0ge1xuICAvKipcbiAgICogRXh0ZW5zaW9uOiBBbGxvd3MgYSBwcm92aWRlciB0byBpbmNsdWRlIGEgZGlzcGxheSBuYW1lIHRoYXQgd2lsbCBiZSBzaG93biB3aXRoIGl0cyBtZXNzYWdlcy5cbiAgICovXG4gIHByb3ZpZGVyTmFtZT86IHN0cmluZztcbiAgLyoqXG4gICAqIEluIHRoZSBvZmZpY2lhbCBMaW50ZXIgQVBJLCB0aGUgcHJvdmlkZXJOYW1lIGlzIGp1c3QgXCJuYW1lXCIuXG4gICAqL1xuICBuYW1lPzogc3RyaW5nO1xuICAvKipcbiAgICogRXh0ZW5zaW9uOiBJbnRlbmRlZCBmb3IgZGV2ZWxvcGVycyB3aG8gd2FudCB0byBwcm92aWRlIGJvdGggaW50ZXJmYWNlcyB0byBjYXRlciB0b3dhcmRzIHBlb3BsZVxuICAgKiB3aG8gdXNlIG9ubHkgdGhlIGBsaW50ZXJgIHBhY2thZ2UuIFRoaXMgd2F5IHlvdSBjYW4gcHJvdmlkZSBib3RoLCBidXQgdGVsbCBOdWNsaWRlIHRvIGlnbm9yZVxuICAgKiB0aGUgYGxpbnRlcmAgcHJvdmlkZXIgc28gdGhhdCBkdXBsaWNhdGUgcmVzdWx0cyBkbyBub3QgYXBwZWFyLlxuICAgKi9cbiAgZGlzYWJsZWRGb3JOdWNsaWRlPzogYm9vbGVhbjtcbiAgZ3JhbW1hclNjb3BlczogQXJyYXk8c3RyaW5nPjtcbiAgLyoqXG4gICAqIEV4dGVuc2lvbjogT3ZlcnJpZGVzIGBncmFtbWFyU2NvcGVzYCBhbmQgdHJpZ2dlcnMgdGhlIGxpbnRlciBvbiBjaGFuZ2VzIHRvIGFueSBmaWxlLCByYXRoZXJcbiAgICogdGhhbiBqdXN0IGZpbGVzIHdpdGggc3BlY2lmaWMgZ3JhbW1hciBzY29wZXMuXG4gICAqL1xuICBhbGxHcmFtbWFyU2NvcGVzPzogYm9vbGVhbjtcbiAgc2NvcGU6ICdmaWxlJyB8ICdwcm9qZWN0JztcbiAgbGludE9uRmx5OiBib29sZWFuO1xuICBsaW50OiAodGV4dEVkaXRvcjogVGV4dEVkaXRvcikgPT4gUHJvbWlzZTxBcnJheTxMaW50ZXJNZXNzYWdlPj47XG59O1xuXG5pbXBvcnQge1JhbmdlfSBmcm9tICdhdG9tJztcblxuaW1wb3J0IHtEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZX0gZnJvbSAnLi4vLi4vcHJvdmlkZXItYmFzZSc7XG5cbmltcG9ydCB7cHJvbWlzZXMgYXMgY29tbW9uc1Byb21pc2VzfSBmcm9tICcuLi8uLi8uLi9jb21tb25zJztcblxuY29uc3Qge1JlcXVlc3RTZXJpYWxpemVyfSA9IGNvbW1vbnNQcm9taXNlcztcblxuLy8gRXhwb3J0ZWQgZm9yIHRlc3RpbmcuXG5leHBvcnQgZnVuY3Rpb24gbGludGVyTWVzc2FnZVRvRGlhZ25vc3RpY01lc3NhZ2UoXG4gIG1zZzogTGludGVyTWVzc2FnZSxcbiAgcHJvdmlkZXJOYW1lOiBzdHJpbmcsXG4pOiBEaWFnbm9zdGljTWVzc2FnZSB7XG4gIC8vIFRoZSB0eXBlcyBhcmUgc2xpZ2h0bHkgZGlmZmVyZW50LCBzbyB3ZSBuZWVkIHRvIGNvcHkgdG8gbWFrZSBGbG93IGhhcHB5LiBCYXNpY2FsbHksIGEgVHJhY2VcbiAgLy8gZG9lcyBub3QgbmVlZCBhIGZpbGVQYXRoIHByb3BlcnR5LCBidXQgYSBMaW50ZXJUcmFjZSBkb2VzLiBUcmFjZSBpcyBhIHN1YnR5cGUgb2YgTGludGVyVHJhY2UsXG4gIC8vIHNvIGNvcHlpbmcgd29ya3MgYnV0IGFsaWFzaW5nIGRvZXMgbm90LiBGb3IgYSBkZXRhaWxlZCBleHBsYW5hdGlvbiBzZWVcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL2Zsb3cvaXNzdWVzLzkwOFxuICBjb25zdCB0cmFjZSA9IG1zZy50cmFjZSA/IG1zZy50cmFjZS5tYXAoY29tcG9uZW50ID0+ICh7Li4uY29tcG9uZW50fSkpIDogdW5kZWZpbmVkO1xuICBpZiAobXNnLmZpbGVQYXRoKSB7XG4gICAgcmV0dXJuICh7XG4gICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgcHJvdmlkZXJOYW1lLFxuICAgICAgdHlwZTogbXNnLnR5cGUsXG4gICAgICBmaWxlUGF0aDogbXNnLmZpbGVQYXRoLFxuICAgICAgdGV4dDogbXNnLnRleHQsXG4gICAgICBodG1sOiBtc2cuaHRtbCxcbiAgICAgIHJhbmdlOiBtc2cucmFuZ2UgJiYgUmFuZ2UuZnJvbU9iamVjdChtc2cucmFuZ2UpLFxuICAgICAgdHJhY2U6IHRyYWNlLFxuICAgICAgZml4OiBtc2cuZml4ID09IG51bGwgPyB1bmRlZmluZWQgOiB7XG4gICAgICAgIG9sZFJhbmdlOiBtc2cuZml4LnJhbmdlLFxuICAgICAgICBvbGRUZXh0OiBtc2cuZml4Lm9sZFRleHQsXG4gICAgICAgIG5ld1RleHQ6IG1zZy5maXgubmV3VGV4dCxcbiAgICAgIH0sXG4gICAgfTogRmlsZURpYWdub3N0aWNNZXNzYWdlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gKHtcbiAgICAgIHNjb3BlOiAncHJvamVjdCcsXG4gICAgICBwcm92aWRlck5hbWUsXG4gICAgICB0eXBlOiBtc2cudHlwZSxcbiAgICAgIHRleHQ6IG1zZy50ZXh0LFxuICAgICAgaHRtbDogbXNnLmh0bWwsXG4gICAgICByYW5nZTogbXNnLnJhbmdlICYmIFJhbmdlLmZyb21PYmplY3QobXNnLnJhbmdlKSxcbiAgICAgIHRyYWNlOiB0cmFjZSxcbiAgICB9OiBQcm9qZWN0RGlhZ25vc3RpY01lc3NhZ2UpO1xuICB9XG59XG5cbi8vIEV4cG9ydGVkIGZvciB0ZXN0aW5nLlxuZXhwb3J0IGZ1bmN0aW9uIGxpbnRlck1lc3NhZ2VzVG9EaWFnbm9zdGljVXBkYXRlKFxuICBjdXJyZW50UGF0aDogP051Y2xpZGVVcmksXG4gIG1zZ3M6IEFycmF5PExpbnRlck1lc3NhZ2U+LFxuICBwcm92aWRlck5hbWU/OiBzdHJpbmcgPSAnVW5uYW1lZCBMaW50ZXInLFxuKTogRGlhZ25vc3RpY1Byb3ZpZGVyVXBkYXRlIHtcbiAgY29uc3QgZmlsZVBhdGhUb01lc3NhZ2VzOiBNYXA8TnVjbGlkZVVyaSwgQXJyYXk8RmlsZURpYWdub3N0aWNNZXNzYWdlPj4gPSBuZXcgTWFwKCk7XG4gIGlmIChjdXJyZW50UGF0aCkge1xuICAgIC8vIE1ha2Ugc3VyZSB3ZSBpbnZhbGlkYXRlIHRoZSBtZXNzYWdlcyBmb3IgdGhlIGN1cnJlbnQgcGF0aC4gV2UgbWF5IHdhbnQgdG9cbiAgICAvLyBmaWd1cmUgb3V0IHdoaWNoIG90aGVyIHBhdGhzIHdlIHdhbnQgdG8gaW52YWxpZGF0ZSBpZiBpdCB0dXJucyBvdXQgdGhhdFxuICAgIC8vIGxpbnRlcnMgcmVndWxhcmx5IHJldHVybiBtZXNzYWdlcyBmb3Igb3RoZXIgZmlsZXMuXG4gICAgZmlsZVBhdGhUb01lc3NhZ2VzLnNldChjdXJyZW50UGF0aCwgW10pO1xuICB9XG4gIGNvbnN0IHByb2plY3RNZXNzYWdlcyA9IFtdO1xuICBmb3IgKGNvbnN0IG1zZyBvZiBtc2dzKSB7XG4gICAgY29uc3QgZGlhZ25vc3RpY01lc3NhZ2UgPSBsaW50ZXJNZXNzYWdlVG9EaWFnbm9zdGljTWVzc2FnZShtc2csIHByb3ZpZGVyTmFtZSk7XG4gICAgaWYgKGRpYWdub3N0aWNNZXNzYWdlLnNjb3BlID09PSAnZmlsZScpIHtcbiAgICAgIGNvbnN0IHBhdGggPSBkaWFnbm9zdGljTWVzc2FnZS5maWxlUGF0aDtcbiAgICAgIGxldCBtZXNzYWdlcyA9IGZpbGVQYXRoVG9NZXNzYWdlcy5nZXQocGF0aCk7XG4gICAgICBpZiAobWVzc2FnZXMgPT0gbnVsbCkge1xuICAgICAgICBtZXNzYWdlcyA9IFtdO1xuICAgICAgICBmaWxlUGF0aFRvTWVzc2FnZXMuc2V0KHBhdGgsIG1lc3NhZ2VzKTtcbiAgICAgIH1cbiAgICAgIG1lc3NhZ2VzLnB1c2goZGlhZ25vc3RpY01lc3NhZ2UpO1xuICAgIH0gZWxzZSB7IC8vIFByb2plY3Qgc2NvcGUuXG4gICAgICBwcm9qZWN0TWVzc2FnZXMucHVzaChkaWFnbm9zdGljTWVzc2FnZSk7XG4gICAgfVxuICB9XG4gIHJldHVybiB7XG4gICAgZmlsZVBhdGhUb01lc3NhZ2VzLFxuICAgIHByb2plY3RNZXNzYWdlcyxcbiAgfTtcbn1cblxuLyoqXG4gKiBQcm92aWRlcyBhbiBhZGFwdGVyIGJldHdlZW4gbGVnYWN5IGxpbnRlcnMgKGRlZmluZWQgYnkgdGhlIExpbnRlclByb3ZpZGVyXG4gKiB0eXBlKSwgYW5kIE51Y2xpZGUgRGlhZ25vc3RpYyBQcm92aWRlcnMuXG4gKlxuICogVGhlIGNvbnN0cnVjdG9yIHRha2VzIGEgTGludGVyUHJvdmlkZXIgYXMgYW4gYXJndW1lbnQsIGFuZCB0aGUgcmVzdWx0aW5nXG4gKiBMaW50ZXJBZGFwdGVyIGlzIGEgdmFsaWQgRGlhZ25vc3RpY1Byb3ZpZGVyLlxuICpcbiAqIE5vdGUgdGhhdCB0aGlzIGFsbG93cyBhbiBleHRlbnNpb24gdG8gb3JkaW5hcnkgTGludGVyUHJvdmlkZXJzLiBXZSBhbGxvdyBhblxuICogb3B0aW9uYWwgYWRkaXRpb25hbCBmaWVsZCwgcHJvdmlkZXJOYW1lLCB0byBpbmRpY2F0ZSB0aGUgZGlzcGxheSBuYW1lIG9mIHRoZVxuICogbGludGVyLlxuICovXG5leHBvcnQgY2xhc3MgTGludGVyQWRhcHRlciB7XG4gIF9wcm92aWRlcjogTGludGVyUHJvdmlkZXI7XG5cbiAgX2VuYWJsZWQ6IGJvb2xlYW47XG5cbiAgX3JlcXVlc3RTZXJpYWxpemVyOiBSZXF1ZXN0U2VyaWFsaXplcjtcblxuICBfcHJvdmlkZXJVdGlsczogRGlhZ25vc3RpY3NQcm92aWRlckJhc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdmlkZXI6IExpbnRlclByb3ZpZGVyLFxuICAgIFByb3ZpZGVyQmFzZT86IHR5cGVvZiBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZSA9IERpYWdub3N0aWNzUHJvdmlkZXJCYXNlLFxuICApIHtcbiAgICBjb25zdCB1dGlsc09wdGlvbnMgPSB7XG4gICAgICBncmFtbWFyU2NvcGVzOiBuZXcgU2V0KHByb3ZpZGVyLmdyYW1tYXJTY29wZXMpLFxuICAgICAgZW5hYmxlRm9yQWxsR3JhbW1hcnM6IHByb3ZpZGVyLmFsbEdyYW1tYXJTY29wZXMsXG4gICAgICBzaG91bGRSdW5PblRoZUZseTogcHJvdmlkZXIubGludE9uRmx5LFxuICAgICAgb25UZXh0RWRpdG9yRXZlbnQ6IGVkaXRvciA9PiB0aGlzLl9ydW5MaW50KGVkaXRvciksXG4gICAgICBvbk5ld1VwZGF0ZVN1YnNjcmliZXI6IGNhbGxiYWNrID0+IHRoaXMuX25ld1VwZGF0ZVN1YnNjcmliZXIoY2FsbGJhY2spLFxuICAgIH07XG4gICAgdGhpcy5fcHJvdmlkZXJVdGlscyA9IG5ldyBQcm92aWRlckJhc2UodXRpbHNPcHRpb25zKTtcbiAgICB0aGlzLl9wcm92aWRlciA9IHByb3ZpZGVyO1xuICAgIHRoaXMuX2VuYWJsZWQgPSB0cnVlO1xuICAgIHRoaXMuX3JlcXVlc3RTZXJpYWxpemVyID0gbmV3IFJlcXVlc3RTZXJpYWxpemVyKCk7XG4gIH1cblxuICBhc3luYyBfcnVuTGludChlZGl0b3I6IFRleHRFZGl0b3IpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5fZW5hYmxlZCkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fcmVxdWVzdFNlcmlhbGl6ZXIucnVuKHRoaXMuX3Byb3ZpZGVyLmxpbnQoZWRpdG9yKSk7XG4gICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ3N1Y2Nlc3MnKSB7XG4gICAgICAgIGNvbnN0IGxpbnRlck1lc3NhZ2VzID0gcmVzdWx0LnJlc3VsdDtcbiAgICAgICAgY29uc3QgZGlhZ25vc3RpY1VwZGF0ZSA9IGxpbnRlck1lc3NhZ2VzVG9EaWFnbm9zdGljVXBkYXRlKFxuICAgICAgICAgIGVkaXRvci5nZXRQYXRoKCksXG4gICAgICAgICAgbGludGVyTWVzc2FnZXMsIHRoaXMuX3Byb3ZpZGVyLnByb3ZpZGVyTmFtZSB8fCB0aGlzLl9wcm92aWRlci5uYW1lXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuX3Byb3ZpZGVyVXRpbHMucHVibGlzaE1lc3NhZ2VVcGRhdGUoZGlhZ25vc3RpY1VwZGF0ZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX25ld1VwZGF0ZVN1YnNjcmliZXIoY2FsbGJhY2s6IE1lc3NhZ2VVcGRhdGVDYWxsYmFjayk6IHZvaWQge1xuICAgIGNvbnN0IGFjdGl2ZVRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgaWYgKGFjdGl2ZVRleHRFZGl0b3IpIHtcbiAgICAgIGNvbnN0IG1hdGNoZXNHcmFtbWFyID1cbiAgICAgICAgdGhpcy5fcHJvdmlkZXIuZ3JhbW1hclNjb3Blcy5pbmRleE9mKGFjdGl2ZVRleHRFZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSkgIT09IC0xO1xuICAgICAgaWYgKCF0aGlzLl9saW50SW5Qcm9ncmVzcygpICYmIG1hdGNoZXNHcmFtbWFyKSB7XG4gICAgICAgIHRoaXMuX3J1bkxpbnQoYWN0aXZlVGV4dEVkaXRvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2V0RW5hYmxlZChlbmFibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fZW5hYmxlZCA9IGVuYWJsZWQ7XG4gIH1cblxuICBzZXRMaW50T25GbHkobGludE9uRmx5OiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fcHJvdmlkZXJVdGlscy5zZXRSdW5PblRoZUZseShsaW50T25GbHkgJiYgdGhpcy5fcHJvdmlkZXIubGludE9uRmx5KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fcHJvdmlkZXJVdGlscy5kaXNwb3NlKCk7XG4gIH1cblxuICBfbGludEluUHJvZ3Jlc3MoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3JlcXVlc3RTZXJpYWxpemVyLmlzUnVuSW5Qcm9ncmVzcygpO1xuICB9XG5cbiAgb25NZXNzYWdlVXBkYXRlKGNhbGxiYWNrOiBNZXNzYWdlVXBkYXRlQ2FsbGJhY2spOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3ZpZGVyVXRpbHMub25NZXNzYWdlVXBkYXRlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjazogTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9wcm92aWRlclV0aWxzLm9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjayk7XG4gIH1cbn1cbiJdfQ==