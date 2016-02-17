'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Level, Message} from '../../output/lib/types';
import type {LogcatEntry, Priority} from './types';

/**
 * Convert a structured logcat entry into the format that nuclide-output wants.
 */
export default function createMessage(entry: LogcatEntry): Message {
  const priority = entry.metadata && entry.metadata.priority || 'I';
  return {
    text: entry.message,
    level: priorityToLevel(priority),
  };
}

function priorityToLevel(priority: Priority): Level {
  switch (priority) {
    case 'W': // warn
      return 'warning';
    case 'E': // error
    case 'F': // fatal
      return 'error';
    case 'S': // silent
      throw new Error('Silent messages should be filtered');
    case 'V': // verbose
    case 'D': // debug
    case 'I': // info
    default:
      return 'info';
  }
}
