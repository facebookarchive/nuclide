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
  // providerName is an extension to the current linter api
  providerName?: string;
  grammarScopes: Array<string>;
  // extension to the linter API. overrides grammarScopes if true, to trigger the linter on all grammar scopes
  allGrammarScopes?: boolean;
  scope: 'file' | 'project';
  lintOnFly: bool;
  lint: (textEditor: TextEditor) => Promise<Array<LinterMessage>>;
};

var {Emitter, Disposable, CompositeDisposable} = require('atom');

var {RequestSerializer} = require('nuclide-commons').promises;

function linterMessageToDiagnosticMessage(msg: LinterMessage, providerName: string): DiagnosticMessage {
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

function linterMessagesToDiagnosticUpdate(currentPath: ?NuclideUri, msgs: Array<LinterMessage>, providerName?: string = 'Unnamed Linter'): DiagnosticProviderUpdate {
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
    } else { // project scope
      projectMessages.push(diagnosticMessage);
    }
  }
  return {
    filePathToMessages,
    projectMessages,
  };
}

function getTextEventDispatcher() {
  return require('nuclide-text-event-dispatcher').getInstance();
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

  _emitter: Emitter;

  _disposables: CompositeDisposable;

  _enabled: boolean;

  _currentEventSubscription: ?atom$Disposable;

  _requestSerializer: RequestSerializer;

  constructor(provider: LinterProvider) {
    this._provider = provider;
    this._enabled = true;
    this._disposables = new CompositeDisposable();
    this._emitter = new Emitter();
    this._requestSerializer = new RequestSerializer();

    this._subscribeToEvent(provider.lintOnFly);
  }

  // Subscribes to the appropriate event depending on whether we should lint on
  // the fly or not.
  _subscribeToEvent(lintOnFly: boolean) {
    if (this._currentEventSubscription) {
      this._currentEventSubscription.dispose();
      this._currentEventSubscription = null;
    }
    var runLint = editor => this._runLint(editor);
    var dispatcher = getTextEventDispatcher();
    var subscription;
    if (lintOnFly) {
      if (this._provider.allGrammarScopes) {
        subscription = dispatcher.onAnyFileChange(runLint);
      } else {
        subscription = dispatcher.onFileChange(this._provider.grammarScopes, runLint);
      }
    } else {
      if (this._provider.allGrammarScopes) {
        subscription = dispatcher.onAnyFileSave(runLint);
      } else {
        subscription = dispatcher.onFileSave(this._provider.grammarScopes, runLint);
      }
    }
    this._currentEventSubscription = subscription;
    this._disposables.add(subscription);
  }

  async _runLint(editor: TextEditor): Promise<void> {
    if (this._enabled) {
      var result = await this._requestSerializer.run(this._provider.lint(editor));
      if (result.status === 'success') {
        var linterMessages = result.result;
        var diagnosticUpdate = linterMessagesToDiagnosticUpdate(editor.getPath(), linterMessages, this._provider.providerName);
        this._emitter.emit('update', diagnosticUpdate);
      }
    }
  }

  onMessageUpdate(callback: MessageUpdateCallback): atom$Disposable {
    var disposable = this._emitter.on('update', callback);
    var activeTextEditor = atom.workspace.getActiveTextEditor();
    if (activeTextEditor) {
      var matchesGrammar = this._provider.grammarScopes.indexOf(activeTextEditor.getGrammar().scopeName) !== -1;
      if (!this._lintInProgress() && matchesGrammar) {
        this._runLint(activeTextEditor);
      }
    }
    return disposable;
  }

  onMessageInvalidation(callback: MessageInvalidationCallback): atom$Disposable {
    // no-op; we don't publish invalidations
    return new Disposable(() => {});
  }

  setEnabled(enabled: boolean): void {
    this._enabled = enabled;
  }

  setLintOnFly(lintOnFly: boolean): void {
    this._subscribeToEvent(lintOnFly && this._provider.lintOnFly);
  }

  dispose(): void {
    this._emitter.dispose();
    this._disposables.dispose();
  }

  _lintInProgress(): boolean {
    return this._lastDispatchedLint > this._lastFinishedLint;
  }
}

module.exports = LinterAdapter;
