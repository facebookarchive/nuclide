'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHackProcess = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getHackProcess = exports.getHackProcess = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (fileCache, filePath) {
    const configDir = yield (0, (_hackConfig || _load_hackConfig()).findHackConfigDir)(filePath);
    if (configDir == null) {
      throw new Error('Failed to find Hack config directory');
    }
    return processes.get(fileCache).get(configDir);
  });

  return function getHackProcess(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

// Ensures that the only attached HackProcesses are those for the given configPaths.
// Closes all HackProcesses not in configPaths, and starts new HackProcesses for any
// paths in configPaths.


let retryCreateHackProcess = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (fileCache, hackRoot) {
    let hackProcess = null;
    let waitTimeMs = 500;
    // Disable no-await-in-loop because we do want these iterations to be serial.
    /* eslint-disable no-await-in-loop */
    while (hackProcess == null) {
      try {
        hackProcess = yield createHackProcess(fileCache, hackRoot);
      } catch (e) {
        (_hackConfig || _load_hackConfig()).logger.error(`Couldn't create HackProcess: ${e.message}`);
        (_hackConfig || _load_hackConfig()).logger.error(`Waiting ${waitTimeMs}ms before retrying...`);

        yield new Promise(function (resolve) {
          return setTimeout(resolve, waitTimeMs);
        });
        waitTimeMs *= 2;

        const hackProcessNeeded = processes.has(fileCache) && processes.get(fileCache).has(hackRoot);

        // If the HackProcess is no longer needed, or we would be waiting
        // longer than a few seconds, just give up.
        if (!hackProcessNeeded || waitTimeMs > 4000) {
          (_hackConfig || _load_hackConfig()).logger.error(`Giving up on creating HackProcess: ${e.message}`);
          // Remove the (soon-to-be) rejected promise from our processes cache so
          // that the next time someone attempts to get this connection, we'll try
          // to create it.
          if (hackProcessNeeded) {
            processes.get(fileCache).delete(hackRoot);
          }
          throw e;
        }
      }
    }
    /* eslint-enable no-await-in-loop */
    return hackProcess;
  });

  return function retryCreateHackProcess(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

let createHackProcess = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (fileCache, configDir) {
    const command = yield (0, (_hackConfig || _load_hackConfig()).getHackCommand)();
    if (command === '') {
      throw new Error("Couldn't find Hack command");
    }

    (_hackConfig || _load_hackConfig()).logger.info(`Creating new hack connection for ${configDir}: ${command}`);
    (_hackConfig || _load_hackConfig()).logger.info(`Current PATH: ${(0, (_string || _load_string()).maybeToString)(process.env.PATH)}`);
    try {
      yield (0, (_process || _load_process()).runCommand)(command, ['start', configDir], {
        isExitError: function ({ exitCode }) {
          return !(exitCode === 0 || exitCode === HACK_SERVER_ALREADY_EXISTS_EXIT_CODE);
        }
      }).toPromise();
    } catch (err) {
      if (err.exitCode != null) {
        throw new Error(`Hack server start failed with code: ${String(err.exitCode)}`);
      }
      throw new Error(`Hack server failed with error: ${err.message}`);
    }
    const processStream = (0, (_process || _load_process()).spawn)(command, ['ide', configDir]);
    const hackProcess = new HackProcess(fileCache, `HackProcess-${configDir}`, processStream, configDir);

    // If the process exits unexpectedly, create a new one immediately.
    const startTime = Date.now();
    hackProcess.observeExitMessage().subscribe(function (message) {
      // Dispose the process by removing it from the cache.
      if (processes.has(fileCache)) {
        processes.get(fileCache).delete(configDir);
      }
      if (message != null && message.exitCode === HACK_IDE_NEW_CLIENT_CONNECTED_EXIT_CODE) {
        (_hackConfig || _load_hackConfig()).logger.info('Not reconnecting Hack process--another client connected');
        return;
      }
      // If the process exited too quickly (possibly due to a crash), don't get
      // stuck in a loop creating and crashing it.
      const processUptimeMs = Date.now() - startTime;
      if (processUptimeMs < 1000) {
        (_hackConfig || _load_hackConfig()).logger.error('Hack process exited in <1s; not reconnecting');
        return;
      }
      (_hackConfig || _load_hackConfig()).logger.info(`Reconnecting with new HackProcess for ${configDir}`);
      processes.get(fileCache).get(configDir);
    });

    return hackProcess;
  });

  return function createHackProcess(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
})();

