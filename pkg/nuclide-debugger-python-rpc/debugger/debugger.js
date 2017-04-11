'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.launchDebugger = launchDebugger;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _child_process = _interopRequireDefault(require('child_process'));

var _net = _interopRequireDefault(require('net'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _split;

function _load_split() {
  return _split = _interopRequireDefault(require('split'));
}

var _uuid;

function _load_uuid() {
  return _uuid = _interopRequireDefault(require('uuid'));
}

var _os = _interopRequireDefault(require('os'));

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

const METHOD_CONNECT = 'connect';
const METHOD_EXIT = 'exit';
const METHOD_INIT = 'init';
const METHOD_START = 'start';
const METHOD_STOP = 'stop';

const PARAM_BREAKPOINTS = 'breakpoints';
const PARAM_METHOD = 'method';

function launchDebugger(commander, initialBreakpoints, pathToPythonExecutable, pythonArgs) {
  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    function log(message) {
      observer.next({ event: 'log', message });
    }

    const server = _net.default.createServer(connection => {
      // For simplicity, we use newline-delimited-JSON as our wire protocol.
      function write(dict) {
        connection.write(JSON.stringify(dict) + '\n');
      }

      // Listen to events broadcast from the Python debugger.
      connection.pipe((0, (_split || _load_split()).default)(JSON.parse, /* mapper */null, { trailing: false })).on('data', args => {
        const method = args[PARAM_METHOD];
        if (method === METHOD_CONNECT) {
          // On initial connection, we should send the breakpoints over.
          write({ [PARAM_METHOD]: METHOD_INIT, [PARAM_BREAKPOINTS]: initialBreakpoints });
          observer.next({ event: 'connected' });
        } else if (method === METHOD_STOP) {
          const { file, line } = args;
          observer.next({ event: 'stop', file, line });
        } else if (method === METHOD_EXIT) {
          observer.next({ event: 'exit' });
          connection.end();
        } else if (method === METHOD_START) {
          observer.next({ event: 'start' });
        } else {
          const error = new Error(`Unrecognized message: ${JSON.stringify(args)}`);
          observer.error(error);
        }
      });

      // Take requests from the input commander and pass them through to the Python debugger.
      // TODO(mbolin): If a `quit` message comes in, we should tear down everything from here
      // because the Python code may be locked up such that it won't get the message.
      commander.subscribe(write, error => log(`Unexpected error from commander: ${String(error)}`), () => log('Apparently the commander is done.'));

      connection.on('end', () => {
        // In the current design, we only expect there to be one connection ever, so when it
        // disconnects, we can shut down the server.
        server.close();
        observer.complete();
      });
    });

    server.on('error', err => {
      observer.error(err);
      throw err;
    });

    const socketPath = createSocketPath();
    server.listen({ path: socketPath }, () => {
      log(`listening for connections on ${socketPath}. About to run python.`);

      // The connection is set up, so now we can launch our Python program.
      const pythonDebugger = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'main.py');
      const args = [pythonDebugger, socketPath].concat(pythonArgs);
      const python = _child_process.default.spawn(pathToPythonExecutable, args);

      /* eslint-disable no-console */
      // TODO(mbolin): These do not seem to be fired until the debugger finishes.
      // Probably need to handle things differently in debugger.py.
      python.stdout.on('data', data => console.log(`python stdout: ${data}`));
      python.stderr.on('data', data => console.log(`python stderr: ${data}`));
      /* eslint-enable no-console */
    });
  });
}

function createSocketPath() {
  return (_nuclideUri || _load_nuclideUri()).default.join(_os.default.tmpdir(), `${(_uuid || _load_uuid()).default.v4()}.sock`);
}