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
  scope: 'file' | 'project';
  lintOnFly: bool;
  lint: (textEditor: TextEditor) => Promise<Array<LinterMessage>>;
};

var {Emitter, Disposable, CompositeDisposable} = require('atom');

var {TextEventDispatcher} = require('./TextEventDispatcher');

function linterMessageToDiagnosticMessage(msg: LinterMessage, providerName?: string = ''): DiagnosticMessage {
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

function linterMessagesToDiagnosticUpdate(msgs: Array<LinterMessage>): DiagnosticProviderUpdate {
  var filePathToMessages = new Map();
  var projectMessages = [];
  for (var msg of msgs) {
    var diagnosticMessage = linterMessageToDiagnosticMessage(msg);
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

var textEventDispatcher;

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
  _emitter: Emitter;

  _disposables: CompositeDisposable;

  _enabled: boolean;

  constructor(provider: LinterProvider) {
    this._enabled = true;
    if (!textEventDispatcher) {
      textEventDispatcher = new TextEventDispatcher();
    }
    this._disposables = new CompositeDisposable();
    this._emitter = new Emitter();
    var runLint = async editor => {
      if (this._enabled) {
        var linterMessages = await provider.lint(editor);
        var diagnosticUpdate = linterMessagesToDiagnosticUpdate(linterMessages);
        this._emitter.emit('update', diagnosticUpdate);
      }
    };
    if (provider.lintOnFly) {
      this._disposables.add(textEventDispatcher.onFileChange(provider.grammarScopes, runLint));
    } else {
      this._disposables.add(textEventDispatcher.onFileSave(provider.grammarScopes, runLint));
    }
  }

  onMessageUpdate(callback: MessageUpdateCallback): atom$Disposable {
    return this._emitter.on('update', callback);
  }

  onMessageInvalidation(callback: MessageInvalidationCallback): atom$Disposable {
    // no-op; we don't publish invalidations
    return new Disposable(() => {});
  }

  setEnabled(enabled: boolean): void {
    this._enabled = enabled;
  }

  dispose(): void {
    this._emitter.dispose();
    this._disposables.dispose();
  }
}

module.exports = LinterAdapter;
