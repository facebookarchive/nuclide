/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {
  DiagnosticMessage,
  FileDiagnosticMessage,
  FileDiagnosticMessages,
  ProjectDiagnosticMessage,
} from '../types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type DiagnosticStore from '../DiagnosticStore';

export default class DiagnosticUpdater {
  _store: DiagnosticStore;

  constructor(store: DiagnosticStore) {
    this._store = store;
  }

  onFileMessagesDidUpdate(
    callback: (update: FileDiagnosticMessages) => mixed,
    filePath: NuclideUri,
  ): IDisposable {
    return this._store.onFileMessagesDidUpdate(callback, filePath);
  }

  onProjectMessagesDidUpdate(
    callback: (messages: Array<ProjectDiagnosticMessage>) => mixed,
  ): IDisposable {
    return this._store.onProjectMessagesDidUpdate(callback);
  }

  onAllMessagesDidUpdate(
    callback: (messages: Array<DiagnosticMessage>) => mixed,
  ): IDisposable {
    return this._store.onAllMessagesDidUpdate(callback);
  }

  applyFix(message: FileDiagnosticMessage): void {
    this._store.applyFix(message);
  }

  applyFixesForFile(file: NuclideUri): void {
    this._store.applyFixesForFile(file);
  }
}
