'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LinterAdapter = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.linterMessageToDiagnosticMessage = linterMessageToDiagnosticMessage;
exports.linterMessagesToDiagnosticUpdate = linterMessagesToDiagnosticUpdate;

var _atom = require('atom');

var _nuclideDiagnosticsProviderBase;

function _load_nuclideDiagnosticsProviderBase() {
  return _nuclideDiagnosticsProviderBase = require('../../nuclide-diagnostics-provider-base');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _promise;

function _load_promise() {
  return _promise = require('../../commons-node/promise');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Exported for testing.
function linterMessageToDiagnosticMessage(msg, providerName) {
  // The types are slightly different, so we need to copy to make Flow happy. Basically, a Trace
  // does not need a filePath property, but a LinterTrace does. Trace is a subtype of LinterTrace,
  // so copying works but aliasing does not. For a detailed explanation see
  // https://github.com/facebook/flow/issues/908
  const trace = msg.trace ? msg.trace.map(component => Object.assign({}, component)) : undefined;
  if (msg.filePath) {
    return {
      scope: 'file',
      providerName: msg.name != null ? msg.name : providerName,
      type: msg.type,
      filePath: msg.filePath,
      text: msg.text,
      html: msg.html,
      range: msg.range && _atom.Range.fromObject(msg.range),
      trace,
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
      range: msg.range && _atom.Range.fromObject(msg.range),
      trace
    };
  }
}

// Exported for testing.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function linterMessagesToDiagnosticUpdate(currentPath, msgs, providerName = 'Unnamed Linter') {
  const filePathToMessages = new Map();
  if (currentPath) {
    // Make sure we invalidate the messages for the current path. We may want to
    // figure out which other paths we want to invalidate if it turns out that
    // linters regularly return messages for other files.
    filePathToMessages.set(currentPath, []);
  }
  const projectMessages = [];
  for (const msg of msgs) {
    const diagnosticMessage = linterMessageToDiagnosticMessage(msg, providerName);
    if (diagnosticMessage.scope === 'file') {
      const path = diagnosticMessage.filePath;
      let messages = filePathToMessages.get(path);
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
    filePathToMessages,
    projectMessages
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
class LinterAdapter {

  /**
   * Keep track of the files with diagnostics for each text buffer.
   * This way we can accurately invalidate diagnostics when files are renamed.
   */
  constructor(provider, ProviderBase = (_nuclideDiagnosticsProviderBase || _load_nuclideDiagnosticsProviderBase()).DiagnosticsProviderBase) {
    const utilsOptions = {
      grammarScopes: new Set(provider.grammarScopes),
      enableForAllGrammars: provider.allGrammarScopes,
      shouldRunOnTheFly: provider.lintOnFly,
      onTextEditorEvent: editor => this._runLint(editor),
      onNewUpdateSubscriber: callback => this._newUpdateSubscriber(callback)
    };
    this._providerUtils = new ProviderBase(utilsOptions);
    this._provider = provider;
    this._enabled = true;
    this._requestSerializer = new (_promise || _load_promise()).RequestSerializer();
    this._filesForBuffer = new WeakMap();
    this._onDestroyDisposables = new Map();
  }

  _runLint(editor) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!_this._enabled) {
        return;
      }

      const maybe = _this._provider.lint(editor);
      if (maybe == null) {
        return;
      }

      const result = yield _this._requestSerializer.run(maybe);
      if (result.status !== 'success') {
        return;
      }

      const linterMessages = result.result;
      if (linterMessages == null) {
        return;
      }

      const buffer = editor.getBuffer();
      if (buffer.isDestroyed()) {
        return;
      }

      if (_this._provider.invalidateOnClose && !_this._onDestroyDisposables.has(buffer)) {
        const disposable = buffer.onDidDestroy(function () {
          _this._invalidateBuffer(buffer);
          _this._onDestroyDisposables.delete(buffer);
          disposable.dispose();
        });
        _this._onDestroyDisposables.set(buffer, disposable);
      }

      const diagnosticUpdate = linterMessagesToDiagnosticUpdate(editor.getPath(), linterMessages, _this._provider.providerName || _this._provider.name);
      _this._invalidateBuffer(buffer);
      _this._providerUtils.publishMessageUpdate(diagnosticUpdate);
      const { filePathToMessages } = diagnosticUpdate;
      if (filePathToMessages != null) {
        _this._filesForBuffer.set(buffer, Array.from(filePathToMessages.keys()));
      }
    })();
  }

  _newUpdateSubscriber(callback) {
    const activeTextEditor = atom.workspace.getActiveTextEditor();
    if (activeTextEditor && !(_nuclideUri || _load_nuclideUri()).default.isBrokenDeserializedUri(activeTextEditor.getPath())) {
      const matchesGrammar = this._provider.grammarScopes.indexOf(activeTextEditor.getGrammar().scopeName) !== -1;
      if (!this._lintInProgress() && matchesGrammar) {
        this._runLint(activeTextEditor);
      }
    }
  }

  setEnabled(enabled) {
    this._enabled = enabled;
  }

  setLintOnFly(lintOnFly) {
    this._providerUtils.setRunOnTheFly(lintOnFly && this._provider.lintOnFly);
  }

  dispose() {
    this._providerUtils.dispose();
    this._onDestroyDisposables.forEach(disposable => disposable.dispose());
    this._onDestroyDisposables.clear();
  }

  _lintInProgress() {
    return this._requestSerializer.isRunInProgress();
  }

  onMessageUpdate(callback) {
    return this._providerUtils.onMessageUpdate(callback);
  }

  onMessageInvalidation(callback) {
    return this._providerUtils.onMessageInvalidation(callback);
  }

  _invalidateBuffer(buffer) {
    const filePaths = this._filesForBuffer.get(buffer);
    if (filePaths != null) {
      this._providerUtils.publishMessageInvalidation({ scope: 'file', filePaths });
    }
  }
}
exports.LinterAdapter = LinterAdapter;