"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerRpcMethods = void 0;

function _BigDigConfig() {
  const data = require("./BigDigConfig");

  _BigDigConfig = function () {
    return data;
  };

  return data;
}

function proto() {
  const data = _interopRequireWildcard(require("./Protocol"));

  proto = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
class DebuggerRpcMethods {
  register(registrar) {
    registrar.registerFun('debugger/list', this._list.bind(this));
  }

  async _list(params) {
    const {
      directory
    } = params;
    const config = await (0, _BigDigConfig().findBigDigConfig)(directory);

    if (config == null) {
      return {
        configFile: null,
        debuggerConfigs: {}
      };
    } else {
      return {
        configFile: config.getFile(),
        debuggerConfigs: config.getDebuggerConfigs()
      };
    }
  }

}

exports.DebuggerRpcMethods = DebuggerRpcMethods;