'use strict';

var _os = _interopRequireDefault(require('os'));

var _child_process = _interopRequireDefault(require('child_process'));

var _log4js;

function _load_log4js() {
  return _log4js = _interopRequireDefault(require('log4js'));
}

var _process;

function _load_process() {
  return _process = require('../../../../modules/nuclide-commons/process');
}

var _promise;

function _load_promise() {
  return _promise = require('../../../../modules/nuclide-commons/promise');
}

var _SafeStreamMessageReader;

function _load_SafeStreamMessageReader() {
  return _SafeStreamMessageReader = _interopRequireDefault(require('../../../../modules/nuclide-commons/SafeStreamMessageReader'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _vscodeJsonrpc;

function _load_vscodeJsonrpc() {
  return _vscodeJsonrpc = require('vscode-jsonrpc');
}

var _vscodeLanguageserver;

function _load_vscodeLanguageserver() {
  return _vscodeLanguageserver = require('vscode-languageserver');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../../nuclide-analytics');
}

var _MessageHandler;

function _load_MessageHandler() {
  return _MessageHandler = require('./MessageHandler');
}

var _messages;

function _load_messages() {
  return _messages = require('./messages');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Percentage of total memory cquery may not exceed.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const DEFAULT_MEMORY_LIMIT = 30;
// Time between checking cquery memory usage, in millseconds.
const MEMORY_CHECK_INTERVAL = 15000;

// Read and store arguments.
const projectRoot = process.argv[2];
const loggingFile = process.argv[3];
const recordingFile = process.argv[4];
const libclangLogging = process.argv[5] === 'true';

// client reader/writer reads/writes to Nuclide.
const clientReader = new (_SafeStreamMessageReader || _load_SafeStreamMessageReader()).default(process.stdin);
const clientWriter = new (_vscodeJsonrpc || _load_vscodeJsonrpc()).StreamMessageWriter(process.stdout);
const clientConnection = (0, (_vscodeLanguageserver || _load_vscodeLanguageserver()).createConnection)(clientReader, clientWriter);
(0, (_messages || _load_messages()).initializeLogging)(clientConnection);

const logger = (_log4js || _load_log4js()).default.getLogger('nuclide-cquery-wrapper');

function onChildSpawn(childProcess) {
  // server reader/writer reads/writes to cquery.
  const serverReader = new (_SafeStreamMessageReader || _load_SafeStreamMessageReader()).default(childProcess.stdout);
  const serverWriter = new (_vscodeJsonrpc || _load_vscodeJsonrpc()).StreamMessageWriter(childProcess.stdin);
  // If child process quits, we also quit.
  childProcess.on('exit', code => process.exit(code));
  childProcess.on('close', code => process.exit(code));
  const messageHandler = new (_MessageHandler || _load_MessageHandler()).MessageHandler(projectRoot, serverWriter, clientWriter);

  clientReader.listen(message => {
    let handled = false;
    try {
      handled = messageHandler.handleFromClient(message);
    } catch (e) {
      const method = message.method;
      logger.error(`Uncaught error in ${method} override handler:`, e);
    }
    if (!handled) {
      serverWriter.write(message);
    }
  });

  serverReader.listen(message => {
    let handled = false;
    try {
      handled = messageHandler.handleFromServer(message);
    } catch (e) {
      const method = message.method;
      logger.error(`Uncaught error in ${method} override handler:`, e);
    }
    if (!handled) {
      clientWriter.write(message);
    }
  });

  // Every 15 seconds, check the server memory usage.
  // Note: totalmem() reports bytes, ps reports kilobytes.
  const memoryLimit = _os.default.totalmem() / 1024 * DEFAULT_MEMORY_LIMIT / 100;
  const serializedMemoryCheck = (0, (_promise || _load_promise()).serializeAsyncCall)(async () => (await (0, (_process || _load_process()).memoryUsagePerPid)([childProcess.pid])).get(childProcess.pid));
  _rxjsBundlesRxMinJs.Observable.interval(MEMORY_CHECK_INTERVAL).subscribe(async () => {
    const memoryUsed = await serializedMemoryCheck();
    if (memoryUsed != null && memoryUsed > memoryLimit) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-cquery-lsp:memory-used', {
        projects: messageHandler.knownProjects(),
        memoryUsed,
        memoryLimit
      });
      logger.error(`Memory usage ${memoryUsed} exceeds limit ${memoryLimit}, killing cquery`);
      childProcess.kill();
    }
  });
}

function spawnChild() {
  onChildSpawn(_child_process.default.spawn('cquery', ['--log-file', loggingFile, '--record', recordingFile], {
    env: libclangLogging ? Object.assign({ LIBCLANG_LOGGING: 1 }, process.env) : process.env,
    // only pipe stdin and stdout, and inherit stderr
    stdio: ['pipe', 'pipe', 'inherit']
  }));
}

spawnChild();