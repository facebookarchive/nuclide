'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {WorkingSet, WorkingSetDefinition} from './main';

export class WorkingSetsStore {
  getCurrent(): WorkingSet {
    // $FlowIgnore
    return null;
  }

  getDefinitions(): Array<WorkingSetDefinition> {
    // $FlowIgnore
    return null;
  }

  subscribeToCurrent(callback: (current: WorkingSet) => void): IDisposable {
    // $FlowIgnore
    return null;
  }

  subscribeToDefinitions(
    callback: (definitions: Array<WorkingSetDefinition>) => mixed
  ): IDisposable {
    // $FlowIgnore
    return null;
  }

  saveWorkingSet(name: string, workingSet: WorkingSet): void {
  }

  update(name: string, newName: string, workingSet: WorkingSet): void {
  }

  activate(name: string): void {
  }

  deactivate(name: string): void {
  }

  deleteWorkingSet(name: string): void {
  }
}
