'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {GadgetsService, Gadget} from '../../nuclide-gadgets-interfaces';
import type {AppState, RegisterExecutorFunction} from './types';

import {CompositeDisposable, Disposable} from 'atom';
import * as ActionTypes from './ActionTypes';
import Commands from './Commands';
import createOutputGadget from './createOutputGadget';
import createStateStream from './createStateStream';
import featureConfig from '../../nuclide-feature-config';
import OutputService from './OutputService';
import invariant from 'assert';
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
    this._disposables = new CompositeDisposable(
      atom.contextMenu.add({
        '.nuclide-output-record': [
          {
            label: 'Copy Message',
            command: 'nuclide-output:copy-message',
          },
        ],
      }),
      atom.commands.add(
        '.nuclide-output-record',
        'nuclide-output:copy-message',
        event => {
          const el = event.target;
          if (el == null || el.innerText == null) {
            return;
          }
          atom.clipboard.write(el.innerText);
        },
      ),
      featureConfig.observe(
        'nuclide-output.maximumMessageCount',
        maxMessageCount => this._commands.setMaxMessageCount(maxMessageCount),
      ),

      // Action side-effects
      action$.subscribe(action => {
        if (action.type !== ActionTypes.EXECUTE) {
          return;
        }
        const {executorId, code} = action.payload;
        const executors = this._state$.getValue().executors;
        const executor = executors.get(executorId);
        invariant(executor);
        executor.execute(code);
      }),
    );
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeGadgetsService(gadgetsApi: GadgetsService): IDisposable {
    const OutputGadget = createOutputGadget(this._state$.asObservable(), this._commands);
    return gadgetsApi.registerGadget(((OutputGadget: any): Gadget));
  }

  provideOutputService(): OutputService {
    return this._outputService;
  }

  provideRegisterExecutor(): RegisterExecutorFunction {
    return executor => {
      this._commands.registerExecutor(executor);
      return new Disposable(() => {
        this._commands.unregisterExecutor(executor);
      });
    };
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
    executors: new Map(),
    currentExecutorId: null,
    records: rawState.records || [],
    providers: new Map(),
    providerSubscriptions: new Map(),

    // This value will be replaced with the value form the config. We just use `POSITIVE_INFINITY`
    // here to conform to the AppState type defintion.
    maxMessageCount: Number.POSITIVE_INFINITY,
  };
}

module.exports = Activation;
