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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import typeof * as AdbService from './AdbService';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import * as AdbServiceLocal from './AdbService';

let _rpcService: ?nuclide$RpcService = null;

export function setRpcService(rpcService: nuclide$RpcService): IDisposable {
  _rpcService = rpcService;
  return new UniversalDisposable(() => {
    _rpcService = null;
  });
}

export function getAdbServiceByNuclideUri(uri: NuclideUri): AdbService {
  if (_rpcService != null) {
    return _rpcService.getServiceByNuclideUri('AdbService', uri);
  } else {
    return AdbServiceLocal;
  }
}
