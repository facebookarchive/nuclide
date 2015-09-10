'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from 'nuclide-remote-uri';

type LinterTrace = {
  type: 'Trace';
  text?: string;
  html?: string;
  filePath: string;
  range?: atom$Range;
};

type LinterMessage = {
  type: 'Error' | 'Warning',
  text?: string,
  html?: string,
  filePath?: NuclideUri,
  range?: atom$Range,
  trace?: Array<LinterTrace>,
};

export type LinterProvider = {
  /** providerName is an extension to the current linter api. */
  providerName?: string;
  /** An extension allowing package authors to provide both the linter and
    * diagnostics services, and have Nuclide ignore the linter one. */
  disabledForNuclide?: boolean;
  grammarScopes: Array<string>;
  /** Extension to the linter API. Overrides grammarScopes if true, to trigger the linter on all
    * grammar scopes. */
  allGrammarScopes?: boolean;
  scope: 'file' | 'project';
  lintOnFly: bool;
  lint: (textEditor: TextEditor) => Promise<Array<LinterMessage>>;
};

var {DiagnosticsProviderBase} = require('nuclide-diagnostics-provider-base');

var {RequestSerializer} = require('nuclide-commons').promises;

function linterMessageToDiagnosticMessage(
  msg: LinterMessage,
  providerName: string,
): DiagnosticMessage {
  if (msg.filePath) {
    return {
      scope: 'file',
      providerName,
      type: msg.type,
      filePath: msg.filePath,
      text: msg.text,
      html: msg.html,
      range: msg.range,
      trace: msg.trace,
    };
  } else {
    return {
      scope: 'project',
      providerName,
      type: msg.type,
      text: msg.text,
      html: msg.html,
      range: msg.range,
      trace: msg.trace,
    };
  }
}

function linterMessagesToDiagnosticUpdate(
  currentPath: ?NuclideUri,
  msgs: Array<LinterMessage>,
  providerName?: string = 'Unnamed Linter',
): DiagnosticProviderUpdate {
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
      if (!filePathToMessages.has(path)) {
        filePathToMessages.set(path, []);
      }
      filePathToMessages.get(path).push(diagnosticMessage);
    } else { // Project scope.
      projectMessages.push(diagnosticMessage);
    }
  }
  return {
    filePathToMessages,
    projectMessages,
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
  _provider: LinterProvider;

  _enabled: boolean;

  _requestSerializer: RequestSerializer;

  _providerUtils: DiagnosticsProviderBase;

  constructor(
    provider: LinterProvider,
    ProviderBase?: typeof DiagnosticsProviderBase = DiagnosticsProviderBase,
  ) {
    var utilsOptions = {
      grammarScopes: new Set(provider.grammarScopes),
      enableForAllGrammars: provider.allGrammarScopes,
      shouldRunOnTheFly: provider.lintOnFly,
      onTextEditorEvent: editor => this._runLint(editor),
      onNewUpdateSubscriber: callback => this._newUpdateSubscriber(callback),
    };
    this._providerUtils = new ProviderBase(utilsOptions);
    this._provider = provider;
    this._enabled = true;
    this._requestSerializer = new RequestSerializer();
  }

  async _runLint(editor: TextEditor): Promise<void> {
    if (this._enabled) {
      var result = await this._requestSerializer.run(this._provider.lint(editor));
      if (result.status === 'success') {
        var linterMessages = result.result;
        var diagnosticUpdate = linterMessagesToDiagnosticUpdate(
          editor.getPath(),
          linterMessages, this._provider.providerName
        );
        this._providerUtils.publishMessageUpdate(diagnosticUpdate);
      }
    }
  }

  _newUpdateSubscriber(callback: MessageUpdateCallback): void {
    var activeTextEditor = atom.workspace.getActiveTextEditor();
    if (activeTextEditor) {
      var matchesGrammar =
        this._provider.grammarScopes.indexOf(activeTextEditor.getGrammar().scopeName) !== -1;
      if (!this._lintInProgress() && matchesGrammar) {
        this._runLint(activeTextEditor);
      }
    }
  }

  setEnabled(enabled: boolean): void {
    this._enabled = enabled;
  }

  setLintOnFly(lintOnFly: boolean): void {
    this._providerUtils.setRunOnTheFly(lintOnFly && this._provider.lintOnFly);
  }

  dispose(): void {
    this._providerUtils.dispose();
  }

  _lintInProgress(): boolean {
    return this._requestSerializer.isRunInProgress();
  }

  onMessageUpdate(callback: MessageUpdateCallback): atom$Disposable {
    return this._providerUtils.onMessageUpdate(callback);
  }

  onMessageInvalidation(callback: MessageInvalidationCallback): atom$Disposable {
    return this._providerUtils.onMessageInvalidation(callback);
  }
}

module.exports = LinterAdapter;
