'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseRegularLine = parseRegularLine;


const TIMESTAMP_FORMATS = ['\\d{1,2}:\\d{2}:\\d{2} (?:A|P)M', '\\d{1,2}/\\d{1,2}/\\d{4}, \\d{1,2}:\\d{2}:\\d{2} (?:A|P)M', '\\d{2}/\\d{2}/\\d{4} \\d{2}:\\d{2}:\\d{2}', '\\d{4}-\\d{2}-\\d{2} \\d{1,2}:\\d{2}:\\d{2}\\.\\d+']; /**
                                                                                                                                                                                                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                                                                                * All rights reserved.
                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                                                                                * the root directory of this source tree.
                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                * 
                                                                                                                                                                                                                                * @format
                                                                                                                                                                                                                                */

const TIMESTAMP = TIMESTAMP_FORMATS.map(str => `(?:\\[?${str}\\]?)`).join('|');
const NORMAL_LINE = new RegExp(`^\\s*(?:${TIMESTAMP})\\s*(.*?)\\s*$`);
const ERROR_LINE = /^\s*ERROR\s*(.*?)\s*$/;

function parseRegularLine(line) {
  const normalMatch = line.match(NORMAL_LINE);
  if (normalMatch != null) {
    // TODO (matthewwithanm): Add support for showing timestamps and include that in the message.
    return {
      level: 'log',
      text: normalMatch[1]
    };
  }

  const errorMatch = line.match(ERROR_LINE);
  if (errorMatch != null) {
    return {
      level: 'error',
      text: errorMatch[1]
    };
  }

  // If we weren't able to successfully parse a message, just fall back to using the line. This
  // is expected for some of the packagers output ("[Hot Module Replacement] Server listening on
  // /hot", "React packager ready.").
  return {
    level: 'log',
    text: line
  };
}