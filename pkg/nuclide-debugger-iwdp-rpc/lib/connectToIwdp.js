Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.connectToIwdp = connectToIwdp;

var fetchDeviceData = _asyncToGenerator(function* (port) {
  var response = yield (0, (_commonsNodeXfetch || _load_commonsNodeXfetch()).default)('http://localhost:' + port + '/json', {});
  var responseText = yield response.text();
  return JSON.parse(responseText);
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _logger;

function _load_logger() {
  return _logger = require('./logger');
}

var _commonsNodeXfetch;

function _load_commonsNodeXfetch() {
  return _commonsNodeXfetch = _interopRequireDefault(require('../../commons-node/xfetch'));
}

var _commonsNodeProcess;

function _load_commonsNodeProcess() {
  return _commonsNodeProcess = require('../../commons-node/process');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var log = (_logger || _load_logger()).logger.log;

var CONNECTED_TO_DEVICE_REGEX = /Connected :([0-9]+) to/;

function connectToIwdp() {
  return (0, (_commonsNodeProcess || _load_commonsNodeProcess()).observeProcess)(function () {
    // Question: why are we running the debug proxy under `script`?
    // Answer: The iwdp binary will aggressively buffer stdout, unless it thinks it is running
    // under a terminal environment.  `script` runs the binary in a terminal-like environment,
    // and gives us less-aggressive buffering behavior, i.e. newlines cause stdout to be flushed.
    var newArgs = (0, (_commonsNodeProcess || _load_commonsNodeProcess()).createArgsForScriptCommand)('ios_webkit_debug_proxy', ['--no-frontend']);
    return (0, (_commonsNodeProcess || _load_commonsNodeProcess()).safeSpawn)('script', newArgs);
  }).mergeMap(function (message) {
    if (message.kind === 'stdout') {
      var data = message.data;

      var matches = CONNECTED_TO_DEVICE_REGEX.exec(data);
      if (matches != null) {
        var port = Number(matches[1]);
        log('Fetching device data because we got ' + data);
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromPromise(fetchDeviceData(port));
      }
      if (data.startsWith('Listing devices on :')) {
        log('IWDP Connected!: ' + data);
      }
      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.never();
    } else if (message.kind === 'exit') {
      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
    } else {
      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.throw(new Error('Error for ios_webkit_debug_proxy: ' + JSON.stringify(message)));
    }
  });
}