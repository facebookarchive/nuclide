'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isPreludeMessage = isPreludeMessage;
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const PRELUDE_MESSAGES = exports.PRELUDE_MESSAGES = [{
  method: 'Console.enable'
}, {
  method: 'Debugger.enable'
}, {
  method: 'Runtime.enable'
}, {
  method: 'Debugger.setBreakpointsActive',
  params: {
    active: true
  }
}];

function isPreludeMessage(method) {
  return PRELUDE_MESSAGES.some(message => message.method === method);
}