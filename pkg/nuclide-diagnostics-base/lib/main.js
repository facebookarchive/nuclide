'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Observable} from 'rxjs';
import type {NuclideUri} from '../../nuclide-remote-uri';

import type {TextEdit} from '../../nuclide-textedit';

export type InvalidationMessage = {
  scope: 'file';
  filePaths: Array<NuclideUri>;
} | {
  scope: 'project';
} | {
  scope: 'all';
};

export type MessageUpdateCallback = (update: DiagnosticProviderUpdate) => mixed;
export type MessageInvalidationCallback = (message: InvalidationMessage) => mixed;

// TODO figure out how to allow the diagnostic consumer to poll (for example, if
// it was just activated and wants diagnostic messages without having to wait
// for an event to occur)
export type CallbackDiagnosticProvider = {
  onMessageUpdate: (callback: MessageUpdateCallback) => IDisposable;
  onMessageInvalidation: (callback: MessageInvalidationCallback) => IDisposable;
};

export type ObservableDiagnosticProvider = {
  updates: Observable<DiagnosticProviderUpdate>;
  invalidations: Observable<InvalidationMessage>;
};

export type DiagnosticProvider = CallbackDiagnosticProvider | ObservableDiagnosticProvider;

// Implicit invalidation semantics:
//
// - Previous 'file' scope messages are invalidated if and only if
// filePathToMessages contains their key as a path.
//
// - All previous 'project' scope messages are invalidated whenever
// projectMessages is populated.
export type DiagnosticProviderUpdate = {
  filePathToMessages?: Map<NuclideUri, Array<FileDiagnosticMessage>>;
  projectMessages?: Array<ProjectDiagnosticMessage>;
};

export type MessageType = 'Error' | 'Warning';

export type Trace = {
  type: 'Trace';
  text?: string;
  html?: string;
  filePath?: NuclideUri;
  range?: atom$Range;
};

export type FileDiagnosticMessage = {
  scope: 'file';
  providerName: string;
  type: MessageType;
  filePath: NuclideUri;
  text?: string;
  html?: string;
  range?: atom$Range;
  trace?: Array<Trace>;
  fix?: TextEdit;
};

export type ProjectDiagnosticMessage = {
  scope: 'project';
  providerName: string;
  type: MessageType;
  text?: string;
  html?: string;
  range?: atom$Range;
  trace?: Array<Trace>;
};

export type FileMessageUpdate = {
  filePath: NuclideUri;
  messages: Array<FileDiagnosticMessage>;
};

export type DiagnosticMessage = FileDiagnosticMessage | ProjectDiagnosticMessage;

export type DiagnosticUpdater = {
  onFileMessagesDidUpdate:
    (callback: (update: FileMessageUpdate) => mixed, filePath: NuclideUri) => IDisposable;
  onProjectMessagesDidUpdate:
    (callback: (messages: Array<ProjectDiagnosticMessage>) => mixed) => IDisposable;
  onAllMessagesDidUpdate:
    (callback: (messages: Array<DiagnosticMessage>) => mixed) => IDisposable;
  applyFix: (message: FileDiagnosticMessage) => void;
  applyFixesForFile: (file: NuclideUri) => void;
};

import DiagnosticStore from './DiagnosticStore';

/**
 * Linter APIs, for compatibility with the Atom linter package.
 */

export type LinterTrace = {
  type: 'Trace';
  text?: string;
  html?: string;
  filePath: string;
  range?: atom$Range;
};

export type LinterMessage = {
  type: 'Error' | 'Warning';
  text?: string;
  html?: string;
  filePath?: NuclideUri;
  range?: atom$Range;
  trace?: Array<LinterTrace>;
  fix?: {
    range: atom$Range;
    newText: string;
    oldText?: string;
  };
};

export type LinterProvider = {
  /**
   * Extension: Allows a provider to include a display name that will be shown with its messages.
   */
  providerName?: string;
  /**
   * In the official Linter API, the providerName is just "name".
   */
  name?: string;
  /**
   * Extension: Intended for developers who want to provide both interfaces to cater towards people
   * who use only the `linter` package. This way you can provide both, but tell Nuclide to ignore
   * the `linter` provider so that duplicate results do not appear.
   */
  disabledForNuclide?: boolean;
  grammarScopes: Array<string>;
  /**
   * Extension: Overrides `grammarScopes` and triggers the linter on changes to any file, rather
   * than just files with specific grammar scopes.
   */
  allGrammarScopes?: boolean;
  scope: 'file' | 'project';
  lintOnFly: boolean;
  lint: (textEditor: TextEditor) => Promise<Array<LinterMessage>>;
};

module.exports = {
  DiagnosticStore,
};
