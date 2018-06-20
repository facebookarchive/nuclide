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

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../../nuclide-analytics');
}

var _MessageHandler;

function _load_MessageHandler() {
  return _MessageHandler = require('./MessageHandler');
}

var _WindowLogAppender;

function _load_WindowLogAppender() {
  return _WindowLogAppender = require('./WindowLogAppender');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Percentage of total memory cquery may not exceed.
const DEFAULT_MEMORY_LIMIT = 30;
// Time between checking cquery memory usage, in millseconds.
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

const MEMORY_CHECK_INTERVAL = 15000;

// Read and store arguments.
const loggingFile = process.argv[2];
const recordingFile = process.argv[3];
const libclangLogging = process.argv[4] === 'true';

// Log to stderr to avoid polluting the JsonRpc stdout.
// Also send errors to the client's log.
(_log4js || _load_log4js()).default.configure({
  appenders: [{ type: 'stderr' }, { type: require.resolve('./WindowLogAppender'), level: 'error' }]
});
const logger = (_log4js || _load_log4js()).default.getLogger('nuclide-cquery-wrapper');

function onChildSpawn(childProcess) {
  // client reader/writer reads/writes to Nuclide.
  // server reader/writer reads/writes to cquery.
  const clientReader = new (_SafeStreamMessageReader || _load_SafeStreamMessageReader()).default(process.stdin);
  const serverWriter = new (_vscodeJsonrpc || _load_vscodeJsonrpc()).StreamMessageWriter(childProcess.stdin);
  const clientWriter = new (_vscodeJsonrpc || _load_vscodeJsonrpc()).StreamMessageWriter(process.stdout);
  (0, (_WindowLogAppender || _load_WindowLogAppender()).setMessageWriter)(clientWriter);

  // If child process quits, we also quit.
  childProcess.on('exit', code => process.exit(code));
  childProcess.on('close', code => process.exit(code));
  const clientMessageHandler = new (_MessageHandler || _load_MessageHandler()).MessageHandler(serverWriter, clientWriter);

  clientReader.listen(message => {
    // Message would have a method if it's a request or notification.
    const method = message.method;
    if (method != null && clientMessageHandler.canHandle(message)) {
      try {
        clientMessageHandler.handle(message);
      } catch (e) {
        logger.error(`Uncaught error in ${method} override handler:`, e);
      }
    } else {
      serverWriter.write(message);
    }
  });

  // Every 15 seconds, check the server memory usage.
  // Note: totalmem() reports bytes, ps reports kilobytes.
  const memoryLimit = _os.default.totalmem() / 1024 * DEFAULT_MEMORY_LIMIT / 100;
  const serializedMemoryCheck = (0, (_promise || _load_promise()).serializeAsyncCall)(async () => (await (0, (_process || _load_process()).memoryUsagePerPid)([childProcess.pid])).get(childProcess.pid));
  _rxjsBundlesRxMinJs.Observable.interval(MEMORY_CHECK_INTERVAL).subscribe(async () => {
    const memoryUsed = await serializedMemoryCheck();
    if (memoryUsed != null) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-cquery-lsp:memory-used', {
        projects: clientMessageHandler.knownProjects(),
        memoryUsed,
        memoryLimit
      });
      if (memoryUsed > memoryLimit) {
        logger.error(`Memory usage ${memoryUsed} exceeds limit ${memoryLimit}, killing cquery`);
        childProcess.kill();
      }
    }
  });
}

function spawnChild() {
  onChildSpawn(_child_process.default.spawn('cquery', ['--log-file', loggingFile, '--record', recordingFile], {
    env: libclangLogging ? Object.assign({ LIBCLANG_LOGGING: 1 }, process.env) : process.env,
    // only pipe stdin and stdout, and inherit stderr
    stdio: ['pipe', 'inherit', 'inherit']
  }));
}

spawnChild();