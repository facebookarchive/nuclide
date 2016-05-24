'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AppState, Executor, OutputProvider, RecordProvider} from './types';

import * as ActionTypes from './ActionTypes';
import getCurrentExecutorId from './getCurrentExecutorId';
import invariant from 'assert';

export default class Commands {

  _observer: rx$IObserver;
  _getState: () => AppState;

  constructor(observer: rx$IObserver, getState: () => AppState) {
    this._observer = observer;
    this._getState = getState;
  }

  clearRecords(): void {
    this._observer.next({
      type: ActionTypes.RECORDS_CLEARED,
    });
  }

  /**
   * Execute the provided code using the current executor.
   */
  execute(code: string): void {
    const currentExecutorId = getCurrentExecutorId(this._getState());
    invariant(currentExecutorId);

    const executor = this._getState().executors.get(currentExecutorId);
    invariant(executor != null);

    // TODO: Is this the best way to do this? Might want to go through nuclide-executors and have
    //       that register output sources?
    this._observer.next({
      type: ActionTypes.MESSAGE_RECEIVED,
      payload: {
        record: {
          kind: 'request',
          level: 'log',
          text: code,
          scopeName: executor.scopeName,
        },
      },
    });

    this._observer.next({
      type: ActionTypes.EXECUTE,
      payload: {
        executorId: currentExecutorId,
        code,
      },
    });
  }

  registerExecutor(executor: Executor): void {
    this._observer.next({
      type: ActionTypes.REGISTER_EXECUTOR,
      payload: {executor},
    });
    this._registerRecordProvider({
      id: executor.id,
      records: executor.output.map(message => ({
        ...message,
        kind: 'response',
        sourceId: executor.id,
        scopeName: null, // The output won't be in the language's grammar.
      })),
    });
  }

  registerOutputProvider(outputProvider: OutputProvider): void {
    // Transform the messages into actions and merge them into the action stream.
    // TODO: Add enabling/disabling of registered source and only subscribe when enabled. That
    //       way, we won't trigger cold observer side-effects when we don't need the results.
    return this._registerRecordProvider({
      ...outputProvider,
      records: outputProvider.messages
        .map(message => ({
          ...message,
          kind: 'message',
          sourceId: outputProvider.id,
          scopeName: null,
        })),
    });
  }

  _registerRecordProvider(recordProvider: RecordProvider): void {
    // Transform the messages into actions and merge them into the action stream.
    // TODO: Add enabling/disabling of registered source and only subscribe when enabled. That
    //       way, we won't trigger cold observer side-effects when we don't need the results.
    const subscription = recordProvider.records
      .map(record => ({
        type: ActionTypes.MESSAGE_RECEIVED,
        payload: {record},
      }))
      .subscribe(action => this._observer.next(action));

    this._observer.next({
      type: ActionTypes.PROVIDER_REGISTERED,
      payload: {
        recordProvider,
        subscription,
      },
    });
  }

  removeSource(source: string): void {
    const subscription = this._getState().providerSubscriptions.get(source);
    if (subscription == null) {
      return;
    }
    subscription.unsubscribe();
    this._observer.next({
      type: ActionTypes.SOURCE_REMOVED,
      payload: {source},
    });
  }

  selectExecutor(executorId: string): void {
    this._observer.next({
      type: ActionTypes.SELECT_EXECUTOR,
      payload: {executorId},
    });
  }

  setMaxMessageCount(maxMessageCount: number): void {
    this._observer.next({
      type: ActionTypes.MAX_MESSAGE_COUNT_UPDATED,
      payload: {maxMessageCount},
    });
  }

  unregisterExecutor(executor: Executor): void {
    this._observer.next({
      type: ActionTypes.UNREGISTER_EXECUTOR,
      payload: {executor},
    });
    this.removeSource(executor.id);
  }

}
