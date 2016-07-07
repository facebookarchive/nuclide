/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Message} from '../../../nuclide-console/lib/types';
import type {PackagerEvent} from './types';

import {Observable} from 'rxjs';

const PORT_LINE = /.*(Running packager on port.*?)\s*│/;
const SOURCE_LIST_START = /Looking for JS files in/;
const NORMAL_LINE = /^\s*\[(\d+):(\d+):(\d+) (A|P)M\]\s*(.*?)\s*$/;
const ERROR_LINE = /^\s*ERROR\s*(.*?)\s*$/;
const READY_LINE = /React packager ready/i;

/**
 * Parses output from the packager into messages.
 */
export function parseMessages(raw: Observable<string>): Observable<PackagerEvent> {
  return Observable.create(observer => {
    let sawPreamble = false;
    let sawPortLine = false;
    let sawSourcesStart = false;
    let sawSourcesEnd = false;
    let sawReadyMessage = false;
    const sourceDirectories = [];

    return raw.subscribe({
      next: line => {
        // If we've seen the port and the sources, that's the preamble! Or, if we get to a line that
        // starts with a "[", we probably missed the closing of the preamble somehow. (Like the
        // packager output changed).
        sawPreamble = sawPreamble || (sawPortLine && sawSourcesEnd) || line.startsWith('[');

        if (!sawPortLine && !sawPreamble) {
          const match = line.match(PORT_LINE);
          if (match != null) {
            sawPortLine = true;
            observer.next({
              kind: 'message',
              message: {
                level: 'info',
                text: match[1],
              },
            });
            return;
          }
        }

        if (!sawSourcesStart && !sawPreamble) {
          sawSourcesStart = line.match(SOURCE_LIST_START) != null;
          return;
        }

        // Once we've seen the start of the source list, we need to accumulate a list until we see
        // a blank line.
        if (sawSourcesStart && !sawSourcesEnd && !sawPreamble) {
          if (!isBlankLine(line)) {
            // Add the directory to the list.
            sourceDirectories.push(line.trim());
          } else if (sourceDirectories.length > 0) {
            // We've gotten our list!
            sawSourcesEnd = true;
            observer.next({
              kind: 'message',
              message: {
                level: 'info',
                text: `Looking for JS files in: ${sourceDirectories.join(',')}`,
              },
            });
            return;
          }
        }

        if (sawPreamble) {
          // Drop all blank lines that come after the preamble.
          if (isBlankLine(line)) { return; }

          observer.next({kind: 'message', message: parseRegularMessage(line)});

          if (!sawReadyMessage && READY_LINE.test('React packager ready')) {
            sawReadyMessage = true;
            observer.next({kind: 'ready'});
          }

          return;
        }

        // If we've gotten here, it means that we have an unhandled line in the preamble. Those are
        // the lines we want to ignore, so don't do anything.
      },
      error: observer.error.bind(observer),
      complete: observer.complete.bind(observer),
    });
  });
}

const isBlankLine = line => /^\s*$/.test(line);

function parseRegularMessage(line: string): Message {
  const normalMatch = line.match(NORMAL_LINE);
  if (normalMatch != null) {
    // TODO (matthewwithanm): Add support for showing timestamps and include that in the message.
    return {
      level: 'log',
      text: normalMatch[5],
    };
  }

  const errorMatch = line.match(ERROR_LINE);
  if (errorMatch != null) {
    return {
      level: 'error',
      text: errorMatch[1],
    };
  }

  // If we weren't able to successfully parse a message, just fall back to using the line. This
  // is expected for some of the packagers output ("[Hot Module Replacement] Server listening on
  // /hot", "React packager ready.").
  return {
    level: 'log',
    text: line,
  };
}
