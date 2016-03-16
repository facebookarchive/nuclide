'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';

import type {
  DiagnosticMessage,
  DiagnosticProviderUpdate,
  FileDiagnosticMessage,
  LinterMessage,
  LinterProvider,
  ProjectDiagnosticMessage,
  MessageUpdateCallback,
  MessageInvalidationCallback,
} from '../../nuclide-diagnostics-base';

import {Range} from 'atom';

import {DiagnosticsProviderBase} from '../../nuclide-diagnostics-provider-base';

import {promises as commonsPromises} from '../../nuclide-commons';

const {RequestSerializer} = commonsPromises;

// Exported for testing.
export function linterMessageToDiagnosticMessage(
  msg: LinterMessage,
  providerName: string,
): DiagnosticMessage {
  // The types are slightly different, so we need to copy to make Flow happy. Basically, a Trace
  // does not need a filePath property, but a LinterTrace does. Trace is a subtype of LinterTrace,
  // so copying works but aliasing does not. For a detailed explanation see
  // https://github.com/facebook/flow/issues/908
  const trace = msg.trace ? msg.trace.map(component => ({...component})) : undefined;
  if (msg.filePath) {
    return ({
      scope: 'file',
      providerName,
      type: msg.type,
      filePath: msg.filePath,
      text: msg.text,
      html: msg.html,
      range: msg.range && Range.fromObject(msg.range),
      trace: trace,
      fix: msg.fix == null ? undefined : {
        oldRange: msg.fix.range,
        oldText: msg.fix.oldText,
        newText: msg.fix.newText,
      },
    }: FileDiagnosticMessage);
  } else {
    return ({
      scope: 'project',
      providerName,
      type: msg.type,
      text: msg.text,
      html: msg.html,
      range: msg.range && Range.fromObject(msg.range),
      trace: trace,
    }: ProjectDiagnosticMessage);
  }
}

// Exported for testing.
export function linterMessagesToDiagnosticUpdate(
  currentPath: ?NuclideUri,
  msgs: Array<LinterMessage>,
  providerName?: string = 'Unnamed Linter',
): DiagnosticProviderUpdate {
  const filePathToMessages: Map<NuclideUri, Array<FileDiagnosticMessage>> = new Map();
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
export class LinterAdapter {
  _provider: LinterProvider;

  _enabled: boolean;

  _requestSerializer: RequestSerializer;

  _providerUtils: DiagnosticsProviderBase;

  constructor(
    provider: LinterProvider,
    ProviderBase?: typeof DiagnosticsProviderBase = DiagnosticsProviderBase,
  ) {
    const utilsOptions = {
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
      const result = await this._requestSerializer.run(this._provider.lint(editor));
      if (result.status === 'success') {
        const linterMessages = result.result;
        const diagnosticUpdate = linterMessagesToDiagnosticUpdate(
          editor.getPath(),
          linterMessages, this._provider.providerName || this._provider.name
        );
        this._providerUtils.publishMessageUpdate(diagnosticUpdate);
      }
    }
  }

  _newUpdateSubscriber(callback: MessageUpdateCallback): void {
    const activeTextEditor = atom.workspace.getActiveTextEditor();
    if (activeTextEditor) {
      const matchesGrammar =
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

  onMessageUpdate(callback: MessageUpdateCallback): IDisposable {
    return this._providerUtils.onMessageUpdate(callback);
  }

  onMessageInvalidation(callback: MessageInvalidationCallback): IDisposable {
    return this._providerUtils.onMessageInvalidation(callback);
  }
}
