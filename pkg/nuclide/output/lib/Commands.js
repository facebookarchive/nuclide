'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AppState, OutputProvider} from './types';

import * as ActionTypes from './ActionTypes';
import {CompositeDisposable, Disposable} from 'atom';

export default class Commands {

  _observer: rx$IObserver;
  _getState: () => AppState;

  constructor(observer: rx$IObserver, getState: () => AppState) {
    this._observer = observer;
    this._getState = getState;
  }

  registerOutputProvider(outputProvider: OutputProvider): atom$IDisposable {
    this._observer.onNext({
      type: ActionTypes.PROVIDER_REGISTERED,
      payload: {outputProvider},
    });

    return new CompositeDisposable(
      new Disposable(() => {
        this.removeSource(outputProvider.source);
      }),

      // Transform the messages into actions and merge them into the action stream.
      // TODO: Add enabling/disabling of registered source and only subscribe when enabled. That
      //       way, we won't trigger cold observer side-effects when we don't need the results.
      outputProvider.messages
        .map(message => ({
          type: ActionTypes.MESSAGE_RECEIVED,
          payload: {
            record: {
              ...message,
              source: outputProvider.source,
            },
          },
        }))
        .subscribe(this._observer),
    );
  }

  removeSource(source: string): void {
    this._observer.onNext({
      type: ActionTypes.SOURCE_REMOVED,
      payload: {source},
    });
  }

}
