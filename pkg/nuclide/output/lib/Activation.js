'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {GadgetsService, Gadget} from '../../gadgets-interfaces';
import type {AppState} from './types';

import {CompositeDisposable} from 'atom';
import Commands from './Commands';
import createOutputGadget from './createOutputGadget';
import createStateStream from './createStateStream';
import OutputService from './OutputService';
import Rx from 'rx';

class Activation {
  _commands: Commands;
  _disposables: CompositeDisposable;
  _outputService: OutputService;
  _state$: Rx.BehaviorSubject<AppState>;

  constructor(rawState: ?Object) {
    const action$ = new Rx.Subject();
    this._state$ = createStateStream(
      action$.asObservable(),
      deserializeAppState(rawState),
    );
    this._commands = new Commands(
      action$.asObserver(),
      () => this._state$.getValue(),
    );
    this._outputService = new OutputService(this._commands);
    this._disposables = new CompositeDisposable();
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeGadgetsService(gadgetsApi: GadgetsService): atom$Disposable {
    const OutputGadget = createOutputGadget(this._state$.asObservable(), this._commands);
    return gadgetsApi.registerGadget(((OutputGadget: any): Gadget));
  }

  provideOutputService(): OutputService {
    return this._outputService;
  }

  serialize(): Object {
    const state = this._state$.getValue();
    return {
      records: state.records,
    };
  }

}

function deserializeAppState(rawState: ?Object): AppState {
  rawState = rawState || {};
  return {
    records: rawState.records || [],
    providers: new Map(),
  };
}

module.exports = Activation;
