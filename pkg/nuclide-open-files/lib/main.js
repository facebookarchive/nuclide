'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FileVersion} from '../../nuclide-open-files-rpc/lib/rpc-types';

import invariant from 'assert';
import {CompositeDisposable} from 'atom';
import {observeBuffers} from '../../commons-atom/buffer';
import {NotifiersByConnection} from './NotifiersByConnection';
import {BufferSubscription} from './BufferSubscription';

export class Activation {
  _disposables: CompositeDisposable;
  notifiers: NotifiersByConnection;

  constructor(state: ?Object) {
    this._disposables = new CompositeDisposable();

    const notifiers = new NotifiersByConnection();
    this.notifiers = notifiers;
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

// Mutable for testing.
let activation: Activation = new Activation();

// exported for testing
export function reset(): void {
  activation.dispose();
  activation = new Activation();
}
export function getActivation(): Activation {
  return activation;
}

export async function getFileVersionOfBuffer(buffer: atom$TextBuffer): Promise<?FileVersion> {
  const filePath = buffer.getPath();
  const notifier = activation.notifiers.getForUri(filePath);
  if (notifier == null) {
    return null;
  }
  invariant(filePath != null);
  return {
    notifier: await notifier,
    filePath,
    version: buffer.changeCount,
  };
}

export function getFileVersionOfEditor(editor: atom$TextEditor): Promise<?FileVersion> {
  return getFileVersionOfBuffer(editor.getBuffer());
}
