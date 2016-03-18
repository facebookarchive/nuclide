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

import featureConfig from '../../nuclide-feature-config';
import {createMessage} from './createMessage';
import plist from 'plist';
import Rx from 'rx';

export function createMessageStream(line$: Rx.Observable<string>): Rx.Observable<Message> {
  const sharedLine$ = line$.share();

  return sharedLine$
    // Group the lines into valid plist strings.
    .buffer(sharedLine$.filter(line => line.trim() === '</plist>'))

    // Don't include empty buffers. This happens if the stream completes since we opened a new
    // buffer when the previous record ended.
    .filter(lines => lines.length > 1)

    .map(lines => lines.join(''))

    // Parse the plists. Each parsed plist contains an array which, in turn, *may* contain dicts
    // (that correspond to records). We just want those dicts so we use `flatMap()`.
    .flatMap(xml => plist.parse(xml))

    // Exclude dicts that don't have any message property.
    .filter(record => record.hasOwnProperty('Message'))

    // Exclude blacklisted senders.
    // FIXME: This is a stopgap. What we really need to do is identify the currently running app and
    //   only show its messages. ):
    .filter(record => {
      const blacklist =
        ((featureConfig.get('nuclide-ios-simulator-logs.senderBlacklist'): any): Array<string>);
      return blacklist.indexOf(record.Sender) === -1;
    })

    // Format the messages for Nuclide.
    .map(createMessage);
}
