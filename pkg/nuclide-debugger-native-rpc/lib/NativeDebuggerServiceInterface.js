'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NativeDebuggerService = exports.getAttachTargetInfoList = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

let getAttachTargetInfoList = exports.getAttachTargetInfoList = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (targetPid) {
    throw new Error('Not implemented');
  });

  return function getAttachTargetInfoList(_x) {
    return _ref.apply(this, arguments);
  };
})();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class NativeDebuggerService {
  constructor(config) {}

  getOutputWindowObservable() {
    throw new Error('Not implemented');
  }

  getServerMessageObservable() {
    throw new Error('Not implemented');
  }

  attach(attachInfo) {
    throw new Error('Not implemented');
  }

  launch(launchInfo) {
    throw new Error('Not implemented');
  }

  bootstrap(bootstrapInfo) {
    throw new Error('Not implemented');
  }

  sendCommand(message) {
    throw new Error('Not implemented');
  }

  dispose() {
    throw new Error('Not implemented');
  }
}
exports.NativeDebuggerService = NativeDebuggerService;