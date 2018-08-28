"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startDebugProviders = startDebugProviders;

function vscode() {
  const data = _interopRequireWildcard(require("vscode"));

  vscode = function () {
    return data;
  };

  return data;
}

function _BigDigDebugConfigurationProvider() {
  const data = require("./BigDigDebugConfigurationProvider");

  _BigDigDebugConfigurationProvider = function () {
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
 * 
 * @format
 */
function startDebugProviders() {
  const debugConfigurationProvider = new (_BigDigDebugConfigurationProvider().BigDigDebugConfigurationProvider)();
  const reg = vscode().debug.registerDebugConfigurationProvider('big-dig', debugConfigurationProvider);
  return vscode().Disposable.from(reg, debugConfigurationProvider);
}