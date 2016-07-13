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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports.runApp = runApp;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _ws2;

function _ws() {
  return _ws2 = _interopRequireDefault(require('ws'));
}

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../../commons-node/stream');
}

var WS_URL = 'ws://localhost:8081/debugger-proxy?role=debugger&name=Nuclide';

/**
 * This function models the RN side of the debugging equation: it emits a stream of requests for the
 * executor (as well as some other instructions), and accepts a stream of results.
 */

function runApp(executorResults) {
  var websockets = connectToRnApp();

  return websockets.switchMap(function (ws) {
    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.merge(
    // The messages from the RN app.
    (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromEvent(ws, 'message').map(JSON.parse),

    // Send the executor results to the RN app.
    executorResults.do(function (response) {
      var replyId = response.replyId;
      var result = response.result;

      ws.send(JSON.stringify({ replyID: replyId, result: result }));
    }).ignoreElements());
  }).share();
}

function connectToRnApp() {
  // $FlowIssue: Add this to Rx defs
  var websockets = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.using(function () {
    var ws = new (_ws2 || _ws()).default(WS_URL);
    return { ws: ws, unsubscribe: function unsubscribe() {
        ws.close();
      } };
  }, function (_ref) {
    var ws = _ref.ws;
    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of(ws);
  }).switchMap(function (ws) {
    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.merge((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.never(),

    // A stream of websockets...
    (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of(ws),

    // ...that errors if the websocket closes before we unsubscribe.
    (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromEvent(ws, 'close').map(function () {
      throw new PrematureCloseError();
    }),

    // ...or when there's a websocket error.
    (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromEvent(ws, 'error').switchMap((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.throw));
  }).retryWhen(function (errors) {
    return errors.scan(function (errorCount, error) {
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
    }, 0).delay(500);
  });

  return (0, (_commonsNodeStream2 || _commonsNodeStream()).cacheWhileSubscribed)(websockets);
}

var PrematureCloseError = (function (_Error) {
  _inherits(PrematureCloseError, _Error);

  function PrematureCloseError() {
    _classCallCheck(this, PrematureCloseError);

    _get(Object.getPrototypeOf(PrematureCloseError.prototype), 'constructor', this).call(this, 'Web socket closed prematurely');
    this.name = 'PrematureCloseError';
  }

  return PrematureCloseError;
})(Error);