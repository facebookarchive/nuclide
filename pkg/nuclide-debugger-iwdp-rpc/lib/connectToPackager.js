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
 * @format
 */

const POLLING_INTERVAL = 2000;
const PACKAGER_PORT = 8081;

const ERROR_NO_DEVICES = 'Please run a debuggable app before attaching';
const ERROR_LAST_DETACH = 'All app instances have been detached';

function connectToPackager() {
  const origin = _rxjsBundlesRxMinJs.Observable.interval(POLLING_INTERVAL).mergeMap(() => fetchDeviceData(PACKAGER_PORT)).share();
  const sizes = origin.map(devices => devices.length).distinctUntilChanged().startWith(0);
  return _rxjsBundlesRxMinJs.Observable.merge(origin.mergeMap(deviceInfos => deviceInfos).distinct(deviceInfo => deviceInfo.webSocketDebuggerUrl),
  // $FlowFixMe
  _rxjsBundlesRxMinJs.Observable.zip(sizes.skip(1), sizes, (last, old) => [last, old]).mergeMap(([last, old]) => {
    if (last === 0 && old === 0) {
      return Promise.reject(packagerError(ERROR_NO_DEVICES));
    } else if (last === 0) {
      return Promise.reject(packagerError(ERROR_LAST_DETACH));
    } else {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }
  }));
}

function packagerError(type) {
  const error = new Error('Packager error');
  error.type = type;
  return error;
}