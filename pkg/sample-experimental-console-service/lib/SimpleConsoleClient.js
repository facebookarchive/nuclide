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

import type {ServiceConnection} from 'nuclide-commons-atom/ExperimentalMessageRouter';

export type SimpleConsoleClient = {
  log(message: string): void,
};

export default function createClient(
  connection: ServiceConnection,
): SimpleConsoleClient {
  return {
    log(message: string): void {
      connection.sendNotification('message', {message});
    },
  };
}
