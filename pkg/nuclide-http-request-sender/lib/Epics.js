Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.sendHttpRequest = sendHttpRequest;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _commonsNodeXfetch;

function _load_commonsNodeXfetch() {
  return _commonsNodeXfetch = _interopRequireDefault(require('../../commons-node/xfetch'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function sendHttpRequest(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SEND_REQUEST).do(function (action) {
    (0, (_assert || _load_assert()).default)(action.type === (_Actions || _load_Actions()).SEND_REQUEST);
    var credentials = 'include'; // We always want to send cookies.

    var _store$getState = store.getState();

    var uri = _store$getState.uri;
    var method = _store$getState.method;
    var headers = _store$getState.headers;
    var body = _store$getState.body;

    var options = method === 'POST' ? { method: method, credentials: credentials, headers: headers, body: body } : { method: method, credentials: credentials, headers: headers };
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-http-request-sender:http-request', { uri: uri, options: options });
    (0, (_commonsNodeXfetch || _load_commonsNodeXfetch()).default)(uri, options);
  })
  // This epic is just for side-effects.
  .ignoreElements();
}