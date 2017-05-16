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

export type ShowNotificationLevel = 'info' | 'log' | 'warning' | 'error';

// This interface is exposed by the client to the server
export interface HostServices {
  consoleNotification(
    source: string,
    level: ShowNotificationLevel,
    text: string,
  ): void,

  dispose(): void,
}
