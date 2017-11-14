/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import invariant from 'assert';
import {IpcServerTransport} from '../lib/IpcTransports';

const transport = new IpcServerTransport();
invariant(!transport.isClosed());

transport.onMessage().subscribe(message => {
  if (message === 'exit') {
    transport.close();
  } else {
    transport.send(message.toUpperCase());
  }
});
