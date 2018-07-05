/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {
  ThriftServiceConfig,
  ThriftServerConfig,
  ThriftMessage,
} from './types';

export function convertToServerConfig(
  serviceConfig: ThriftServiceConfig,
): ThriftServerConfig {
  return {
    name: serviceConfig.name,
    remoteCommand: serviceConfig.remoteCommand,
    remoteCommandArgs: serviceConfig.remoteCommandArgs,
    remotePort: serviceConfig.remotePort,
    killOldThriftServerProcess: serviceConfig.killOldThriftServerProcess,
  };
}

export function genConfigId(config: ThriftServerConfig): string {
  return [
    config.name,
    config.remoteCommand,
    ...config.remoteCommandArgs,
    config.remotePort,
  ].join('#');
}

export function encodeMessage(message: ThriftMessage): string {
  return JSON.stringify(message);
}

export function decodeMessage(message: string): ThriftMessage {
  return JSON.parse(message);
}
