"use strict";

var _os = _interopRequireDefault(require("os"));

var _child_process = _interopRequireDefault(require("child_process"));

function _log4js() {
  const data = _interopRequireDefault(require("log4js"));

  _log4js = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _SafeStreamMessageReader() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/SafeStreamMessageReader"));

  _SafeStreamMessageReader = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _vscodeJsonrpc() {
  const data = require("vscode-jsonrpc");

  _vscodeJsonrpc = function () {
    return data;
  };

  return data;
}

function _vscodeLanguageserver() {
  const data = require("vscode-languageserver");

  _vscodeLanguageserver = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _protocol() {
  const data = require("../../../nuclide-vscode-language-service-rpc/lib/protocol");

  _protocol = function () {
    return data;
  };

  return data;
}

function _MessageHandler() {
  const data = require("./MessageHandler");

  _MessageHandler = function () {
    return data;
  };

  return data;
}

function _messages() {
  const data = require("./messages");

  _messages = function () {
    return data;
  };

  return data;
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
 * @format
 */
// Percentage of total memory cquery may not exceed.
const DEFAULT_MEMORY_PCT_LIMIT = 30; // Time between checking cquery memory usage, in millseconds.

const MEMORY_CHECK_INTERVAL = 15000; // Read and store arguments.

const loggingFile = process.argv[2];
const recordingFile = process.argv[3];
const libclangLogging = process.argv[4] === 'true';
const memoryPercentage = process.argv[5] != null ? Math.min(Math.max(Number.parseFloat(process.argv[5]), 1), 100) : DEFAULT_MEMORY_PCT_LIMIT; // Child process memory limit in kilobytes.

const memoryLimit = _os.default.totalmem() / 1024 * memoryPercentage / 100; // client reader/writer reads/writes to Nuclide.

const clientReader = new (_SafeStreamMessageReader().default)(process.stdin);
const clientWriter = new (_vscodeJsonrpc().StreamMessageWriter)(process.stdout);
const clientConnection = (0, _vscodeLanguageserver().createConnection)(clientReader, clientWriter);
(0, _messages().initializeLogging)(clientConnection);

const logger = _log4js().default.getLogger('nuclide-cquery-wrapper');

function onChildSpawn(childProcess) {
  (0, _nuclideAnalytics().track)('nuclide-cquery-lsp:child-started'); // server reader/writer reads/writes to cquery.

  const serverReader = new (_SafeStreamMessageReader().default)(childProcess.stdout);
  const serverWriter = new (_vscodeJsonrpc().StreamMessageWriter)(childProcess.stdin); // If child process quits, we also quit.

  childProcess.on('exit', code => process.exit(code));
  childProcess.on('close', code => process.exit(code));
  const messageHandler = new (_MessageHandler().MessageHandler)(serverWriter, clientWriter);
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
  }); // Every 15 seconds, check the server memory usage.
  // Note: totalmem() reports bytes, ps reports kilobytes.

  const serializedMemoryCheck = (0, _promise().serializeAsyncCall)(async () => (await (0, _process().memoryUsagePerPid)([childProcess.pid])).get(childProcess.pid));

  _RxMin.Observable.interval(MEMORY_CHECK_INTERVAL).subscribe(async () => {
    const memoryUsed = await serializedMemoryCheck();

    if (memoryUsed != null && memoryUsed > memoryLimit) {
      (0, _nuclideAnalytics().track)('nuclide-cquery-lsp:memory-used', {
        projects: messageHandler.knownProjects(),
        memoryUsed,
        memoryLimit
      });
      logger.error(`Memory usage ${memoryUsed} exceeds limit ${memoryLimit}, killing cquery.`);
      clientWriter.write((0, _messages().windowMessage)(_protocol().MessageType.Info, 'Consider changing cquery indexer threads and/or memory limit in Nuclide settings.'));
      childProcess.kill();
    }
  });
}

function spawnChild() {
  onChildSpawn(_child_process.default.spawn('cquery', ['--log-file', loggingFile, '--record', recordingFile], {
    env: libclangLogging ? Object.assign({
      LIBCLANG_LOGGING: 1
    }, process.env) : process.env,
    // only pipe stdin and stdout, and inherit stderr
    stdio: ['pipe', 'pipe', 'inherit']
  }));
}

spawnChild();