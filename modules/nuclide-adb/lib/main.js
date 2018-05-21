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

import type {DBPlatform} from './types';

import createPackage from 'nuclide-commons-atom/createPackage';
import {DevicePoller} from './DevicePoller';
import {setRpcService} from './utils';

export type {DBPlatform};

export {DevicePoller};

class Activation {
  constructor() {}
  dispose() {}

  consumeRpcService(rpcService: nuclide$RpcService): IDisposable {
    return setRpcService(rpcService);
  }
}

createPackage(module.exports, Activation);
