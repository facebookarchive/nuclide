"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMessage = createMessage;

function _parseMessageText() {
  const data = require("./parseMessageText");

  _parseMessageText = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

/**
 * Convert a structured logcat entry into the format that nuclide-console wants.
 */
function createMessage(record) {
  const {
    text,
    level,
    tags
  } = (0, _parseMessageText().parseMessageText)(record.Message);

  if (record.Facility) {
    tags.push(record.Facility);
  }

  return {
    text,
    level: level == null ? getLevel(record.Level) : level,
    tags: tags.length === 0 ? undefined : tags
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
      level;
      throw new Error(`Invalid ASL level: ${level}`);
  }
}