'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CompositeDisposable} from 'atom';
import {observeBuffers} from '../../commons-atom/buffer';
import {NotifiersByConnection} from './NotifiersByConnection';
import {BufferSubscription} from './BufferSubscription';

export class Activation {
  _disposables: CompositeDisposable;

  constructor(state: ?Object) {
    this._disposables = new CompositeDisposable();
  }

  activate() {
    const notifiers = new NotifiersByConnection();
    this._disposables.add(notifiers);

    this._disposables.add(observeBuffers(buffer => {
      const subscriptions = new CompositeDisposable();
      subscriptions.add(new BufferSubscription(notifiers, buffer));
      subscriptions.add(buffer.onDidDestroy(() => {
        this._disposables.remove(subscriptions);
        subscriptions.dispose();
      }));
      this._disposables.add(subscriptions);
    }));
  }

  dispose() {
    this._disposables.dispose();
  }
}

let activation: ?Activation = null;

export function activate(state: ?Object) {
  if (activation == null) {
    activation = new Activation(state);
    activation.activate();
  }
}

export function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}
