'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let fetchDeviceData = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (port) {
    const response = yield (0, (_xfetch || _load_xfetch()).default)(`http://localhost:${port}/inspector/json`, {});
    if (response.ok) {
      const responseText = yield response.text();
      return JSON.parse(responseText);
    }
    return [];
  });

  return function fetchDeviceData(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.connectToPackager = connectToPackager;

var _xfetch;

function _load_xfetch() {
  return _xfetch = _interopRequireDefault(require('../../commons-node/xfetch'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const POLLING_INTERVAL = 2000;
const PACKAGER_PORT = 8081;

function connectToPackager() {
  return _rxjsBundlesRxMinJs.Observable.interval(POLLING_INTERVAL).mergeMap(() => fetchDeviceData(PACKAGER_PORT)).mergeMap(deviceInfos => deviceInfos).distinct(deviceInfo => deviceInfo.webSocketDebuggerUrl);
}