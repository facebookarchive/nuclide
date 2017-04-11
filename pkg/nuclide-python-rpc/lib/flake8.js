'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseFlake8Output = parseFlake8Output;


function classifyCode(code) {
  if (/^(B9|C|E[35]|T400|T49)/.test(code)) {
    // TODO: make this "info" level when it's supported
    return 'Warning';
  } else if (/^(F|B|T484|E999)/.test(code)) {
    return 'Error';
  }
  return 'Warning';
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

function parseFlake8Output(src, output) {
  const regex = /(\d+):(\d+):\s([A-Z]\d{2,3})\s+(.*)/g;
  const results = [];

  for (;;) {
    const match = regex.exec(output);
    if (match == null) {
      break;
    }
    const [, line, column, code, message] = match;
    results.push({
      file: src,
      line: parseInt(line, 10) - 1 || 0,
      column: parseInt(column, 10) || 0,
      code,
      type: classifyCode(code),
      message
    });
  }

  return results;
}