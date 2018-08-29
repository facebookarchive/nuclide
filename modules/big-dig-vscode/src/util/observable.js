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
 */

import {Observable} from 'rxjs';

import * as vscode from 'vscode';

/**
 * Creates an observable that completes iff the cancellation token has had a
 * cancellation requested.
 *
 * Example usage:
 * ```
 *    source.takeUntil(observeCancellationToken(token))
 * ```
 */
export function observeCancellationToken(
  token: ?vscode.CancellationToken,
): Observable<void> {
  if (!token) {
    return Observable.never();
  } else if (token.isCancellationRequested) {
    return Observable.of(undefined);
  } else {
    return Observable.create(observer => {
      if (token.isCancellationRequested) {
        observer.next();
        observer.complete();
      } else {
        const event = token.onCancellationRequested(() => {
          observer.next();
          observer.complete();
        });
        return () => event.dispose();
      }
    });
  }
}
