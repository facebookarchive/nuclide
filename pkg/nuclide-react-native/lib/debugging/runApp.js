'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.runApp = runApp;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

var _observable;

function _load_observable() {
  return _observable = require('../../../commons-node/observable');
}

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

const WS_URL = 'ws://localhost:8081/debugger-proxy?role=debugger&name=Nuclide';

/**
 * This function models the RN side of the debugging equation: it emits a stream of requests for the
 * executor (as well as some other instructions), and accepts a stream of results.
 */
function runApp(executorResults) {
  const websockets = connectToRnApp();

  return websockets.switchMap(ws => _rxjsBundlesRxMinJs.Observable.merge(
  // The messages from the RN app.
  _rxjsBundlesRxMinJs.Observable.fromEvent(ws, 'message').map(event => JSON.parse(event.data)),

  // Send the executor results to the RN app.
  executorResults.do(response => {
    const { replyId, result } = response;
    ws.send(JSON.stringify({ replyID: replyId, result }));
  }).ignoreElements())).share();
}

function connectToRnApp() {
  const websockets = _rxjsBundlesRxMinJs.Observable.using(() => {
    const ws = new (_ws || _load_ws()).default(WS_URL);
    return { ws, unsubscribe: () => {
        ws.close();
      } };
  }, ({ ws }) => _rxjsBundlesRxMinJs.Observable.of(ws)).switchMap(ws => _rxjsBundlesRxMinJs.Observable.merge(_rxjsBundlesRxMinJs.Observable.never(),

  // A stream of websockets...
  _rxjsBundlesRxMinJs.Observable.of(ws),

  // ...that errors if the websocket closes before we unsubscribe.
  _rxjsBundlesRxMinJs.Observable.fromEvent(ws, 'close').map(() => {
    throw new PrematureCloseError();
  }),

  // ...or when there's a websocket error.
  _rxjsBundlesRxMinJs.Observable.fromEvent(ws, 'error').switchMap(_rxjsBundlesRxMinJs.Observable.throw))).retryWhen(errors => errors.scan((errorCount, error) => {
    // If the connection is being refused, or closes prematurely, just keep retrying
    // indefinitely.
    if (error.name === 'PrematureCloseError' || error.code === 'ECONNREFUSED') {
      return errorCount;
    }

    // Otherwise, retry 5 times.
    if (errorCount >= 5) {
      throw error;
    }
    return errorCount + 1;
  }, 0).delay(500));

  return (0, (_observable || _load_observable()).cacheWhileSubscribed)(websockets);
}

class PrematureCloseError extends Error {
  constructor() {
    super('Web socket closed prematurely');
    this.name = 'PrematureCloseError';
  }
}