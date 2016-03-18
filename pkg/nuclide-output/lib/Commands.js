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

export default class Commands {

  _observer: rx$IObserver;
  _getState: () => AppState;

  constructor(observer: rx$IObserver, getState: () => AppState) {
    this._observer = observer;
    this._getState = getState;
  }

  clearRecords(): void {
    this._observer.onNext({
      type: ActionTypes.RECORDS_CLEARED,
    });
  }

  registerExecutor(executor: Executor): void {
    this._observer.onNext({
      type: ActionTypes.REGISTER_EXECUTOR,
      payload: {executor},
    });
    this._registerRecordProvider({
      source: executor.id,
      records: executor.output.map(message => ({
        ...message,
        kind: 'response',
        source: executor.id,
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
          source: outputProvider.source,
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
      .subscribe(action => this._observer.onNext(action));

    this._observer.onNext({
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
    subscription.dispose();
    this._observer.onNext({
      type: ActionTypes.SOURCE_REMOVED,
      payload: {source},
    });
  }

  selectExecutor(executorId: string): void {
    this._observer.onNext({
      type: ActionTypes.SELECT_EXECUTOR,
      payload: {executorId},
    });
  }

  setMaxMessageCount(maxMessageCount: number): void {
    this._observer.onNext({
      type: ActionTypes.MAX_MESSAGE_COUNT_UPDATED,
      payload: {maxMessageCount},
    });
  }

  unregisterExecutor(executor: Executor): void {
    this._observer.onNext({
      type: ActionTypes.UNREGISTER_EXECUTOR,
      payload: {executor},
    });
    this.removeSource(executor.id);
  }

}
