'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Message} from '../../nuclide-console/lib/types';

import {CompositeSubscription} from '../../nuclide-commons';
import createMessage from './createMessage';
import parseLogcatMetadata from './parseLogcatMetadata';
import Rx from 'rxjs';

export default function createMessageStream(
  line$: Rx.Observable<string>,
): Rx.Observable<Message> {

  // Separate the lines into groups, beginning with metadata lines.
  return Rx.Observable.create(observer => {
    let buffer = [];
    let prevMetadata = null;
    const prevLineIsBlank = () => buffer[buffer.length - 1] === '';

    const flush = () => {
      if (buffer.length === 0) {
        return;
      }

      // Remove the empty line, which is a message separator.
      if (prevLineIsBlank()) {
        buffer.pop();
      }

      observer.next({
        metadata: prevMetadata,
        message: buffer.join('\n'),
      });
      buffer = [];
      prevMetadata = null;
    };

    const sharedLine$ = line$.share();

    return new CompositeSubscription(
      // Buffer incoming lines.
      sharedLine$.subscribe(
        // onNext
        line => {
          let metadata;
          const hasPreviousLines = buffer.length > 0;

          if (!hasPreviousLines || prevLineIsBlank()) {
            metadata = parseLogcatMetadata(line);
          }

          if (metadata) {
            // We've reached a new message so the other one must be done.
            flush();
            prevMetadata = metadata;
          } else {
            buffer.push(line);
          }
        },

        // onError
        error => {
          flush();
          observer.error(error);
        },

        // onCompleted
        () => {
          flush();
          observer.complete();
        },
      ),

      // We know *for certain* that we have a complete entry once we see the metadata for the next
      // one. But what if the next one takes a long time to happen? After a certain point, we need
      // to just assume we have the complete entry and move on.
      sharedLine$.debounceTime(200).subscribe(flush),
    );

  })
  .map(createMessage)
  .share();
}
