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
export type DiagnosticProvider = {
  onMessageUpdate: (callback: MessageUpdateCallback) => atom$Disposable;
  onMessageInvalidation: (callback: MessageInvalidationCallback) => atom$Disposable;
};

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
  filePath: string;
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
  onFileMessagesDidUpdate: (callback: (update: FileMessageUpdate) => mixed, filePath: NuclideUri) => atom$Disposable;
  onProjectMessagesDidUpdate: (callback: (messages: Array<ProjectDiagnosticMessage>) => mixed) => atom$Disposable;
  onAllMessagesDidUpdate: (callback: (messages: Array<DiagnosticMessage>) => mixed) => atom$Disposable;
};
