/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {ThriftServiceConfig} from '../thrift/types';

import RemoteFileSystemService from './gen-nodejs/RemoteFileSystemService';

export const FS_SERVICE_CONIFG: ThriftServiceConfig = {
  name: 'thrift-rfs',
  remoteUri: '',
  remoteCommand: '',
  remoteCommandArgs: [],
  remotePort: 0,
  thriftTransport: 'buffered',
  thriftProtocol: 'binary',
  thriftService: RemoteFileSystemService,
  killOldThriftServerProcess: true,
};
