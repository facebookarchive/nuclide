/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {AbortSignal} from './AbortController';

import performanceNow from './performanceNow';

type Options = {|
  limit: number,
  delay: number,
  signal?: AbortSignal,
|};

/**
 * Splits tasks that would normally block for a long time across several tasks
 * using `setTimeout`.
 * @param process        - A generator function that does work in chunks, after each
 *                         yield is called.
 * @param options.limit  - A budget limiting the time (in ms) that can be spent
 *                         synchronously processing chunks. Chunks are processed
 *                         until this limit is reached, after which a new task
 *                         will be scheduled asynchronously.
 * @param options.delay  - The time (in ms) between processing tasks.
 * @param options.signal - An `AbortSignal` that can be used to cancel processing.
 */
export default function processTimed(
  process: () => Iterable<void>,
  options: Options,
): void {
  if (options.signal?.aborted) {
    return;
  }

  // Kick off the generator once and hand a stateful iterator to
  // `processTimedIterator`.
  // $FlowFixMe
  processTimedIterator(process(), options);
}

function processTimedIterator(
  processIterator: Iterator<void>,
  {limit, delay, signal}: Options,
): void {
  if (signal?.aborted) {
    return;
  }

  let done;
  const before = performanceNow();
  do {
    ({done} = processIterator.next());
  } while (!done && performanceNow() - before < limit);

  setTimeout(() => {
    processTimedIterator(processIterator, {limit, delay, signal});
  }, delay);
}
