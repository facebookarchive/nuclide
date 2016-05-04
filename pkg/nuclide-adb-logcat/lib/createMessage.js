Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.default = createMessage;

/**
 * Convert a structured logcat entry into the format that nuclide-console wants.
 */

function createMessage(entry) {
  var priority = entry.metadata && entry.metadata.priority || 'I';
  return {
    text: entry.message,
    level: priorityToLevel(priority)
  };
}

function priorityToLevel(priority) {
  switch (priority) {
    case 'W':
      // warn
      return 'warning';
    case 'E': // error
    case 'F':
      // fatal
      return 'error';
    case 'S':
      // silent
      throw new Error('Silent messages should be filtered');
    case 'V': // verbose
    case 'D': // debug
    case 'I': // info
    default:
      return 'info';
  }
}
module.exports = exports.default;