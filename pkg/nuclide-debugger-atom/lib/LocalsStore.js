'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Dispatcher} from 'flux';
import type {EvaluationResult} from './Bridge';

import {
  Disposable,
  CompositeDisposable,
} from 'atom';

export type Local = {
  name: string;
  value: EvaluationResult;
};
export type Locals = Array<Local>;

export default class LocalsStore {
  _disposables: IDisposable;

  constructor(dispatcher: Dispatcher) {
    const dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables = new CompositeDisposable(
      new Disposable(() => {
        dispatcher.unregister(dispatcherToken);
      })
    );
  }

  _handlePayload(payload: Object): void {
    switch (payload.actionType) {
      default:
        return;
    }
  }

  dispose(): void {
    this._disposables.dispose();
  }
}
