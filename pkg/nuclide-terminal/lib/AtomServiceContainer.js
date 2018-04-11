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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import typeof * as PtyService from './pty-service/PtyService';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import * as PtyServiceLocal from './pty-service/PtyService';

let _rpcService: ?nuclide$RpcService = null;

export function setRpcService(rpcService: nuclide$RpcService): IDisposable {
  _rpcService = rpcService;
  return new UniversalDisposable(() => {
    _rpcService = null;
  });
}

export function getPtyServiceByNuclideUri(uri: ?NuclideUri): PtyService {
  if (_rpcService != null) {
    return _rpcService.getServiceByNuclideUri('PtyService', uri);
  } else {
    return PtyServiceLocal;
  }
}
