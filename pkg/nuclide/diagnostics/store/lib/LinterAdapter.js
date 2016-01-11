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
      trace: trace
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxpbnRlckFkYXB0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBaUVvQixNQUFNOzs0QkFFWSxxQkFBcUI7O3VCQUVqQixrQkFBa0I7O0lBRXJELGlCQUFpQixxQkFBakIsaUJBQWlCOzs7O0FBR2pCLFNBQVMsZ0NBQWdDLENBQzlDLEdBQWtCLEVBQ2xCLFlBQW9CLEVBQ0Q7Ozs7O0FBS25CLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxTQUFTO3dCQUFTLFNBQVM7R0FBRSxDQUFDLEdBQUcsU0FBUyxDQUFDO0FBQ25GLE1BQUksR0FBRyxDQUFDLFFBQVEsRUFBRTtBQUNoQixXQUFRO0FBQ04sV0FBSyxFQUFFLE1BQU07QUFDYixrQkFBWSxFQUFaLFlBQVk7QUFDWixVQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7QUFDZCxjQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVE7QUFDdEIsVUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO0FBQ2QsVUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO0FBQ2QsV0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLLElBQUksWUFBTSxVQUFVLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztBQUMvQyxXQUFLLEVBQUUsS0FBSztLQUNiLENBQXlCO0dBQzNCLE1BQU07QUFDTCxXQUFRO0FBQ04sV0FBSyxFQUFFLFNBQVM7QUFDaEIsa0JBQVksRUFBWixZQUFZO0FBQ1osVUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO0FBQ2QsVUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO0FBQ2QsVUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO0FBQ2QsV0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLLElBQUksWUFBTSxVQUFVLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztBQUMvQyxXQUFLLEVBQUUsS0FBSztLQUNiLENBQTRCO0dBQzlCO0NBQ0Y7Ozs7QUFHTSxTQUFTLGdDQUFnQyxDQUM5QyxXQUF3QixFQUN4QixJQUEwQixFQUVBO01BRDFCLFlBQXFCLHlEQUFHLGdCQUFnQjs7QUFFeEMsTUFBTSxrQkFBaUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ3BGLE1BQUksV0FBVyxFQUFFOzs7O0FBSWYsc0JBQWtCLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztHQUN6QztBQUNELE1BQU0sZUFBZSxHQUFHLEVBQUUsQ0FBQztBQUMzQixPQUFLLElBQU0sR0FBRyxJQUFJLElBQUksRUFBRTtBQUN0QixRQUFNLGlCQUFpQixHQUFHLGdDQUFnQyxDQUFDLEdBQUcsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUM5RSxRQUFJLGlCQUFpQixDQUFDLEtBQUssS0FBSyxNQUFNLEVBQUU7QUFDdEMsVUFBTSxJQUFJLEdBQUcsaUJBQWlCLENBQUMsUUFBUSxDQUFDO0FBQ3hDLFVBQUksUUFBUSxHQUFHLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QyxVQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7QUFDcEIsZ0JBQVEsR0FBRyxFQUFFLENBQUM7QUFDZCwwQkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO09BQ3hDO0FBQ0QsY0FBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ2xDLE1BQU07O0FBQ0wscUJBQWUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUN6QztHQUNGO0FBQ0QsU0FBTztBQUNMLHNCQUFrQixFQUFsQixrQkFBa0I7QUFDbEIsbUJBQWUsRUFBZixlQUFlO0dBQ2hCLENBQUM7Q0FDSDs7Ozs7Ozs7Ozs7Ozs7SUFhWSxhQUFhO0FBU2IsV0FUQSxhQUFhLENBVXRCLFFBQXdCLEVBRXhCOzs7UUFEQSxZQUE2Qzs7MEJBWHBDLGFBQWE7O0FBYXRCLFFBQU0sWUFBWSxHQUFHO0FBQ25CLG1CQUFhLEVBQUUsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQztBQUM5QywwQkFBb0IsRUFBRSxRQUFRLENBQUMsZ0JBQWdCO0FBQy9DLHVCQUFpQixFQUFFLFFBQVEsQ0FBQyxTQUFTO0FBQ3JDLHVCQUFpQixFQUFFLDJCQUFBLE1BQU07ZUFBSSxNQUFLLFFBQVEsQ0FBQyxNQUFNLENBQUM7T0FBQTtBQUNsRCwyQkFBcUIsRUFBRSwrQkFBQSxRQUFRO2VBQUksTUFBSyxvQkFBb0IsQ0FBQyxRQUFRLENBQUM7T0FBQTtLQUN2RSxDQUFDO0FBQ0YsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNyRCxRQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztBQUMxQixRQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztBQUNyQixRQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO0dBQ25EOztlQXhCVSxhQUFhOzs2QkEwQlYsV0FBQyxNQUFrQixFQUFpQjtBQUNoRCxVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDOUUsWUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtBQUMvQixjQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ3JDLGNBQU0sZ0JBQWdCLEdBQUcsZ0NBQWdDLENBQ3ZELE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFDaEIsY0FBYyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUNuRSxDQUFDO0FBQ0YsY0FBSSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1NBQzVEO09BQ0Y7S0FDRjs7O1dBRW1CLDhCQUFDLFFBQStCLEVBQVE7QUFDMUQsVUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDOUQsVUFBSSxnQkFBZ0IsRUFBRTtBQUNwQixZQUFNLGNBQWMsR0FDbEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ3ZGLFlBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksY0FBYyxFQUFFO0FBQzdDLGNBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztTQUNqQztPQUNGO0tBQ0Y7OztXQUVTLG9CQUFDLE9BQWdCLEVBQVE7QUFDakMsVUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7S0FDekI7OztXQUVXLHNCQUFDLFNBQWtCLEVBQVE7QUFDckMsVUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDM0U7OztXQUVNLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUMvQjs7O1dBRWMsMkJBQVk7QUFDekIsYUFBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxFQUFFLENBQUM7S0FDbEQ7OztXQUVjLHlCQUFDLFFBQStCLEVBQW1CO0FBQ2hFLGFBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDdEQ7OztXQUVvQiwrQkFBQyxRQUFxQyxFQUFtQjtBQUM1RSxhQUFPLElBQUksQ0FBQyxjQUFjLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDNUQ7OztTQXpFVSxhQUFhIiwiZmlsZSI6IkxpbnRlckFkYXB0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmltcG9ydCB0eXBlIHtcbiAgRGlhZ25vc3RpY01lc3NhZ2UsXG4gIERpYWdub3N0aWNQcm92aWRlclVwZGF0ZSxcbiAgRmlsZURpYWdub3N0aWNNZXNzYWdlLFxuICBQcm9qZWN0RGlhZ25vc3RpY01lc3NhZ2UsXG4gIE1lc3NhZ2VVcGRhdGVDYWxsYmFjayxcbiAgTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrLFxufSBmcm9tICcuLi8uLi9iYXNlJztcblxudHlwZSBMaW50ZXJUcmFjZSA9IHtcbiAgdHlwZTogJ1RyYWNlJztcbiAgdGV4dD86IHN0cmluZztcbiAgaHRtbD86IHN0cmluZztcbiAgZmlsZVBhdGg6IHN0cmluZztcbiAgcmFuZ2U/OiBhdG9tJFJhbmdlO1xufTtcblxudHlwZSBMaW50ZXJNZXNzYWdlID0ge1xuICB0eXBlOiAnRXJyb3InIHwgJ1dhcm5pbmcnLFxuICB0ZXh0Pzogc3RyaW5nLFxuICBodG1sPzogc3RyaW5nLFxuICBmaWxlUGF0aD86IE51Y2xpZGVVcmksXG4gIHJhbmdlPzogYXRvbSRSYW5nZSxcbiAgdHJhY2U/OiBBcnJheTxMaW50ZXJUcmFjZT4sXG59O1xuXG5leHBvcnQgdHlwZSBMaW50ZXJQcm92aWRlciA9IHtcbiAgLyoqXG4gICAqIEV4dGVuc2lvbjogQWxsb3dzIGEgcHJvdmlkZXIgdG8gaW5jbHVkZSBhIGRpc3BsYXkgbmFtZSB0aGF0IHdpbGwgYmUgc2hvd24gd2l0aCBpdHMgbWVzc2FnZXMuXG4gICAqL1xuICBwcm92aWRlck5hbWU/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBJbiB0aGUgb2ZmaWNpYWwgTGludGVyIEFQSSwgdGhlIHByb3ZpZGVyTmFtZSBpcyBqdXN0IFwibmFtZVwiLlxuICAgKi9cbiAgbmFtZT86IHN0cmluZztcbiAgLyoqXG4gICAqIEV4dGVuc2lvbjogSW50ZW5kZWQgZm9yIGRldmVsb3BlcnMgd2hvIHdhbnQgdG8gcHJvdmlkZSBib3RoIGludGVyZmFjZXMgdG8gY2F0ZXIgdG93YXJkcyBwZW9wbGVcbiAgICogd2hvIHVzZSBvbmx5IHRoZSBgbGludGVyYCBwYWNrYWdlLiBUaGlzIHdheSB5b3UgY2FuIHByb3ZpZGUgYm90aCwgYnV0IHRlbGwgTnVjbGlkZSB0byBpZ25vcmVcbiAgICogdGhlIGBsaW50ZXJgIHByb3ZpZGVyIHNvIHRoYXQgZHVwbGljYXRlIHJlc3VsdHMgZG8gbm90IGFwcGVhci5cbiAgICovXG4gIGRpc2FibGVkRm9yTnVjbGlkZT86IGJvb2xlYW47XG4gIGdyYW1tYXJTY29wZXM6IEFycmF5PHN0cmluZz47XG4gIC8qKlxuICAgKiBFeHRlbnNpb246IE92ZXJyaWRlcyBgZ3JhbW1hclNjb3Blc2AgYW5kIHRyaWdnZXJzIHRoZSBsaW50ZXIgb24gY2hhbmdlcyB0byBhbnkgZmlsZSwgcmF0aGVyXG4gICAqIHRoYW4ganVzdCBmaWxlcyB3aXRoIHNwZWNpZmljIGdyYW1tYXIgc2NvcGVzLlxuICAgKi9cbiAgYWxsR3JhbW1hclNjb3Blcz86IGJvb2xlYW47XG4gIHNjb3BlOiAnZmlsZScgfCAncHJvamVjdCc7XG4gIGxpbnRPbkZseTogYm9vbGVhbjtcbiAgbGludDogKHRleHRFZGl0b3I6IFRleHRFZGl0b3IpID0+IFByb21pc2U8QXJyYXk8TGludGVyTWVzc2FnZT4+O1xufTtcblxuaW1wb3J0IHtSYW5nZX0gZnJvbSAnYXRvbSc7XG5cbmltcG9ydCB7RGlhZ25vc3RpY3NQcm92aWRlckJhc2V9IGZyb20gJy4uLy4uL3Byb3ZpZGVyLWJhc2UnO1xuXG5pbXBvcnQge3Byb21pc2VzIGFzIGNvbW1vbnNQcm9taXNlc30gZnJvbSAnLi4vLi4vLi4vY29tbW9ucyc7XG5cbmNvbnN0IHtSZXF1ZXN0U2VyaWFsaXplcn0gPSBjb21tb25zUHJvbWlzZXM7XG5cbi8vIEV4cG9ydGVkIGZvciB0ZXN0aW5nLlxuZXhwb3J0IGZ1bmN0aW9uIGxpbnRlck1lc3NhZ2VUb0RpYWdub3N0aWNNZXNzYWdlKFxuICBtc2c6IExpbnRlck1lc3NhZ2UsXG4gIHByb3ZpZGVyTmFtZTogc3RyaW5nLFxuKTogRGlhZ25vc3RpY01lc3NhZ2Uge1xuICAvLyBUaGUgdHlwZXMgYXJlIHNsaWdodGx5IGRpZmZlcmVudCwgc28gd2UgbmVlZCB0byBjb3B5IHRvIG1ha2UgRmxvdyBoYXBweS4gQmFzaWNhbGx5LCBhIFRyYWNlXG4gIC8vIGRvZXMgbm90IG5lZWQgYSBmaWxlUGF0aCBwcm9wZXJ0eSwgYnV0IGEgTGludGVyVHJhY2UgZG9lcy4gVHJhY2UgaXMgYSBzdWJ0eXBlIG9mIExpbnRlclRyYWNlLFxuICAvLyBzbyBjb3B5aW5nIHdvcmtzIGJ1dCBhbGlhc2luZyBkb2VzIG5vdC4gRm9yIGEgZGV0YWlsZWQgZXhwbGFuYXRpb24gc2VlXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9mbG93L2lzc3Vlcy85MDhcbiAgY29uc3QgdHJhY2UgPSBtc2cudHJhY2UgPyBtc2cudHJhY2UubWFwKGNvbXBvbmVudCA9PiAoey4uLmNvbXBvbmVudH0pKSA6IHVuZGVmaW5lZDtcbiAgaWYgKG1zZy5maWxlUGF0aCkge1xuICAgIHJldHVybiAoe1xuICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgIHByb3ZpZGVyTmFtZSxcbiAgICAgIHR5cGU6IG1zZy50eXBlLFxuICAgICAgZmlsZVBhdGg6IG1zZy5maWxlUGF0aCxcbiAgICAgIHRleHQ6IG1zZy50ZXh0LFxuICAgICAgaHRtbDogbXNnLmh0bWwsXG4gICAgICByYW5nZTogbXNnLnJhbmdlICYmIFJhbmdlLmZyb21PYmplY3QobXNnLnJhbmdlKSxcbiAgICAgIHRyYWNlOiB0cmFjZSxcbiAgICB9OiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAoe1xuICAgICAgc2NvcGU6ICdwcm9qZWN0JyxcbiAgICAgIHByb3ZpZGVyTmFtZSxcbiAgICAgIHR5cGU6IG1zZy50eXBlLFxuICAgICAgdGV4dDogbXNnLnRleHQsXG4gICAgICBodG1sOiBtc2cuaHRtbCxcbiAgICAgIHJhbmdlOiBtc2cucmFuZ2UgJiYgUmFuZ2UuZnJvbU9iamVjdChtc2cucmFuZ2UpLFxuICAgICAgdHJhY2U6IHRyYWNlLFxuICAgIH06IFByb2plY3REaWFnbm9zdGljTWVzc2FnZSk7XG4gIH1cbn1cblxuLy8gRXhwb3J0ZWQgZm9yIHRlc3RpbmcuXG5leHBvcnQgZnVuY3Rpb24gbGludGVyTWVzc2FnZXNUb0RpYWdub3N0aWNVcGRhdGUoXG4gIGN1cnJlbnRQYXRoOiA/TnVjbGlkZVVyaSxcbiAgbXNnczogQXJyYXk8TGludGVyTWVzc2FnZT4sXG4gIHByb3ZpZGVyTmFtZT86IHN0cmluZyA9ICdVbm5hbWVkIExpbnRlcicsXG4pOiBEaWFnbm9zdGljUHJvdmlkZXJVcGRhdGUge1xuICBjb25zdCBmaWxlUGF0aFRvTWVzc2FnZXM6IE1hcDxOdWNsaWRlVXJpLCBBcnJheTxGaWxlRGlhZ25vc3RpY01lc3NhZ2U+PiA9IG5ldyBNYXAoKTtcbiAgaWYgKGN1cnJlbnRQYXRoKSB7XG4gICAgLy8gTWFrZSBzdXJlIHdlIGludmFsaWRhdGUgdGhlIG1lc3NhZ2VzIGZvciB0aGUgY3VycmVudCBwYXRoLiBXZSBtYXkgd2FudCB0b1xuICAgIC8vIGZpZ3VyZSBvdXQgd2hpY2ggb3RoZXIgcGF0aHMgd2Ugd2FudCB0byBpbnZhbGlkYXRlIGlmIGl0IHR1cm5zIG91dCB0aGF0XG4gICAgLy8gbGludGVycyByZWd1bGFybHkgcmV0dXJuIG1lc3NhZ2VzIGZvciBvdGhlciBmaWxlcy5cbiAgICBmaWxlUGF0aFRvTWVzc2FnZXMuc2V0KGN1cnJlbnRQYXRoLCBbXSk7XG4gIH1cbiAgY29uc3QgcHJvamVjdE1lc3NhZ2VzID0gW107XG4gIGZvciAoY29uc3QgbXNnIG9mIG1zZ3MpIHtcbiAgICBjb25zdCBkaWFnbm9zdGljTWVzc2FnZSA9IGxpbnRlck1lc3NhZ2VUb0RpYWdub3N0aWNNZXNzYWdlKG1zZywgcHJvdmlkZXJOYW1lKTtcbiAgICBpZiAoZGlhZ25vc3RpY01lc3NhZ2Uuc2NvcGUgPT09ICdmaWxlJykge1xuICAgICAgY29uc3QgcGF0aCA9IGRpYWdub3N0aWNNZXNzYWdlLmZpbGVQYXRoO1xuICAgICAgbGV0IG1lc3NhZ2VzID0gZmlsZVBhdGhUb01lc3NhZ2VzLmdldChwYXRoKTtcbiAgICAgIGlmIChtZXNzYWdlcyA9PSBudWxsKSB7XG4gICAgICAgIG1lc3NhZ2VzID0gW107XG4gICAgICAgIGZpbGVQYXRoVG9NZXNzYWdlcy5zZXQocGF0aCwgbWVzc2FnZXMpO1xuICAgICAgfVxuICAgICAgbWVzc2FnZXMucHVzaChkaWFnbm9zdGljTWVzc2FnZSk7XG4gICAgfSBlbHNlIHsgLy8gUHJvamVjdCBzY29wZS5cbiAgICAgIHByb2plY3RNZXNzYWdlcy5wdXNoKGRpYWdub3N0aWNNZXNzYWdlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBmaWxlUGF0aFRvTWVzc2FnZXMsXG4gICAgcHJvamVjdE1lc3NhZ2VzLFxuICB9O1xufVxuXG4vKipcbiAqIFByb3ZpZGVzIGFuIGFkYXB0ZXIgYmV0d2VlbiBsZWdhY3kgbGludGVycyAoZGVmaW5lZCBieSB0aGUgTGludGVyUHJvdmlkZXJcbiAqIHR5cGUpLCBhbmQgTnVjbGlkZSBEaWFnbm9zdGljIFByb3ZpZGVycy5cbiAqXG4gKiBUaGUgY29uc3RydWN0b3IgdGFrZXMgYSBMaW50ZXJQcm92aWRlciBhcyBhbiBhcmd1bWVudCwgYW5kIHRoZSByZXN1bHRpbmdcbiAqIExpbnRlckFkYXB0ZXIgaXMgYSB2YWxpZCBEaWFnbm9zdGljUHJvdmlkZXIuXG4gKlxuICogTm90ZSB0aGF0IHRoaXMgYWxsb3dzIGFuIGV4dGVuc2lvbiB0byBvcmRpbmFyeSBMaW50ZXJQcm92aWRlcnMuIFdlIGFsbG93IGFuXG4gKiBvcHRpb25hbCBhZGRpdGlvbmFsIGZpZWxkLCBwcm92aWRlck5hbWUsIHRvIGluZGljYXRlIHRoZSBkaXNwbGF5IG5hbWUgb2YgdGhlXG4gKiBsaW50ZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBMaW50ZXJBZGFwdGVyIHtcbiAgX3Byb3ZpZGVyOiBMaW50ZXJQcm92aWRlcjtcblxuICBfZW5hYmxlZDogYm9vbGVhbjtcblxuICBfcmVxdWVzdFNlcmlhbGl6ZXI6IFJlcXVlc3RTZXJpYWxpemVyO1xuXG4gIF9wcm92aWRlclV0aWxzOiBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcm92aWRlcjogTGludGVyUHJvdmlkZXIsXG4gICAgUHJvdmlkZXJCYXNlPzogdHlwZW9mIERpYWdub3N0aWNzUHJvdmlkZXJCYXNlID0gRGlhZ25vc3RpY3NQcm92aWRlckJhc2UsXG4gICkge1xuICAgIGNvbnN0IHV0aWxzT3B0aW9ucyA9IHtcbiAgICAgIGdyYW1tYXJTY29wZXM6IG5ldyBTZXQocHJvdmlkZXIuZ3JhbW1hclNjb3BlcyksXG4gICAgICBlbmFibGVGb3JBbGxHcmFtbWFyczogcHJvdmlkZXIuYWxsR3JhbW1hclNjb3BlcyxcbiAgICAgIHNob3VsZFJ1bk9uVGhlRmx5OiBwcm92aWRlci5saW50T25GbHksXG4gICAgICBvblRleHRFZGl0b3JFdmVudDogZWRpdG9yID0+IHRoaXMuX3J1bkxpbnQoZWRpdG9yKSxcbiAgICAgIG9uTmV3VXBkYXRlU3Vic2NyaWJlcjogY2FsbGJhY2sgPT4gdGhpcy5fbmV3VXBkYXRlU3Vic2NyaWJlcihjYWxsYmFjayksXG4gICAgfTtcbiAgICB0aGlzLl9wcm92aWRlclV0aWxzID0gbmV3IFByb3ZpZGVyQmFzZSh1dGlsc09wdGlvbnMpO1xuICAgIHRoaXMuX3Byb3ZpZGVyID0gcHJvdmlkZXI7XG4gICAgdGhpcy5fZW5hYmxlZCA9IHRydWU7XG4gICAgdGhpcy5fcmVxdWVzdFNlcmlhbGl6ZXIgPSBuZXcgUmVxdWVzdFNlcmlhbGl6ZXIoKTtcbiAgfVxuXG4gIGFzeW5jIF9ydW5MaW50KGVkaXRvcjogVGV4dEVkaXRvcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLl9lbmFibGVkKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9yZXF1ZXN0U2VyaWFsaXplci5ydW4odGhpcy5fcHJvdmlkZXIubGludChlZGl0b3IpKTtcbiAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSAnc3VjY2VzcycpIHtcbiAgICAgICAgY29uc3QgbGludGVyTWVzc2FnZXMgPSByZXN1bHQucmVzdWx0O1xuICAgICAgICBjb25zdCBkaWFnbm9zdGljVXBkYXRlID0gbGludGVyTWVzc2FnZXNUb0RpYWdub3N0aWNVcGRhdGUoXG4gICAgICAgICAgZWRpdG9yLmdldFBhdGgoKSxcbiAgICAgICAgICBsaW50ZXJNZXNzYWdlcywgdGhpcy5fcHJvdmlkZXIucHJvdmlkZXJOYW1lIHx8IHRoaXMuX3Byb3ZpZGVyLm5hbWVcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5fcHJvdmlkZXJVdGlscy5wdWJsaXNoTWVzc2FnZVVwZGF0ZShkaWFnbm9zdGljVXBkYXRlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfbmV3VXBkYXRlU3Vic2NyaWJlcihjYWxsYmFjazogTWVzc2FnZVVwZGF0ZUNhbGxiYWNrKTogdm9pZCB7XG4gICAgY29uc3QgYWN0aXZlVGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoYWN0aXZlVGV4dEVkaXRvcikge1xuICAgICAgY29uc3QgbWF0Y2hlc0dyYW1tYXIgPVxuICAgICAgICB0aGlzLl9wcm92aWRlci5ncmFtbWFyU2NvcGVzLmluZGV4T2YoYWN0aXZlVGV4dEVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lKSAhPT0gLTE7XG4gICAgICBpZiAoIXRoaXMuX2xpbnRJblByb2dyZXNzKCkgJiYgbWF0Y2hlc0dyYW1tYXIpIHtcbiAgICAgICAgdGhpcy5fcnVuTGludChhY3RpdmVUZXh0RWRpdG9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXRFbmFibGVkKGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9lbmFibGVkID0gZW5hYmxlZDtcbiAgfVxuXG4gIHNldExpbnRPbkZseShsaW50T25GbHk6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9wcm92aWRlclV0aWxzLnNldFJ1bk9uVGhlRmx5KGxpbnRPbkZseSAmJiB0aGlzLl9wcm92aWRlci5saW50T25GbHkpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9wcm92aWRlclV0aWxzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9saW50SW5Qcm9ncmVzcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fcmVxdWVzdFNlcmlhbGl6ZXIuaXNSdW5JblByb2dyZXNzKCk7XG4gIH1cblxuICBvbk1lc3NhZ2VVcGRhdGUoY2FsbGJhY2s6IE1lc3NhZ2VVcGRhdGVDYWxsYmFjayk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3ZpZGVyVXRpbHMub25NZXNzYWdlVXBkYXRlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjazogTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrKTogYXRvbSREaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvdmlkZXJVdGlscy5vbk1lc3NhZ2VJbnZhbGlkYXRpb24oY2FsbGJhY2spO1xuICB9XG59XG4iXX0=