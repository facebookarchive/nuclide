'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendHttpRequest = sendHttpRequest;

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _querystring = _interopRequireDefault(require('querystring'));

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

function _formatUri(method, uri, parameters) {
  // Generate object of valid and non-duplicate parameter key/value pairs
  const queryParameters = parameters.reduce((paramObj, param) => {
    if (param && param.key) {
      const trimmedKey = param.key.trim();
      if (!paramObj.hasOwnProperty(trimmedKey)) {
        paramObj[trimmedKey] = param.value.trim();
      }
    }
    return paramObj;
  }, {});
  const queryString = _querystring.default.stringify(queryParameters);
  return `${uri}${queryString ? '?' : ''}${queryString}`;
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function sendHttpRequest(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SEND_REQUEST).do(action => {
    if (!(action.type === (_Actions || _load_Actions()).SEND_REQUEST)) {
      throw new Error('Invariant violation: "action.type === Actions.SEND_REQUEST"');
    }

    const credentials = 'include'; // We always want to send cookies.
    const { uri, method, headers, body, parameters } = store.getState();
    const formattedUri = encodeURI(_formatUri(method, uri, parameters));
    const options = method === 'POST' ? { method, credentials, headers, body } : { method, credentials, headers };
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-http-request-sender:http-request', {
      formattedUri,
      options
    });
    (0, (_xfetch || _load_xfetch()).default)(formattedUri, options);
  })
  // This epic is just for side-effects.
  .ignoreElements();
}