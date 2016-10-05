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

exports.launchDebugger = launchDebugger;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var _child_process2;

function _child_process() {
  return _child_process2 = _interopRequireDefault(require('child_process'));
}

var _net2;

function _net() {
  return _net2 = _interopRequireDefault(require('net'));
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _split2;

function _split() {
  return _split2 = _interopRequireDefault(require('split'));
}

var _uuid2;

function _uuid() {
  return _uuid2 = _interopRequireDefault(require('uuid'));
}

var METHOD_CONNECT = 'connect';
var METHOD_EXIT = 'exit';
var METHOD_INIT = 'init';
var METHOD_START = 'start';
var METHOD_STOP = 'stop';

var PARAM_BREAKPOINTS = 'breakpoints';
var PARAM_METHOD = 'method';

function launchDebugger(commander, initialBreakpoints, pathToPythonExecutable, pythonArgs) {
  return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.create(function (observer) {
    function log(message) {
      observer.next({ event: 'log', message: message });
    }

    var server = (_net2 || _net()).default.createServer(function (connection) {
      // For simplicity, we use newline-delimited-JSON as our wire protocol.
      function write(dict) {
        connection.write(JSON.stringify(dict) + '\n');
      }

      // Listen to events broadcast from the Python debugger.
      connection.pipe((0, (_split2 || _split()).default)(JSON.parse, /* mapper */null, { trailing: false })).on('data', function (args) {
        var method = args[PARAM_METHOD];
        if (method === METHOD_CONNECT) {
          var _write;

          // On initial connection, we should send the breakpoints over.
          write((_write = {}, _defineProperty(_write, PARAM_METHOD, METHOD_INIT), _defineProperty(_write, PARAM_BREAKPOINTS, initialBreakpoints), _write));
          observer.next({ event: 'connected' });
        } else if (method === METHOD_STOP) {
          var file = args.file;
          var line = args.line;

          observer.next({ event: 'stop', file: file, line: line });
        } else if (method === METHOD_EXIT) {
          observer.next({ event: 'exit' });
          connection.end();
        } else if (method === METHOD_START) {
          observer.next({ event: 'start' });
        } else {
          var error = new Error('Unrecognized message: ' + JSON.stringify(args));
          observer.error(error);
        }
      });

      // Take requests from the input commander and pass them through to the Python debugger.
      // TODO(mbolin): If a `quit` message comes in, we should tear down everything from here
      // because the Python code may be locked up such that it won't get the message.
      commander.subscribe(write, function (error) {
        return log('Unexpected error from commander: ' + String(error));
      }, function () {
        return log('Apparently the commander is done.');
      });

      connection.on('end', function () {
        // In the current design, we only expect there to be one connection ever, so when it
        // disconnects, we can shut down the server.
        server.close();
        observer.complete();
      });
    });

    server.on('error', function (err) {
      observer.error(err);
      throw err;
    });

    var socketPath = createSocketPath();
    server.listen({ path: socketPath }, function () {
      log('listening for connections on ' + socketPath + '. About to run python.');

      // The connection is set up, so now we can launch our Python program.
      var pythonDebugger = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(__dirname, 'main.py');
      var args = [pythonDebugger, socketPath].concat(pythonArgs);
      var python = (_child_process2 || _child_process()).default.spawn(pathToPythonExecutable, args);

      /* eslint-disable no-console */
      // TODO(mbolin): These do not seem to be fired until the debugger finishes.
      // Probably need to handle things differently in debugger.py.
      python.stdout.on('data', function (data) {
        return console.log('python stdout: ' + data);
      });
      python.stderr.on('data', function (data) {
        return console.log('python stderr: ' + data);
      });
      /* eslint-enable no-console */
    });
  });
}

function createSocketPath() {
  return (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(require('os').tmpdir(), (_uuid2 || _uuid()).default.v4() + '.sock');
}