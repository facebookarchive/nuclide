'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Observable} from 'rxjs';

/**
 * Observe a stream like stdout or stderr.
 */
export function observeStream(stream: stream$Readable): Observable<string> {
  return observeRawStream(stream).map(data => data.toString());
}

export function observeRawStream(stream: stream$Readable): Observable<Buffer> {
  const error = Observable.fromEvent(stream, 'error').flatMap(Observable.throw);
  return Observable
    .fromEvent(stream, 'data')
    .merge(error)
    .takeUntil(Observable.fromEvent(stream, 'end'));
}