exports.ensureProcesses = ensureProcesses;
exports.closeProcesses = closeProcesses;
exports.observeConnections = observeConnections;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _nuclideRpc;

function _load_nuclideRpc() {
  return _nuclideRpc = require('../../nuclide-rpc');
}

var _hackConfig;

function _load_hackConfig() {
  return _hackConfig = require('./hack-config');
}

var _nuclideMarshalersCommon;

function _load_nuclideMarshalersCommon() {
  return _nuclideMarshalersCommon = require('../../nuclide-marshalers-common');
}

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _cache;

function _load_cache() {
  return _cache = require('nuclide-commons/cache');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Completions;

function _load_Completions() {
  return _Completions = require('./Completions');
}

var _constants;

function _load_constants() {
  return _constants = require('../../nuclide-hack-common/lib/constants');
}

var _autocomplete;

function _load_autocomplete() {
  return _autocomplete = require('../../nuclide-hack-common/lib/autocomplete');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// From hphp/hack/src/utils/exit_status.ml
const HACK_SERVER_ALREADY_EXISTS_EXIT_CODE = 77; /**
                                                  * Copyright (c) 2015-present, Facebook, Inc.
                                                  * All rights reserved.
                                                  *
                                                  * This source code is licensed under the license found in the LICENSE file in
                                                  * the root directory of this source tree.
                                                  *
                                                  * 
                                                  * @format
                                                  */

const HACK_IDE_NEW_CLIENT_CONNECTED_EXIT_CODE = 207;

// This isn't truly correct, but this will be deprecated with the LSP anyway.
const MAX_HACK_AUTOCOMPLETE_ITEMS = 50;

let serviceRegistry = null;

function getServiceRegistry() {
  if (serviceRegistry == null) {
    serviceRegistry = new (_nuclideRpc || _load_nuclideRpc()).ServiceRegistry([(_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).localNuclideUriMarshalers], (0, (_nuclideRpc || _load_nuclideRpc()).loadServicesConfig)((_nuclideUri || _load_nuclideUri()).default.join(__dirname, '..')));
  }
  return serviceRegistry;
}

function logMessage(direction, message) {
  (_hackConfig || _load_hackConfig()).logger.trace(`Hack Connection message ${direction}: '${message}'`);
}

class HackProcess {

  constructor(fileCache, name, processStream, hhconfigPath) {
    this._process = new (_nuclideRpc || _load_nuclideRpc()).RpcProcess(name, getServiceRegistry(), processStream, logMessage);
    this._fileCache = fileCache;
    this._fileVersionNotifier = new (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileVersionNotifier();
    this._hhconfigPath = hhconfigPath;

    this._fileSubscription = fileCache.observeFileEvents()
    // TODO: Filter on hhconfigPath
    .filter(fileEvent => {
      const fileExtension = (_nuclideUri || _load_nuclideUri()).default.extname(fileEvent.fileVersion.filePath);
      return (_constants || _load_constants()).HACK_FILE_EXTENSIONS.indexOf(fileExtension) !== -1;
    }).combineLatest(_rxjsBundlesRxMinJs.Observable.fromPromise(this.getConnectionService())).subscribe(([fileEvent, service]) => {
      const filePath = fileEvent.fileVersion.filePath;
      const version = fileEvent.fileVersion.version;
      switch (fileEvent.kind) {
        case (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileEventKind.OPEN:
          service.didOpenFile(filePath, version, fileEvent.contents);
          // TODO: Remove this once hack handles the initial contents in the open message.
          service.didChangeFile(filePath, version, [{
            text: fileEvent.contents
          }]);
          break;
        case (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileEventKind.CLOSE:
          service.didCloseFile(filePath);
          break;
        case (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileEventKind.EDIT:
          service.didChangeFile(filePath, version, [editToHackEdit(fileEvent)]);
          break;
        default:
          throw new Error(`Unexpected FileEvent kind: ${JSON.stringify(fileEvent)}`);
      }
      this._fileVersionNotifier.onEvent(fileEvent);
    });
  }

  getRoot() {
    return this._hhconfigPath;
  }

  getConnectionService() {
    if (!!this._process.isDisposed()) {
      throw new Error('getService called on disposed hackProcess');
    }

    return this._process.getService('HackConnectionService');
  }

  observeExitMessage() {
    return this._process.observeExitMessage();
  }

  getBufferAtVersion(fileVersion) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      // Must also wait for edits to be sent to Hack
      if (!(yield _this._fileVersionNotifier.waitForBufferAtVersion(fileVersion))) {
        return null;
      }
      return buffer != null && buffer.changeCount === fileVersion.version ? buffer : null;
    })();
  }

  getAutocompleteSuggestions(fileVersion, position, activatedManually) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filePath = fileVersion.filePath;
      (_hackConfig || _load_hackConfig()).logger.debug(`Attempting Hack Autocomplete: ${filePath}, ${position.toString()}`);
      const buffer = yield _this2.getBufferAtVersion(fileVersion);
      if (buffer == null) {
        return { isIncomplete: false, items: [] };
      }
      const contents = buffer.getText();
      const offset = buffer.characterIndexForPosition(position);

      const replacementPrefix = (0, (_autocomplete || _load_autocomplete()).findHackPrefix)(buffer, position);
      if (replacementPrefix === '' && !(0, (_Completions || _load_Completions()).hasPrefix)(buffer, position)) {
        return null;
      }

      const line = position.row + 1;
      const column = position.column + 1;
      const service = _this2.getConnectionService();

      (_hackConfig || _load_hackConfig()).logger.debug('Got Hack Service');
      // TODO: Include version number to ensure agreement on file version.
      const unfilteredItems = yield (yield service).getCompletions(filePath, { line, column });
      if (unfilteredItems == null) {
        return null;
      }
      const isIncomplete = unfilteredItems.length >= MAX_HACK_AUTOCOMPLETE_ITEMS;

      const items = (0, (_Completions || _load_Completions()).convertCompletions)(contents, offset, replacementPrefix, unfilteredItems);

      return { isIncomplete, items };
    })();
  }

  _disconnect() {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // Attempt to send disconnect message before shutting down connection
      try {
        (_hackConfig || _load_hackConfig()).logger.debug('Attempting to disconnect cleanly from HackProcess');
        (yield _this3.getConnectionService()).disconnect();
      } catch (e) {
        // Failing to send the shutdown is not fatal...
        // ... continue with shutdown.
        (_hackConfig || _load_hackConfig()).logger.error('Hack Process died before disconnect() could be sent.');
      }
    })();
  }

  dispose() {
    this._disconnect();
    this._process.dispose();
    this._fileVersionNotifier.dispose();
    this._fileSubscription.unsubscribe();
  }
}

