/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict
 * @format
 */

import type {DevForkProtocol} from './types';

import {getLogger} from 'log4js';

if (process.send == null) {
  getLogger('deploy').warn(
    'This program is intended to be run as a child process using Node IPC ' +
      'communication, but process.send is null.',
  );
}

export default function send(msg: DevForkProtocol): void {
  if (process.send != null) {
    process.send(msg);
  }
}
