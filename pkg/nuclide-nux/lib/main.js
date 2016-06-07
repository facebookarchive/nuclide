'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  CompositeDisposable,
  Disposable,
} from 'atom';
import {NuxManager} from './NuxManager';
import {NuxStore} from './NuxStore';

import type {NuxTourModel} from './NuxModel';

export type RegisterNux = ((nux: NuxTourModel) => Disposable);

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

  addNewNux(nux: NuxTourModel): Disposable {
    return this._nuxManager.addNewNux(nux);
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

export function provideRegisterNuxService(): RegisterNux {
  return ((nux: NuxTourModel): Disposable => {
    if (activation == null) {
      throw new Error('An error occurred when instantiating the NUX package.');
    }
    if (nux == null) {
      throw new Error('Cannot register a "null" NuxTour.');
    }
    return activation.addNewNux(nux);
  });
}
