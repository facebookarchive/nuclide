'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  BookShelfState,
  SerializedBookShelfState,
} from './types';

import {BehaviorSubject} from 'rxjs';
import {CompositeDisposable} from 'atom';
import createPackage from '../../commons-atom/createPackage';
import {getLogger} from '../../nuclide-logging';
import {
  deserializeBookShelfState,
  getEmptBookShelfState,
  serializeBookShelfState,
} from './utils';

class Activation {
  _disposables: CompositeDisposable;
  _states: BehaviorSubject<BookShelfState>;

  constructor(state: ?SerializedBookShelfState) {
    let initialState;
    try {
      initialState = deserializeBookShelfState(state);
    } catch (error) {
      getLogger().error('failed to deserialize nuclide-bookshelf state', error);
      initialState = getEmptBookShelfState();
    }

    this._states = new BehaviorSubject(initialState);
    this._disposables = new CompositeDisposable();
  }

  dispose() {
    this._disposables.dispose();
  }

  serialize(): ?SerializedBookShelfState {
    try {
      return serializeBookShelfState(this._states.getValue());
    } catch (error) {
      getLogger().error('failed to serialize nuclide-bookshelf state', error);
      return null;
    }
  }
}

export default createPackage(Activation);
