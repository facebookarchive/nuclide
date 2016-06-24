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

exports.createMessage = createMessage;

/**
 * Convert a structured logcat entry into the format that nuclide-console wants.
 */

function createMessage(record) {
  return {
    text: record.Message,
    level: getLevel(record.Level)
  };
}

function getLevel(level) {
  switch (level) {
    case '0': // Emergency
    case '1': // Alert
    case '2': // Critical
    case '3':
      // Error
      return 'error';
    case '4':
      // Warning
      return 'warning';
    case '5':
      // Notice
      return 'log';
    case '6':
      // Info
      return 'info';
    case '7':
      // Debug
      return 'debug';
    default:
      throw new Error('Invalid ASL level: ' + level);
  }
}