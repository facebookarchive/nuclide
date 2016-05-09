'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {GadgetsService, Gadget} from '../../nuclide-gadgets';
import type {AppState, OutputProvider, OutputService, RegisterExecutorFunction} from './types';

import {DisposableSubscription} from '../../nuclide-commons';
import {CompositeDisposable, Disposable} from 'atom';
import * as ActionTypes from './ActionTypes';
import Commands from './Commands';
import createConsoleGadget from './ui/createConsoleGadget';
import createStateStream from './createStateStream';
import featureConfig from '../../nuclide-feature-config';
import invariant from 'assert';
import Rx from 'rxjs';

class Activation {
  _commands: Commands;
  _disposables: CompositeDisposable;
  _outputService: ?OutputService;
  _registerExecutorFunction: ?RegisterExecutorFunction;
  _state$: Rx.BehaviorSubject<AppState>;

  constructor(rawState: ?Object) {
    const action$ = new Rx.Subject();
    const initialState = deserializeAppState(rawState);
    this._state$ = new Rx.BehaviorSubject(initialState);
    createStateStream(
      action$.asObservable(),
      initialState,
    )
      .sampleTime(100)
      .subscribe(this._state$);
    this._commands = new Commands(
      action$,
      () => this._state$.getValue(),
    );
    this._disposables = new CompositeDisposable(
      atom.contextMenu.add({
        '.nuclide-console-record': [
          {
            label: 'Copy Message',
            command: 'nuclide-console:copy-message',
          },
        ],
      }),
      atom.commands.add(
        '.nuclide-console-record',
        'nuclide-console:copy-message',
        event => {
          const el = event.target;
          if (el == null || el.innerText == null) {
            return;
          }
          atom.clipboard.write(el.innerText);
        },
      ),
      featureConfig.observe(
        'nuclide-console.maximumMessageCount',
        maxMessageCount => this._commands.setMaxMessageCount(maxMessageCount),
      ),

      // Action side-effects
      new DisposableSubscription(
        action$.subscribe(action => {
          if (action.type !== ActionTypes.EXECUTE) {
            return;
          }
          const {executorId, code} = action.payload;
          const executors = this._state$.getValue().executors;
          const executor = executors.get(executorId);
          invariant(executor);
          executor.execute(code);
        })
      ),
    );
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeGadgetsService(gadgetsApi: GadgetsService): void {
    const OutputGadget = createConsoleGadget(this._state$.asObservable(), this._commands);
    this._disposables.add(gadgetsApi.registerGadget(((OutputGadget: any): Gadget)));
  }

  provideOutputService(): OutputService {
    if (this._outputService == null) {
      // Create a local, nullable reference so that the service consumers don't keep the `Commands`
      // instance in memory.
      let commands = this._commands;
      this._disposables.add(new Disposable(() => { commands = null; }));

      this._outputService = {
        registerOutputProvider(outputProvider: OutputProvider): IDisposable {
          if (commands != null) {
            commands.registerOutputProvider(outputProvider);
          }
          return new Disposable(() => {
            if (commands != null) {
              commands.removeSource(outputProvider.source);
            }
          });
        },
      };
    }
    return this._outputService;
  }

  provideRegisterExecutor(): RegisterExecutorFunction {
    if (this._registerExecutorFunction == null) {
      // Create a local, nullable reference so that the service consumers don't keep the `Commands`
      // instance in memory.
      let commands = this._commands;
      this._disposables.add(new Disposable(() => { commands = null; }));

      this._registerExecutorFunction = executor => {
        if (commands != null) {
          commands.registerExecutor(executor);
        }
        return new Disposable(() => {
          if (commands != null) {
            commands.unregisterExecutor(executor);
          }
        });
      };
    }
    return this._registerExecutorFunction;
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
