'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CompositeDisposable} from 'atom';
import {NuxManager} from './NuxManager';
import {NuxStore} from './NuxStore';

class Activation {
  _disposables: CompositeDisposable;
  _nuxStore: NuxStore;
  _nuxManager: NuxManager;

  constructor(): void {
    this._disposables = new CompositeDisposable();
    this._nuxStore = new NuxStore(/* shouldSeedNux */ true);
    this._nuxManager = new NuxManager(this._nuxStore);

    this._disposables.add(this._nuxStore);
    this._disposables.add(this._nuxManager);
  }

  dispose(): void {
    this._serializeAndPersist();
    this._disposables.dispose();
  }

  _serializeAndPersist(): void {
    this._nuxStore.serialize();
  }
}

let activation: ?Activation = null;

export function activate(): void {
  if (activation == null) {
    activation = new Activation();
  }
}

export function deactivate(): void {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}
