/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {Observable} from 'rxjs';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {
  InvalidationMessage,
  DiagnosticProviderUpdate,
  FileDiagnosticMessage,
  ProjectDiagnosticMessage,
} from './rpc-types';

export type {
  InvalidationMessage,
  DiagnosticProviderUpdate,
  FileDiagnosticMessage,
  ProjectDiagnosticMessage,
};

export type MessageUpdateCallback = (update: DiagnosticProviderUpdate) => mixed;
export type MessageInvalidationCallback = (
  message: InvalidationMessage,
) => mixed;

// TODO figure out how to allow the diagnostic consumer to poll (for example, if
// it was just activated and wants diagnostic messages without having to wait
// for an event to occur)
export type CallbackDiagnosticProvider = {
  onMessageUpdate(callback: MessageUpdateCallback): IDisposable,
  onMessageInvalidation(callback: MessageInvalidationCallback): IDisposable,
};

export type ObservableDiagnosticProvider = {
  updates: Observable<DiagnosticProviderUpdate>,
  invalidations: Observable<InvalidationMessage>,
};

export type DiagnosticProvider =
  | CallbackDiagnosticProvider
  | ObservableDiagnosticProvider;

export type FileMessageUpdate = {
  filePath: NuclideUri,
  messages: Array<FileDiagnosticMessage>,
};

export type DiagnosticMessage =
  | FileDiagnosticMessage
  | ProjectDiagnosticMessage;

export type DiagnosticUpdater = {
  onFileMessagesDidUpdate: (
    callback: (update: FileMessageUpdate) => mixed,
    filePath: NuclideUri,
  ) => IDisposable,
  onProjectMessagesDidUpdate: (
    callback: (messages: Array<ProjectDiagnosticMessage>) => mixed,
  ) => IDisposable,
  onAllMessagesDidUpdate: (
    callback: (messages: Array<DiagnosticMessage>) => mixed,
  ) => IDisposable,
  applyFix: (message: FileDiagnosticMessage) => void,
  applyFixesForFile: (file: NuclideUri) => void,
};

export type ObservableDiagnosticUpdater = {
  // All observables here will issue an initial value on subscribe.

  // Sent only when the messages for a given file change. Consumers may use this to avoid
  // unnecessary work if the file(s) they are interested in are not changed.
  getFileMessageUpdates: (
    filePath: NuclideUri,
  ) => Observable<FileMessageUpdate>,
  // Sent whenever any project message changes.
  projectMessageUpdates: Observable<Array<ProjectDiagnosticMessage>>,
  // Sent whenever any message changes, and includes all messages.
  allMessageUpdates: Observable<Array<DiagnosticMessage>>,
  applyFix: (message: FileDiagnosticMessage) => void,
  applyFixesForFile: (file: NuclideUri) => void,
};

export {default as DiagnosticStore} from './DiagnosticStore';

/**
 * Linter APIs, for compatibility with the Atom linter package.
 */

export type LinterTrace = {
  type: 'Trace',
  text?: string,
  html?: string,
  filePath: string,
  range?: atom$Range,
};

export type LinterMessageV1 = {
  type: 'Error' | 'Warning' | 'Info',
  text?: string,
  html?: string,
  /*
   * Allows overriding of the LinterProvider name per message. Useful for when
   * a provider's messages come from multiple lint sources.
   */
  name?: string,
  filePath?: NuclideUri,
  range?: atom$RangeLike,
  trace?: Array<LinterTrace>,
  fix?: {
    range: atom$RangeLike,
    newText: string,
    oldText?: string,
  },
};

export type LinterMessageV2 = {
  type?: void, // Hint for Flow.
  location: {
    file: string,
    position: atom$RangeLike,
  },
  reference?: {
    file: string,
    position?: atom$PointLike,
  },
  // Extension: preserve the v1 traces API, as it's still pretty useful.
  // Languages like C++ can have errors with a huge stack, so one reference isn't enough.
  // `reference` will be ignored if this is provided.
  trace?: Array<LinterTrace>,
  // TODO: use the URL and icon fields.
  url?: string,
  icon?: string,
  excerpt: string,
  severity: 'error' | 'warning' | 'info',
  // TODO: only the first solution is used at the moment.
  solutions?: Array<

      | {
          title?: string,
          position: atom$RangeLike,
          priority?: number,
          currentText?: string,
          replaceWith: string,
        }
      | {
          // TODO: not currently supported.
          title?: string,
          position: atom$RangeLike,
          priority?: number,
          apply: () => any,
          replaceWith?: void, // Hint for Flow.
        },
  >,
  // TODO: the callback version is not supported.
  description?: string | (() => Promise<string> | string),
};

export type LinterMessage = LinterMessageV1 | LinterMessageV2;

export type LinterProvider = {
  name: string,
  grammarScopes: Array<string>,
  scope: 'file' | 'project',
  // Linter v2 renames lintOnFly to lintsOnChange. Accept both.
  lintsOnChange?: boolean,
  lintOnFly?: boolean,
  lint: (textEditor: TextEditor) => ?Promise<?Array<LinterMessage>>,
};

export {
  TextEventDispatcher,
  observeTextEditorEvents,
} from './TextEventDispatcher';
