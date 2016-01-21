'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Observable as ObservableType} from 'rx';

import {Observable} from 'rx';

/**
 * Observe a stream like stdout or stderr.
 */
export function observeStream(stream: stream$Readable): ObservableType<string> {
  const error = Observable.fromEvent(stream, 'error').flatMap(Observable.throwError);
  return Observable.fromEvent(stream, 'data').map(data => data.toString()).
    merge(error).
    takeUntil(Observable.fromEvent(stream, 'end').amb(error));
}

/**
 * Splits a stream of strings on newlines.
 * Includes the newlines in the resulting stream.
 * Sends any non-newline terminated data before closing.
 * Never sends an empty string.
 */
export function splitStream(input: ObservableType<string>): ObservableType<string> {
  return Observable.create(observer => {
    let current: string = '';

    function onEnd() {
      if (current !== '') {
        observer.onNext(current);
        current = '';
      }
    }

    return input.subscribe(
      value => {
        const lines = (current + value).split('\n');
        current = lines.pop();
        lines.forEach(line => observer.onNext(line + '\n'));
      },
      error => { onEnd(); observer.onError(error); },
      () => { onEnd(); observer.onCompleted(); },
    );
  });
}
