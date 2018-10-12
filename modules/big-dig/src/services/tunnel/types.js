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

export type TunnelMessage =
  | {
      event: 'error',
      clientId: number,
      error: Error,
      tunnelId: string,
    }
  | {
      event: 'data' | 'timeout' | 'end' | 'close',
      arg: string,
      clientId: number,
      tunnelId: string,
    }
  | {
      event: 'proxyCreated',
      port: number,
      remotePort: number,
      tunnelId: string,
      useIPv4: boolean,
    }
  | {event: 'proxyClosed', tunnelId: string}
  | {
      event: 'proxyError',
      error: Error,
      port: number,
      remotePort: number,
      tunnelId: string,
      useIpv4: boolean,
    }
  | {
      event: 'connection',
      clientId: number,
      tunnelId: string,
    }
  | {
      event: 'closeProxy',
      tunnelId: string,
    }
  | {
      event: 'createProxy',
      tunnelConfig: TunnelConfig,
      tunnelId: string,
    };

export type TunnelConfig = {
  localPort: number,
  remotePort: number,
  useIPv4: boolean,
};
