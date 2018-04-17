'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _ReactNativeLaunchAttachProvider;

function _load_ReactNativeLaunchAttachProvider() {
  return _ReactNativeLaunchAttachProvider = _interopRequireDefault(require('./ReactNativeLaunchAttachProvider'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {
  constructor() {}
  dispose() {}

  createDebuggerProvider() {
    return {
      name: 'React Native',
      getLaunchAttachProvider: connection => {
        return new (_ReactNativeLaunchAttachProvider || _load_ReactNativeLaunchAttachProvider()).default(connection);
      }
    };
  }
} /**
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

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);