// Maps FileCache => hack config dir => HackProcess
const processes = new (_cache || _load_cache()).Cache(fileCache => new (_cache || _load_cache()).Cache(hackRoot => retryCreateHackProcess(fileCache, hackRoot), value => {
  value.then((_cache || _load_cache()).DISPOSE_VALUE);
}), (_cache || _load_cache()).DISPOSE_VALUE);

// TODO: Is there any situation where these can be disposed before the
//       remote connection is terminated?
// Remove fileCache when the remote connection shuts down
processes.observeKeys().subscribe(fileCache => {
  fileCache.observeFileEvents().ignoreElements().subscribe(undefined, // next
  undefined, // error
  () => {
    (_hackConfig || _load_hackConfig()).logger.info('fileCache shutting down.');
    closeProcesses(fileCache);
  });
});

function ensureProcesses(fileCache, configPaths) {
  (_hackConfig || _load_hackConfig()).logger.info(`Hack ensureProcesses. ${Array.from(configPaths).join(', ')}`);
  processes.get(fileCache).setKeys(configPaths);
}

// Closes all HackProcesses for the given fileCache.
function closeProcesses(fileCache) {
  (_hackConfig || _load_hackConfig()).logger.info('Hack closeProcesses');
  if (processes.has(fileCache)) {
    (_hackConfig || _load_hackConfig()).logger.info(`Shutting down HackProcesses ${Array.from(processes.get(fileCache).keys()).join(',')}`);
    processes.delete(fileCache);
  }
}

function editToHackEdit(editEvent) {
  const { start, end } = editEvent.oldRange;
  return {
    range: {
      start: { line: start.row + 1, column: start.column + 1 },
      end: { line: end.row + 1, column: end.column + 1 }
    },
    text: editEvent.newText
  };
}

function observeConnections(fileCache) {
  (_hackConfig || _load_hackConfig()).logger.info('observing connections');
  return processes.get(fileCache).observeValues().switchMap(process => process).filter(process => process != null).switchMap(process => {
    if (!(process != null)) {
      throw new Error('Invariant violation: "process != null"');
    }

    (_hackConfig || _load_hackConfig()).logger.info(`Observing process ${process._hhconfigPath}`);
    return process.getConnectionService();
  });
}