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

import type {RpcRegistrar} from './rpc-types';
import {findBigDigConfig} from './BigDigConfig';
import * as proto from './Protocol';

export class DebuggerRpcMethods {
  register(registrar: RpcRegistrar) {
    registrar.registerFun('debugger/list', this._list.bind(this));
  }

  async _list(
    params: proto.DebuggerListParams,
  ): Promise<proto.DebuggerListResult> {
    const {directory} = params;
    const config = await findBigDigConfig(directory);
    if (config == null) {
      return {
        configFile: null,
        debuggerConfigs: {},
      };
    } else {
      return {
        configFile: config.getFile(),
        debuggerConfigs: config.getDebuggerConfigs(),
      };
    }
  }
}
