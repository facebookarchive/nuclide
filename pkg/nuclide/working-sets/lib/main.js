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

export type WorkingSetDefinition = {
  name: string;
  active: boolean;
  uris: Array<string>;
}

export {WorkingSet} from './WorkingSet';

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
