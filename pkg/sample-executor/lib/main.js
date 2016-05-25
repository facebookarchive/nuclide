'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {RegisterExecutorFunction} from '../../nuclide-console/lib/types';

import invariant from 'assert';
import {CompositeDisposable} from 'atom';
import Rx from 'rxjs';

let disposables: ?CompositeDisposable = null;

export function activate(state: ?Object): void {
  invariant(disposables == null);
  disposables = new CompositeDisposable();
}

export function deactivate(): void {
  invariant(disposables != null);
  disposables.dispose();
  disposables = null;
}

export function consumeRegisterExecutor(registerExecutor: RegisterExecutorFunction): void {
  invariant(disposables != null);
  const messages = new Rx.Subject();
  disposables.add(
    registerExecutor({
      id: 'echo',
      name: 'Echo',
      execute(code: string): void {
        messages.next({
          level: 'log',
          text: code,
        });
      },
      output: messages.asObservable(),
    }),
  );
}
