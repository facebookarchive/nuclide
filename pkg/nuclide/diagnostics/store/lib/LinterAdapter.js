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
//# sourceMappingURL=data:application/json;base64,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RW9CLCtCQUFDLFFBQXFDLEVBQW1CO0FBQzVFLGFBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUM1RDs7O1NBekVVLGFBQWEiLCJmaWxlIjoiTGludGVyQWRhcHRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi8uLi9yZW1vdGUtdXJpJztcblxuaW1wb3J0IHR5cGUge1xuICBEaWFnbm9zdGljTWVzc2FnZSxcbiAgRGlhZ25vc3RpY1Byb3ZpZGVyVXBkYXRlLFxuICBGaWxlRGlhZ25vc3RpY01lc3NhZ2UsXG4gIFByb2plY3REaWFnbm9zdGljTWVzc2FnZSxcbiAgTWVzc2FnZVVwZGF0ZUNhbGxiYWNrLFxuICBNZXNzYWdlSW52YWxpZGF0aW9uQ2FsbGJhY2ssXG59IGZyb20gJy4uLy4uL2Jhc2UnO1xuXG50eXBlIExpbnRlclRyYWNlID0ge1xuICB0eXBlOiAnVHJhY2UnO1xuICB0ZXh0Pzogc3RyaW5nO1xuICBodG1sPzogc3RyaW5nO1xuICBmaWxlUGF0aDogc3RyaW5nO1xuICByYW5nZT86IGF0b20kUmFuZ2U7XG59O1xuXG50eXBlIExpbnRlck1lc3NhZ2UgPSB7XG4gIHR5cGU6ICdFcnJvcicgfCAnV2FybmluZycsXG4gIHRleHQ/OiBzdHJpbmcsXG4gIGh0bWw/OiBzdHJpbmcsXG4gIGZpbGVQYXRoPzogTnVjbGlkZVVyaSxcbiAgcmFuZ2U/OiBhdG9tJFJhbmdlLFxuICB0cmFjZT86IEFycmF5PExpbnRlclRyYWNlPixcbiAgZml4Pzoge1xuICAgIHJhbmdlOiBhdG9tJFJhbmdlLFxuICAgIG5ld1RleHQ6IHN0cmluZyxcbiAgICBvbGRUZXh0Pzogc3RyaW5nLFxuICB9LFxufTtcblxuZXhwb3J0IHR5cGUgTGludGVyUHJvdmlkZXIgPSB7XG4gIC8qKlxuICAgKiBFeHRlbnNpb246IEFsbG93cyBhIHByb3ZpZGVyIHRvIGluY2x1ZGUgYSBkaXNwbGF5IG5hbWUgdGhhdCB3aWxsIGJlIHNob3duIHdpdGggaXRzIG1lc3NhZ2VzLlxuICAgKi9cbiAgcHJvdmlkZXJOYW1lPzogc3RyaW5nO1xuICAvKipcbiAgICogSW4gdGhlIG9mZmljaWFsIExpbnRlciBBUEksIHRoZSBwcm92aWRlck5hbWUgaXMganVzdCBcIm5hbWVcIi5cbiAgICovXG4gIG5hbWU/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBFeHRlbnNpb246IEludGVuZGVkIGZvciBkZXZlbG9wZXJzIHdobyB3YW50IHRvIHByb3ZpZGUgYm90aCBpbnRlcmZhY2VzIHRvIGNhdGVyIHRvd2FyZHMgcGVvcGxlXG4gICAqIHdobyB1c2Ugb25seSB0aGUgYGxpbnRlcmAgcGFja2FnZS4gVGhpcyB3YXkgeW91IGNhbiBwcm92aWRlIGJvdGgsIGJ1dCB0ZWxsIE51Y2xpZGUgdG8gaWdub3JlXG4gICAqIHRoZSBgbGludGVyYCBwcm92aWRlciBzbyB0aGF0IGR1cGxpY2F0ZSByZXN1bHRzIGRvIG5vdCBhcHBlYXIuXG4gICAqL1xuICBkaXNhYmxlZEZvck51Y2xpZGU/OiBib29sZWFuO1xuICBncmFtbWFyU2NvcGVzOiBBcnJheTxzdHJpbmc+O1xuICAvKipcbiAgICogRXh0ZW5zaW9uOiBPdmVycmlkZXMgYGdyYW1tYXJTY29wZXNgIGFuZCB0cmlnZ2VycyB0aGUgbGludGVyIG9uIGNoYW5nZXMgdG8gYW55IGZpbGUsIHJhdGhlclxuICAgKiB0aGFuIGp1c3QgZmlsZXMgd2l0aCBzcGVjaWZpYyBncmFtbWFyIHNjb3Blcy5cbiAgICovXG4gIGFsbEdyYW1tYXJTY29wZXM/OiBib29sZWFuO1xuICBzY29wZTogJ2ZpbGUnIHwgJ3Byb2plY3QnO1xuICBsaW50T25GbHk6IGJvb2xlYW47XG4gIGxpbnQ6ICh0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKSA9PiBQcm9taXNlPEFycmF5PExpbnRlck1lc3NhZ2U+Pjtcbn07XG5cbmltcG9ydCB7UmFuZ2V9IGZyb20gJ2F0b20nO1xuXG5pbXBvcnQge0RpYWdub3N0aWNzUHJvdmlkZXJCYXNlfSBmcm9tICcuLi8uLi9wcm92aWRlci1iYXNlJztcblxuaW1wb3J0IHtwcm9taXNlcyBhcyBjb21tb25zUHJvbWlzZXN9IGZyb20gJy4uLy4uLy4uL2NvbW1vbnMnO1xuXG5jb25zdCB7UmVxdWVzdFNlcmlhbGl6ZXJ9ID0gY29tbW9uc1Byb21pc2VzO1xuXG4vLyBFeHBvcnRlZCBmb3IgdGVzdGluZy5cbmV4cG9ydCBmdW5jdGlvbiBsaW50ZXJNZXNzYWdlVG9EaWFnbm9zdGljTWVzc2FnZShcbiAgbXNnOiBMaW50ZXJNZXNzYWdlLFxuICBwcm92aWRlck5hbWU6IHN0cmluZyxcbik6IERpYWdub3N0aWNNZXNzYWdlIHtcbiAgLy8gVGhlIHR5cGVzIGFyZSBzbGlnaHRseSBkaWZmZXJlbnQsIHNvIHdlIG5lZWQgdG8gY29weSB0byBtYWtlIEZsb3cgaGFwcHkuIEJhc2ljYWxseSwgYSBUcmFjZVxuICAvLyBkb2VzIG5vdCBuZWVkIGEgZmlsZVBhdGggcHJvcGVydHksIGJ1dCBhIExpbnRlclRyYWNlIGRvZXMuIFRyYWNlIGlzIGEgc3VidHlwZSBvZiBMaW50ZXJUcmFjZSxcbiAgLy8gc28gY29weWluZyB3b3JrcyBidXQgYWxpYXNpbmcgZG9lcyBub3QuIEZvciBhIGRldGFpbGVkIGV4cGxhbmF0aW9uIHNlZVxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svZmxvdy9pc3N1ZXMvOTA4XG4gIGNvbnN0IHRyYWNlID0gbXNnLnRyYWNlID8gbXNnLnRyYWNlLm1hcChjb21wb25lbnQgPT4gKHsuLi5jb21wb25lbnR9KSkgOiB1bmRlZmluZWQ7XG4gIGlmIChtc2cuZmlsZVBhdGgpIHtcbiAgICByZXR1cm4gKHtcbiAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICBwcm92aWRlck5hbWUsXG4gICAgICB0eXBlOiBtc2cudHlwZSxcbiAgICAgIGZpbGVQYXRoOiBtc2cuZmlsZVBhdGgsXG4gICAgICB0ZXh0OiBtc2cudGV4dCxcbiAgICAgIGh0bWw6IG1zZy5odG1sLFxuICAgICAgcmFuZ2U6IG1zZy5yYW5nZSAmJiBSYW5nZS5mcm9tT2JqZWN0KG1zZy5yYW5nZSksXG4gICAgICB0cmFjZTogdHJhY2UsXG4gICAgICBmaXg6IG1zZy5maXggPT0gbnVsbCA/IHVuZGVmaW5lZCA6IHtcbiAgICAgICAgb2xkUmFuZ2U6IG1zZy5maXgucmFuZ2UsXG4gICAgICAgIG9sZFRleHQ6IG1zZy5maXgub2xkVGV4dCxcbiAgICAgICAgbmV3VGV4dDogbXNnLmZpeC5uZXdUZXh0LFxuICAgICAgfSxcbiAgICB9OiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAoe1xuICAgICAgc2NvcGU6ICdwcm9qZWN0JyxcbiAgICAgIHByb3ZpZGVyTmFtZSxcbiAgICAgIHR5cGU6IG1zZy50eXBlLFxuICAgICAgdGV4dDogbXNnLnRleHQsXG4gICAgICBodG1sOiBtc2cuaHRtbCxcbiAgICAgIHJhbmdlOiBtc2cucmFuZ2UgJiYgUmFuZ2UuZnJvbU9iamVjdChtc2cucmFuZ2UpLFxuICAgICAgdHJhY2U6IHRyYWNlLFxuICAgIH06IFByb2plY3REaWFnbm9zdGljTWVzc2FnZSk7XG4gIH1cbn1cblxuLy8gRXhwb3J0ZWQgZm9yIHRlc3RpbmcuXG5leHBvcnQgZnVuY3Rpb24gbGludGVyTWVzc2FnZXNUb0RpYWdub3N0aWNVcGRhdGUoXG4gIGN1cnJlbnRQYXRoOiA/TnVjbGlkZVVyaSxcbiAgbXNnczogQXJyYXk8TGludGVyTWVzc2FnZT4sXG4gIHByb3ZpZGVyTmFtZT86IHN0cmluZyA9ICdVbm5hbWVkIExpbnRlcicsXG4pOiBEaWFnbm9zdGljUHJvdmlkZXJVcGRhdGUge1xuICBjb25zdCBmaWxlUGF0aFRvTWVzc2FnZXM6IE1hcDxOdWNsaWRlVXJpLCBBcnJheTxGaWxlRGlhZ25vc3RpY01lc3NhZ2U+PiA9IG5ldyBNYXAoKTtcbiAgaWYgKGN1cnJlbnRQYXRoKSB7XG4gICAgLy8gTWFrZSBzdXJlIHdlIGludmFsaWRhdGUgdGhlIG1lc3NhZ2VzIGZvciB0aGUgY3VycmVudCBwYXRoLiBXZSBtYXkgd2FudCB0b1xuICAgIC8vIGZpZ3VyZSBvdXQgd2hpY2ggb3RoZXIgcGF0aHMgd2Ugd2FudCB0byBpbnZhbGlkYXRlIGlmIGl0IHR1cm5zIG91dCB0aGF0XG4gICAgLy8gbGludGVycyByZWd1bGFybHkgcmV0dXJuIG1lc3NhZ2VzIGZvciBvdGhlciBmaWxlcy5cbiAgICBmaWxlUGF0aFRvTWVzc2FnZXMuc2V0KGN1cnJlbnRQYXRoLCBbXSk7XG4gIH1cbiAgY29uc3QgcHJvamVjdE1lc3NhZ2VzID0gW107XG4gIGZvciAoY29uc3QgbXNnIG9mIG1zZ3MpIHtcbiAgICBjb25zdCBkaWFnbm9zdGljTWVzc2FnZSA9IGxpbnRlck1lc3NhZ2VUb0RpYWdub3N0aWNNZXNzYWdlKG1zZywgcHJvdmlkZXJOYW1lKTtcbiAgICBpZiAoZGlhZ25vc3RpY01lc3NhZ2Uuc2NvcGUgPT09ICdmaWxlJykge1xuICAgICAgY29uc3QgcGF0aCA9IGRpYWdub3N0aWNNZXNzYWdlLmZpbGVQYXRoO1xuICAgICAgbGV0IG1lc3NhZ2VzID0gZmlsZVBhdGhUb01lc3NhZ2VzLmdldChwYXRoKTtcbiAgICAgIGlmIChtZXNzYWdlcyA9PSBudWxsKSB7XG4gICAgICAgIG1lc3NhZ2VzID0gW107XG4gICAgICAgIGZpbGVQYXRoVG9NZXNzYWdlcy5zZXQocGF0aCwgbWVzc2FnZXMpO1xuICAgICAgfVxuICAgICAgbWVzc2FnZXMucHVzaChkaWFnbm9zdGljTWVzc2FnZSk7XG4gICAgfSBlbHNlIHsgLy8gUHJvamVjdCBzY29wZS5cbiAgICAgIHByb2plY3RNZXNzYWdlcy5wdXNoKGRpYWdub3N0aWNNZXNzYWdlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBmaWxlUGF0aFRvTWVzc2FnZXMsXG4gICAgcHJvamVjdE1lc3NhZ2VzLFxuICB9O1xufVxuXG4vKipcbiAqIFByb3ZpZGVzIGFuIGFkYXB0ZXIgYmV0d2VlbiBsZWdhY3kgbGludGVycyAoZGVmaW5lZCBieSB0aGUgTGludGVyUHJvdmlkZXJcbiAqIHR5cGUpLCBhbmQgTnVjbGlkZSBEaWFnbm9zdGljIFByb3ZpZGVycy5cbiAqXG4gKiBUaGUgY29uc3RydWN0b3IgdGFrZXMgYSBMaW50ZXJQcm92aWRlciBhcyBhbiBhcmd1bWVudCwgYW5kIHRoZSByZXN1bHRpbmdcbiAqIExpbnRlckFkYXB0ZXIgaXMgYSB2YWxpZCBEaWFnbm9zdGljUHJvdmlkZXIuXG4gKlxuICogTm90ZSB0aGF0IHRoaXMgYWxsb3dzIGFuIGV4dGVuc2lvbiB0byBvcmRpbmFyeSBMaW50ZXJQcm92aWRlcnMuIFdlIGFsbG93IGFuXG4gKiBvcHRpb25hbCBhZGRpdGlvbmFsIGZpZWxkLCBwcm92aWRlck5hbWUsIHRvIGluZGljYXRlIHRoZSBkaXNwbGF5IG5hbWUgb2YgdGhlXG4gKiBsaW50ZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBMaW50ZXJBZGFwdGVyIHtcbiAgX3Byb3ZpZGVyOiBMaW50ZXJQcm92aWRlcjtcblxuICBfZW5hYmxlZDogYm9vbGVhbjtcblxuICBfcmVxdWVzdFNlcmlhbGl6ZXI6IFJlcXVlc3RTZXJpYWxpemVyO1xuXG4gIF9wcm92aWRlclV0aWxzOiBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcm92aWRlcjogTGludGVyUHJvdmlkZXIsXG4gICAgUHJvdmlkZXJCYXNlPzogdHlwZW9mIERpYWdub3N0aWNzUHJvdmlkZXJCYXNlID0gRGlhZ25vc3RpY3NQcm92aWRlckJhc2UsXG4gICkge1xuICAgIGNvbnN0IHV0aWxzT3B0aW9ucyA9IHtcbiAgICAgIGdyYW1tYXJTY29wZXM6IG5ldyBTZXQocHJvdmlkZXIuZ3JhbW1hclNjb3BlcyksXG4gICAgICBlbmFibGVGb3JBbGxHcmFtbWFyczogcHJvdmlkZXIuYWxsR3JhbW1hclNjb3BlcyxcbiAgICAgIHNob3VsZFJ1bk9uVGhlRmx5OiBwcm92aWRlci5saW50T25GbHksXG4gICAgICBvblRleHRFZGl0b3JFdmVudDogZWRpdG9yID0+IHRoaXMuX3J1bkxpbnQoZWRpdG9yKSxcbiAgICAgIG9uTmV3VXBkYXRlU3Vic2NyaWJlcjogY2FsbGJhY2sgPT4gdGhpcy5fbmV3VXBkYXRlU3Vic2NyaWJlcihjYWxsYmFjayksXG4gICAgfTtcbiAgICB0aGlzLl9wcm92aWRlclV0aWxzID0gbmV3IFByb3ZpZGVyQmFzZSh1dGlsc09wdGlvbnMpO1xuICAgIHRoaXMuX3Byb3ZpZGVyID0gcHJvdmlkZXI7XG4gICAgdGhpcy5fZW5hYmxlZCA9IHRydWU7XG4gICAgdGhpcy5fcmVxdWVzdFNlcmlhbGl6ZXIgPSBuZXcgUmVxdWVzdFNlcmlhbGl6ZXIoKTtcbiAgfVxuXG4gIGFzeW5jIF9ydW5MaW50KGVkaXRvcjogVGV4dEVkaXRvcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLl9lbmFibGVkKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9yZXF1ZXN0U2VyaWFsaXplci5ydW4odGhpcy5fcHJvdmlkZXIubGludChlZGl0b3IpKTtcbiAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSAnc3VjY2VzcycpIHtcbiAgICAgICAgY29uc3QgbGludGVyTWVzc2FnZXMgPSByZXN1bHQucmVzdWx0O1xuICAgICAgICBjb25zdCBkaWFnbm9zdGljVXBkYXRlID0gbGludGVyTWVzc2FnZXNUb0RpYWdub3N0aWNVcGRhdGUoXG4gICAgICAgICAgZWRpdG9yLmdldFBhdGgoKSxcbiAgICAgICAgICBsaW50ZXJNZXNzYWdlcywgdGhpcy5fcHJvdmlkZXIucHJvdmlkZXJOYW1lIHx8IHRoaXMuX3Byb3ZpZGVyLm5hbWVcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5fcHJvdmlkZXJVdGlscy5wdWJsaXNoTWVzc2FnZVVwZGF0ZShkaWFnbm9zdGljVXBkYXRlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfbmV3VXBkYXRlU3Vic2NyaWJlcihjYWxsYmFjazogTWVzc2FnZVVwZGF0ZUNhbGxiYWNrKTogdm9pZCB7XG4gICAgY29uc3QgYWN0aXZlVGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoYWN0aXZlVGV4dEVkaXRvcikge1xuICAgICAgY29uc3QgbWF0Y2hlc0dyYW1tYXIgPVxuICAgICAgICB0aGlzLl9wcm92aWRlci5ncmFtbWFyU2NvcGVzLmluZGV4T2YoYWN0aXZlVGV4dEVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lKSAhPT0gLTE7XG4gICAgICBpZiAoIXRoaXMuX2xpbnRJblByb2dyZXNzKCkgJiYgbWF0Y2hlc0dyYW1tYXIpIHtcbiAgICAgICAgdGhpcy5fcnVuTGludChhY3RpdmVUZXh0RWRpdG9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXRFbmFibGVkKGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9lbmFibGVkID0gZW5hYmxlZDtcbiAgfVxuXG4gIHNldExpbnRPbkZseShsaW50T25GbHk6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9wcm92aWRlclV0aWxzLnNldFJ1bk9uVGhlRmx5KGxpbnRPbkZseSAmJiB0aGlzLl9wcm92aWRlci5saW50T25GbHkpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9wcm92aWRlclV0aWxzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9saW50SW5Qcm9ncmVzcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fcmVxdWVzdFNlcmlhbGl6ZXIuaXNSdW5JblByb2dyZXNzKCk7XG4gIH1cblxuICBvbk1lc3NhZ2VVcGRhdGUoY2FsbGJhY2s6IE1lc3NhZ2VVcGRhdGVDYWxsYmFjayk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3ZpZGVyVXRpbHMub25NZXNzYWdlVXBkYXRlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjazogTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrKTogYXRvbSREaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvdmlkZXJVdGlscy5vbk1lc3NhZ2VJbnZhbGlkYXRpb24oY2FsbGJhY2spO1xuICB9XG59XG4iXX0=