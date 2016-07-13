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
  Action,
  BookShelfState,
  SerializedBookShelfState,
} from './types';

import {accumulateState} from './accumulateState';
import {applyActionMiddleware} from './applyActionMiddleware';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {Commands} from './Commands';
import {Disposable, CompositeDisposable} from 'atom';
import createPackage from '../../commons-atom/createPackage';
import {getLogger} from '../../nuclide-logging';
import {
  deserializeBookShelfState,
  getEmptBookShelfState,
  serializeBookShelfState,
} from './utils';

function createStateStream(
  actions: Observable<Action>,
  initialState: BookShelfState,
): BehaviorSubject<BookShelfState> {
  const states = new BehaviorSubject(initialState);
  actions.scan(accumulateState, initialState).subscribe(states);
  return states;
}

class Activation {
  _disposables: CompositeDisposable;
  _states: BehaviorSubject<BookShelfState>;
  _commands: Commands;

  constructor(state: ?SerializedBookShelfState) {
    let initialState;
    try {
      initialState = deserializeBookShelfState(state);
    } catch (error) {
      getLogger().error('failed to deserialize nuclide-bookshelf state', error);
      initialState = getEmptBookShelfState();
    }

    const actions = new Subject();
    const states = this._states = createStateStream(
      applyActionMiddleware(actions, () => this._states.getValue()),
      initialState,
    );

    const dispatch = action => { actions.next(action); };
    /* eslint-disable no-unused-vars */
    // Will be used in stacked diffs.
    const commands = new Commands(dispatch, () => states.getValue());
    /* eslint-enable no-unused-vars */

    this._disposables = new CompositeDisposable(
      new Disposable(actions.complete.bind(actions)),
    );
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
