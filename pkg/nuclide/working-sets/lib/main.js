'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import {CompositeDisposable} from 'atom';
import {WorkingSetsStore} from './WorkingSetsStore';

export class WorkingSet {
  static union(...sets: Array<WorkingSet>): WorkingSet {
    // $FlowIgnore
    return null;
  }

  constructor(uris: Array<string> = []) {
  }

  containsFile(uri: string) : boolean {
    return true;
  }

  containsDir(uri: string): boolean {
    return true;
  }

  isEmpty(): boolean {
    return true;
  }

  getUris(): Array<string> {
    // $FlowIgnore
    return null;
  }

  append(...uris: Array<string>): WorkingSet {
    // $FlowIgnore
    return null;
  }

  remove(uri: string): WorkingSet {
    // $FlowIgnore
    return null;
  }
}


export type WorkingSetDefinition = {
  name: string;
  active: boolean;
  uris: Array<string>;
}

class Activation {
  workingSetsStore: WorkingSetsStore;
  _disposables: CompositeDisposable;

  constructor() {
    this.workingSetsStore = new WorkingSetsStore();
    this._disposables = new CompositeDisposable();
  }

  deactivate(): void {
    this._disposables.dispose();
  }
}


let activation: ?Activation = null;

export function activate() {
  if (activation != null) {
    return;
  }

  activation = new Activation();
}

export function deactivate() {
  if (activation == null) {
    return;
  }

  activation.deactivate();
  activation = null;
}

export function provideWorkingSetsStore(): WorkingSetsStore {
  invariant(activation, 'Was requested to provide service from a non-activated package');

  return activation.workingSetsStore;
}
