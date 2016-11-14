'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMessage = createMessage;

var _parseMessageText2;

function _load_parseMessageText() {
  return _parseMessageText2 = require('./parseMessageText');
}

/**
 * Convert a structured logcat entry into the format that nuclide-console wants.
 */
function createMessage(record) {
  var _parseMessageText = (0, (_parseMessageText2 || _load_parseMessageText()).parseMessageText)(record.Message);

  const text = _parseMessageText.text,
        level = _parseMessageText.level,
        tags = _parseMessageText.tags;

  return {
    text: text,
    level: level == null ? getLevel(record.Level) : level,
    tags: tags == null ? undefined : tags
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
      throw new Error(`Invalid ASL level: ${ level }`);
  }
}