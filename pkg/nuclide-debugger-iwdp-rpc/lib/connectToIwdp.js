'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let fetchDeviceData = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (port) {
    const response = yield (0, (_xfetch || _load_xfetch()).default)(`http://localhost:${port}/json`, {});
    const responseText = yield response.text();
    return JSON.parse(responseText);
  });

  return function fetchDeviceData(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.connectToIwdp = connectToIwdp;

var _logger;

function _load_logger() {
  return _logger = require('./logger');
}

var _xfetch;

function _load_xfetch() {
  return _xfetch = _interopRequireDefault(require('../../commons-node/xfetch'));
}

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
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

const { log } = (_logger || _load_logger()).logger;
const CONNECTED_TO_DEVICE_REGEX = /Connected :([0-9]+) to/;
const POLLING_INTERVAL = 2000;

function connectToIwdp() {
  return (0, (_process || _load_process()).observeProcess)(
  // Question: why are we running the debug proxy under `script`?
  // Answer: The iwdp binary will aggressively buffer stdout, unless it thinks it is running
  // under a terminal environment.  `script` runs the binary in a terminal-like environment,
  // and gives us less-aggressive buffering behavior, i.e. newlines cause stdout to be flushed.
  'script', (0, (_process || _load_process()).createArgsForScriptCommand)('ios_webkit_debug_proxy', ['--no-frontend'])).mergeMap(message => {
    if (message.kind === 'stdout') {
      const { data } = message;
      const matches = CONNECTED_TO_DEVICE_REGEX.exec(data);
      if (matches != null) {
        const port = Number(matches[1]);
        log(`Fetching device data because we got ${data}`);
        return _rxjsBundlesRxMinJs.Observable.interval(POLLING_INTERVAL).switchMap(() => fetchDeviceData(port));
      }
      if (data.startsWith('Listing devices on :')) {
        log(`IWDP Connected!: ${data}`);
      }
      return _rxjsBundlesRxMinJs.Observable.never();
    } else if (message.kind === 'exit') {
      return _rxjsBundlesRxMinJs.Observable.empty();
    } else {
      return _rxjsBundlesRxMinJs.Observable.throw(new Error(`Error for ios_webkit_debug_proxy: ${JSON.stringify(message)}`));
    }
  }).mergeMap(deviceInfos => deviceInfos).distinct(deviceInfo => deviceInfo.webSocketDebuggerUrl);
}