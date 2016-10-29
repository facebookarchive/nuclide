'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export const PRELUDE_MESSAGES = [
  {
    method: 'Console.enable',
  },
  {
    method: 'Debugger.enable',
  },
  {
    method: 'Runtime.enable',
  },
  {
    method: 'Debugger.setBreakpointsActive',
    params: {
      active: true,
    },
  },
];

export function isPreludeMessage(method: string): boolean {
  return PRELUDE_MESSAGES.some(message => message.method === method);
}
