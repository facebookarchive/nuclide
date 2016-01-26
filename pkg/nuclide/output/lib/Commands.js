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
import {CompositeDisposable} from 'atom';

export default class Commands {

  _observer: rx$IObserver;
  _getState: () => AppState;

  constructor(observer: rx$IObserver, getState: () => AppState) {
    this._observer = observer;
    this._getState = getState;
  }

  registerOutputProvider(outputProvider: OutputProvider): atom$IDisposable {
    return new CompositeDisposable(
      // Transform the messages into actions and merge them into the action stream.
      outputProvider.messages
        .map(message => ({
          type: ActionTypes.MESSAGE_RECEIVED,
          payload: {
            record: {
              ...message,
            },
          },
        }))
        .subscribe(this._observer),
    );
  }

}
