"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHackProcess = getHackProcess;
exports.ensureProcesses = ensureProcesses;
exports.closeProcesses = closeProcesses;
exports.observeConnections = observeConnections;

function _promise() {
  const data = require("../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _string() {
  const data = require("../../../modules/nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

function _nuclideRpc() {
  const data = require("../../nuclide-rpc");

  _nuclideRpc = function () {
    return data;
  };

  return data;
}

function _hackConfig() {
  const data = require("./hack-config");

  _hackConfig = function () {
    return data;
  };

  return data;
}

function _nuclideMarshalersCommon() {
  const data = require("../../nuclide-marshalers-common");

  _nuclideMarshalersCommon = function () {
    return data;
  };

  return data;
}

function _nuclideOpenFilesRpc() {
  const data = require("../../nuclide-open-files-rpc");

  _nuclideOpenFilesRpc = function () {
    return data;
  };

  return data;
}

function _cache() {
  const data = require("../../../modules/nuclide-commons/cache");

  _cache = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _Completions() {
  const data = require("./Completions");

  _Completions = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("../../nuclide-hack-common/lib/constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _autocomplete() {
  const data = require("../../nuclide-hack-common/lib/autocomplete");

  _autocomplete = function () {
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
 *  strict-local
 * @format
 */
// From hphp/hack/src/utils/exit_status.ml
const HACK_SERVER_ALREADY_EXISTS_EXIT_CODE = 77;
const HACK_IDE_NEW_CLIENT_CONNECTED_EXIT_CODE = 207; // This isn't truly correct, but this will be deprecated with the LSP anyway.

const MAX_HACK_AUTOCOMPLETE_ITEMS = 50;
let serviceRegistry = null;

function getServiceRegistry() {
  if (serviceRegistry == null) {
    serviceRegistry = new (_nuclideRpc().ServiceRegistry)([_nuclideMarshalersCommon().localNuclideUriMarshalers], (0, _nuclideRpc().loadServicesConfig)(_nuclideUri().default.join(__dirname, '..')));
  }

  return serviceRegistry;
}

function logMessage(direction, message) {
  _hackConfig().logger.trace(`Hack Connection message ${direction}: '${message}'`);
}

class HackProcess {
  constructor(fileCache, name, processStream, hhconfigPath) {
    this._process = new (_nuclideRpc().RpcProcess)(name, getServiceRegistry(), processStream, logMessage);
    this._fileCache = fileCache;
    this._fileVersionNotifier = new (_nuclideOpenFilesRpc().FileVersionNotifier)();
    this._hhconfigPath = hhconfigPath;
    this._fileSubscription = fileCache.observeFileEvents() // TODO: Filter on hhconfigPath
    .filter(fileEvent => {
      const fileExtension = _nuclideUri().default.extname(fileEvent.fileVersion.filePath);

      return _constants().HACK_FILE_EXTENSIONS.indexOf(fileExtension) !== -1;
    }).combineLatest(_RxMin.Observable.fromPromise(this.getConnectionService())).subscribe(([fileEvent, service]) => {
      const filePath = fileEvent.fileVersion.filePath;
      const version = fileEvent.fileVersion.version;

      switch (fileEvent.kind) {
        case _nuclideOpenFilesRpc().FileEventKind.OPEN:
          service.didOpenFile(filePath, version, fileEvent.contents); // TODO: Remove this once hack handles the initial contents in the open message.

          service.didChangeFile(filePath, version, [{
            text: fileEvent.contents
          }]);
          break;

        case _nuclideOpenFilesRpc().FileEventKind.CLOSE:
          service.didCloseFile(filePath);
          break;

        case _nuclideOpenFilesRpc().FileEventKind.EDIT:
          service.didChangeFile(filePath, version, [editToHackEdit(fileEvent)]);
          break;

        case _nuclideOpenFilesRpc().FileEventKind.SAVE:
          break;

        default:
          fileEvent.kind;
          throw new Error(`Unexpected FileEvent kind: ${fileEvent.kind}`);
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

  async getBufferAtVersion(fileVersion) {
    const buffer = await (0, _nuclideOpenFilesRpc().getBufferAtVersion)(fileVersion); // Must also wait for edits to be sent to Hack

    if (!(await this._fileVersionNotifier.waitForBufferAtVersion(fileVersion))) {
      return null;
    }

    return buffer != null && buffer.changeCount === fileVersion.version ? buffer : null;
  }

  async getAutocompleteSuggestions(fileVersion, position, activatedManually) {
    const filePath = fileVersion.filePath;

    _hackConfig().logger.debug(`Attempting Hack Autocomplete: ${filePath}, ${position.toString()}`);

    const buffer = await this.getBufferAtVersion(fileVersion);

    if (buffer == null) {
      return {
        isIncomplete: false,
        items: []
      };
    }

    const contents = buffer.getText();
    const offset = buffer.characterIndexForPosition(position);
    const replacementPrefix = (0, _autocomplete().findHackPrefix)(buffer, position);

    if (replacementPrefix === '' && !(0, _Completions().hasPrefix)(buffer, position)) {
      return null;
    }

    const line = position.row + 1;
    const column = position.column + 1;
    const service = this.getConnectionService();

    _hackConfig().logger.debug('Got Hack Service'); // TODO: Include version number to ensure agreement on file version.


    const unfilteredItems = await (await service).getCompletions(filePath, {
      line,
      column
    });

    if (unfilteredItems == null) {
      return null;
    }

    const isIncomplete = unfilteredItems.length >= MAX_HACK_AUTOCOMPLETE_ITEMS;
    const items = (0, _Completions().convertCompletions)(contents, offset, replacementPrefix, unfilteredItems);
    return {
      isIncomplete,
      items
    };
  }

  async _disconnect() {
    // Attempt to send disconnect message before shutting down connection
    try {
      _hackConfig().logger.debug('Attempting to disconnect cleanly from HackProcess');

      (await this.getConnectionService()).disconnect();
    } catch (e) {
      // Failing to send the shutdown is not fatal...
      // ... continue with shutdown.
      _hackConfig().logger.error('Hack Process died before disconnect() could be sent.');
    }
  }

  dispose() {
    this._disconnect();

    this._process.dispose();

    this._fileVersionNotifier.dispose();

    this._fileSubscription.unsubscribe();
  }

} // Maps FileCache => hack config dir => HackProcess


const processes = new (_cache().Cache)(fileCache => new (_cache().Cache)(hackRoot => retryCreateHackProcess(fileCache, hackRoot), value => {
  value.then(_cache().DISPOSE_VALUE);
}), _cache().DISPOSE_VALUE); // TODO: Is there any situation where these can be disposed before the
//       remote connection is terminated?
// Remove fileCache when the remote connection shuts down

processes.observeKeys().subscribe(fileCache => {
  fileCache.observeFileEvents().ignoreElements().subscribe(undefined, // next
  undefined, // error
  () => {
    _hackConfig().logger.info('fileCache shutting down.');

    closeProcesses(fileCache);
  });
});

async function getHackProcess(fileCache, filePath) {
  const configDir = await (0, _hackConfig().findHackConfigDir)(filePath);

  if (configDir == null) {
    throw new Error('Failed to find Hack config directory');
  }

  return processes.get(fileCache).get(configDir);
} // Ensures that the only attached HackProcesses are those for the given configPaths.
// Closes all HackProcesses not in configPaths, and starts new HackProcesses for any
// paths in configPaths.


function ensureProcesses(fileCache, configPaths) {
  _hackConfig().logger.info(`Hack ensureProcesses. ${Array.from(configPaths).join(', ')}`);

  processes.get(fileCache).setKeys(configPaths);
} // Closes all HackProcesses for the given fileCache.


function closeProcesses(fileCache) {
  _hackConfig().logger.info('Hack closeProcesses');

  if (processes.has(fileCache)) {
    _hackConfig().logger.info(`Shutting down HackProcesses ${Array.from(processes.get(fileCache).keys()).join(',')}`);

    processes.delete(fileCache);
  }
}

async function retryCreateHackProcess(fileCache, hackRoot) {
  let hackProcess = null;
  let waitTimeMs = 500; // Disable no-await-in-loop because we do want these iterations to be serial.

  /* eslint-disable no-await-in-loop */

  while (hackProcess == null) {
    try {
      hackProcess = await createHackProcess(fileCache, hackRoot);
    } catch (e) {
      _hackConfig().logger.error(`Couldn't create HackProcess: ${e.message}`);

      _hackConfig().logger.error(`Waiting ${waitTimeMs}ms before retrying...`);

      await (0, _promise().sleep)(waitTimeMs);
      waitTimeMs *= 2;
      const hackProcessNeeded = processes.has(fileCache) && processes.get(fileCache).has(hackRoot); // If the HackProcess is no longer needed, or we would be waiting
      // longer than a few seconds, just give up.

      if (!hackProcessNeeded || waitTimeMs > 4000) {
        _hackConfig().logger.error(`Giving up on creating HackProcess: ${e.message}`); // Remove the (soon-to-be) rejected promise from our processes cache so
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
}

async function createHackProcess(fileCache, configDir) {
  const command = await (0, _hackConfig().getHackCommand)();

  if (command === '') {
    throw new Error("Couldn't find Hack command");
  }

  _hackConfig().logger.info(`Creating new hack connection for ${configDir}: ${command}`);

  _hackConfig().logger.info(`Current PATH: ${(0, _string().maybeToString)(process.env.PATH)}`);

  try {
    await (0, _process().runCommand)(command, ['start', configDir], {
      isExitError: ({
        exitCode
      }) => !(exitCode === 0 || exitCode === HACK_SERVER_ALREADY_EXISTS_EXIT_CODE)
    }).toPromise();
  } catch (err) {
    if (err.exitCode != null) {
      throw new Error(`Hack server start failed with code: ${String(err.exitCode)}`);
    }

    throw new Error(`Hack server failed with error: ${err.message}`);
  }

  const processStream = (0, _process().spawn)(command, ['ide', configDir]);
  const hackProcess = new HackProcess(fileCache, `HackProcess-${configDir}`, processStream, configDir); // If the process exits unexpectedly, create a new one immediately.

  const startTime = Date.now();
  hackProcess.observeExitMessage().subscribe(message => {
    // Dispose the process by removing it from the cache.
    if (processes.has(fileCache)) {
      processes.get(fileCache).delete(configDir);
    }

    if (message != null && message.exitCode === HACK_IDE_NEW_CLIENT_CONNECTED_EXIT_CODE) {
      _hackConfig().logger.info('Not reconnecting Hack process--another client connected');

      return;
    } // If the process exited too quickly (possibly due to a crash), don't get
    // stuck in a loop creating and crashing it.


    const processUptimeMs = Date.now() - startTime;

    if (processUptimeMs < 1000) {
      _hackConfig().logger.error('Hack process exited in <1s; not reconnecting');

      return;
    }

    _hackConfig().logger.info(`Reconnecting with new HackProcess for ${configDir}`);

    processes.get(fileCache).get(configDir);
  });
  return hackProcess;
}

function editToHackEdit(editEvent) {
  const {
    start,
    end
  } = editEvent.oldRange;
  return {
    range: {
      start: {
        line: start.row + 1,
        column: start.column + 1
      },
      end: {
        line: end.row + 1,
        column: end.column + 1
      }
    },
    text: editEvent.newText
  };
}

function observeConnections(fileCache) {
  _hackConfig().logger.info('observing connections');

  return processes.get(fileCache).observeValues().switchMap(process => process).filter(process => process != null).switchMap(process => {
    if (!(process != null)) {
      throw new Error("Invariant violation: \"process != null\"");
    }

    _hackConfig().logger.info(`Observing process ${process._hhconfigPath}`);

    return process.getConnectionService();
  });
}