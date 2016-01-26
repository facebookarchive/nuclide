'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Message} from '../../output/lib/types';
import type Rx from 'rx';

export default function createMessageStream(
  line$: Rx.Observable<string>,
): Rx.Observable<Message> {
  return line$
    .map(line => ({
      text: line,
      level: 'info',
    }));
}
