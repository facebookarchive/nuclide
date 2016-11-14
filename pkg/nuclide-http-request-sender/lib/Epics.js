'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendHttpRequest = sendHttpRequest;

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _xfetch;

function _load_xfetch() {
  return _xfetch = _interopRequireDefault(require('../../commons-node/xfetch'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function sendHttpRequest(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SEND_REQUEST).do(action => {
    if (!(action.type === (_Actions || _load_Actions()).SEND_REQUEST)) {
      throw new Error('Invariant violation: "action.type === Actions.SEND_REQUEST"');
    }

    const credentials = 'include'; // We always want to send cookies.

    var _store$getState = store.getState();

    const uri = _store$getState.uri,
          method = _store$getState.method,
          headers = _store$getState.headers,
          body = _store$getState.body;

    const options = method === 'POST' ? { method: method, credentials: credentials, headers: headers, body: body } : { method: method, credentials: credentials, headers: headers };
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-http-request-sender:http-request', { uri: uri, options: options });
    (0, (_xfetch || _load_xfetch()).default)(uri, options);
  })
  // This epic is just for side-effects.
  .ignoreElements();
}