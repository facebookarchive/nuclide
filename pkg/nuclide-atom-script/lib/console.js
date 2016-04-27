Object.defineProperty(exports, '__esModule', {
  value: true
});

var

/* eslint-disable no-console */

// TODO(mbolin): This redefinition of console.log() does not appear to be bulletproof.
// For example, if you do: `./bin/atom-script ./samples/keybindings.js | head`, you get
// an error.

/**
 * Logic to work around this issue: https://github.com/atom/atom/issues/10952.
 * Specifically, we want to ensure that `console.log()` writes "clean" output to stdout.
 * This means we need to wrap the appropriate functions so they do not include the extra
 * information added by Chromium's chatty logger.
 *
 * @return a "notify when stdout is flushed" function that returns a Promise that will be resolved
 *   when all messages have been written to the UNIX domain socket.
 */
instrumentConsole = _asyncToGenerator(function* (stdout) {
  var connectedSocket = yield new Promise(function (resolve) {
    var socket = _net2['default'].connect({ path: stdout },
    // $FlowIgnore: Not sure what's up with this.
    function () {
      return resolve(socket);
    });
  });

  var emitter = new _events.EventEmitter();
  var QUEUE_CLEARED_EVENT_NAME = 'queue-cleared';

  function isQueueCleared() {
    // Until we can figure out a better way to do this, we have to rely on an internal Node API.
    return !connectedSocket._writableState.needDrain;
  }

  function dispatchWhenClear() {
    if (isQueueCleared()) {
      emitter.emit(QUEUE_CLEARED_EVENT_NAME);
    } else {
      setTimeout(dispatchWhenClear, 10);
    }
  }

  console.log = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var message = args.join(' ');
    connectedSocket.write(message + '\n');
    dispatchWhenClear();
  };

  return function () {
    if (isQueueCleared()) {
      return Promise.resolve();
    }

    return new Promise(function (resolve) {
      emitter.once(QUEUE_CLEARED_EVENT_NAME, resolve);
    });
  };
});

exports.instrumentConsole = instrumentConsole;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _events = require('events');

var _net = require('net');

var _net2 = _interopRequireDefault(_net);