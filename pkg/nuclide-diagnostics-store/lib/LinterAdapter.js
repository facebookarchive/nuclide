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

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideDiagnosticsProviderBase2;

function _nuclideDiagnosticsProviderBase() {
  return _nuclideDiagnosticsProviderBase2 = require('../../nuclide-diagnostics-provider-base');
}

var _commonsNodePromise2;

function _commonsNodePromise() {
  return _commonsNodePromise2 = require('../../commons-node/promise');
}

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
      providerName: msg.name != null ? msg.name : providerName,
      type: msg.type,
      filePath: msg.filePath,
      text: msg.text,
      html: msg.html,
      range: msg.range && (_atom2 || _atom()).Range.fromObject(msg.range),
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
      providerName: msg.name != null ? msg.name : providerName,
      type: msg.type,
      text: msg.text,
      html: msg.html,
      range: msg.range && (_atom2 || _atom()).Range.fromObject(msg.range),
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

    var ProviderBase = arguments.length <= 1 || arguments[1] === undefined ? (_nuclideDiagnosticsProviderBase2 || _nuclideDiagnosticsProviderBase()).DiagnosticsProviderBase : arguments[1];

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
    this._requestSerializer = new (_commonsNodePromise2 || _commonsNodePromise()).RequestSerializer();
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