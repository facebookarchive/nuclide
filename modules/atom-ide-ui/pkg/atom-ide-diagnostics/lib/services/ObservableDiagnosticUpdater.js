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
import type {Observable} from 'rxjs';

// All observables here will issue an initial value on subscribe.
export default class ObservableDiagnosticUpdater {
  _store: DiagnosticStore;
  projectMessageUpdates: Observable<Array<ProjectDiagnosticMessage>>;
  allMessageUpdates: Observable<Array<DiagnosticMessage>>;

  constructor(store: DiagnosticStore) {
    this._store = store;
    this.projectMessageUpdates = store.getProjectMessageUpdates();
    this.allMessageUpdates = store.getAllMessageUpdates();
  }

  getFileMessageUpdates(path: NuclideUri): Observable<FileDiagnosticMessages> {
    return this._store.getFileMessageUpdates(path);
  }

  applyFix(message: FileDiagnosticMessage): void {
    this._store.applyFix(message);
  }

  applyFixesForFile(file: NuclideUri): void {
    this._store.applyFixesForFile(file);
  }
}
