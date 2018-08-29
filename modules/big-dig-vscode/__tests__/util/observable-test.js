/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict
 * @format
 * @emails oncall+nuclide
 */

import * as vscode from '../../__mocks__/vscode-harness';
import {Subject, Observable} from 'rxjs';
import {observeCancellationToken} from '../../src/util/observable';

jest.mock('vscode', () => vscode, {virtual: true});

describe('observeCancellationToken', () => {
  let token: {
    listeners: Set<() => mixed>,
    isCancellationRequested: boolean,
    onCancellationRequested: (listener: () => mixed) => IDisposable,
    cancel(): void,
  };

  beforeEach(() => {
    token = {
      listeners: new Set(),
      isCancellationRequested: false,
      onCancellationRequested(listener: () => mixed): IDisposable {
        const listeners = this.listeners;
        listeners.add(listener);
        return {
          dispose() {
            listeners.delete(listener);
          },
        };
      },
      cancel(): void {
        if (!this.isCancellationRequested) {
          this.isCancellationRequested = true;
          this.listeners.forEach(listener => listener());
        }
      },
    };
  });

  it('null token', () => {
    const result = observeCancellationToken(null);
    result.timeoutWith(100, Observable.of(1));
    expect(result.toArray().toPromise()).resolves.toBe([1]);
  });

  it('canceled before construct', () => {
    token.cancel();
    const obs = Observable.from([0, 1, 2]).takeUntil(
      observeCancellationToken(token),
    );
    expect(obs.toArray().toPromise()).resolves.toEqual([]);
  });

  it('canceled before subscription, but after construct', () => {
    const onCancel = observeCancellationToken(token);
    token.cancel();
    const obs = Observable.from([0, 1, 2]).takeUntil(onCancel);
    expect(obs.toArray().toPromise()).resolves.toEqual([]);
  });

  it('canceled mid-stream', () => {
    const source = new Subject();
    const obs = source.takeUntil(observeCancellationToken(token));
    expect(obs.toArray().toPromise()).resolves.toEqual([1]);
    source.next(1);
    token.cancel();
    source.next(2);
    source.complete();
  });
});
