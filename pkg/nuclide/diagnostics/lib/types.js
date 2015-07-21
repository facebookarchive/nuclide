'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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

export type DiagnosticProvider = {
  onMessageUpdate: (callback: MessageUpdateCallback) => atom$Disposable;
  onMessageInvalidation: (callback: MessageInvalidationCallback) => atom$Disposable;
};

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
  type: string;
  text?: string;
  html?: string;
  range?: atom$Range;
  trace?: Array<Trace>;
};

export type ProjectDiagnosticMessage = {
  scope: 'project';
  providerName: string;
  type: string;
  text?: string;
  html?: string;
  range?: atom$Range;
  trace?: Array<Trace>;
};
