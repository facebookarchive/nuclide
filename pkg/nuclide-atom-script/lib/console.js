Object.defineProperty(exports, '__esModule', {
  value: true
});

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
 * Unfortunately, this solution changes the semantics of console.log() to be asynchronous
 * rather than synchronous. Although it could return a Promise, it returns void to be consistent
 * with the original implementation of console.log().
 *
 * When console.log() (or .warn() or .error()) is called, it enqueues a request to atom-script via
 * the UNIX socket to print the specified message. The PromiseQueue that holds all of these
 * requests is returned by this function, along with a shutdown() function that should be used to
 * disconnect from the UNIX socket.
 */

var instrumentConsole = _asyncToGenerator(function* (stdout) {
  var queue = new (_nuclideCommons2 || _nuclideCommons()).PromiseQueue();
  var connectedSocket = yield queue.submit(function (resolve) {
    var socket = (_net2 || _net()).default.connect({ path: stdout }, function () {
      return resolve(socket);
    });
  });

  var emitter = new (_events2 || _events()).EventEmitter();

  console.log = createFn('log', connectedSocket, emitter, queue);
  console.warn = createFn('warn', connectedSocket, emitter, queue);
  console.error = createFn('error', connectedSocket, emitter, queue);

  connectedSocket.pipe((0, (_split2 || _split()).default)(/\0/)).on('data', function (id) {
    emitter.emit(id);
  });

  // Set up a mechanism to cleanly shut down the socket.
  function shutdown() {
    connectedSocket.end(JSON.stringify({ method: 'end' }));
  }

  return { queue: queue, shutdown: shutdown };
}

/**
 * Each request is sent with a unique ID that the server should send back to signal that the
 * message has been written to the appropriate stream.
 */
);

exports.instrumentConsole = instrumentConsole;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _events2;

function _events() {
  return _events2 = require('events');
}

var _nuclideCommons2;

function _nuclideCommons() {
  return _nuclideCommons2 = require('../../nuclide-commons');
}

var _net2;

function _net() {
  return _net2 = _interopRequireDefault(require('net'));
}

var _split2;

function _split() {
  return _split2 = _interopRequireDefault(require('split'));
}

var messageId = 0;

function createFn(method, connectedSocket, emitter, queue) {
  return function () {
    var id = (messageId++).toString(16);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var message = args.join(' ') + '\n';
    var payload = { id: id, method: method, message: message };
    queue.submit(function (resolve) {
      // Set up the listener for the ack that the message was received.
      emitter.once(id, resolve);

      // Now that the listener is in place, send the message.
      connectedSocket.write(JSON.stringify(payload), 'utf8');
      connectedSocket.write('\n', 'utf8');
    });
  };
}