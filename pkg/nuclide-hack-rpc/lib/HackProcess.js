'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHackProcess = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getHackProcess = exports.getHackProcess = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (fileCache, filePath) {
    const configDir = yield (0, (_hackConfig || _load_hackConfig()).findHackConfigDir)(filePath);
    if (configDir == null) {
      return null;
    }

    const processCache = processes.get(fileCache);
    const hackProcess = processCache.get(configDir);
    hackProcess.then(function (result) {
      // If we fail to connect to hack, then retry on next request.
      if (result == null) {
        processCache.delete(configDir);
      }
    });
    return yield hackProcess;
  });

  return function getHackProcess(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

// Ensures that the only attached HackProcesses are those for the given configPaths.
// Closes all HackProcesses not in configPaths, and starts new HackProcesses for any
// paths in configPaths.


let createHackProcess = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (fileCache, configDir) {
    const command = yield (0, (_hackConfig || _load_hackConfig()).getHackCommand)();
    if (command === '') {
      return null;
    }

    (_hackConfig || _load_hackConfig()).logger.logInfo(`Creating new hack connection for ${ configDir }: ${ command }`);
    (_hackConfig || _load_hackConfig()).logger.logInfo(`Current PATH: ${ (0, (_string || _load_string()).maybeToString)(process.env.PATH) }`);
    const startServerResult = yield (0, (_process || _load_process()).asyncExecute)(command, ['start', configDir]);
    (_hackConfig || _load_hackConfig()).logger.logInfo(`Hack connection start server results:\n${ JSON.stringify(startServerResult, null, 2) }\n`);
    if (startServerResult.exitCode !== 0 && startServerResult.exitCode !== HACK_SERVER_ALREADY_EXISTS_EXIT_CODE) {
      return null;
    }
    const createProcess = function () {
      return (0, (_process || _load_process()).safeSpawn)(command, ['ide', configDir]);
    };
    return new HackProcess(fileCache, `HackProcess-${ configDir }`, createProcess, configDir);
  });

  return function createHackProcess(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

exports.ensureProcesses = ensureProcesses;
exports.observeConnections = observeConnections;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

var _string;

function _load_string() {
  return _string = require('../../commons-node/string');
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
  return _cache = require('../../commons-node/cache');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Completions;

function _load_Completions() {
  return _Completions = require('./Completions');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// From https://reviews.facebook.net/diffusion/HHVM/browse/master/hphp/hack/src/utils/exit_status.ml
const HACK_SERVER_ALREADY_EXISTS_EXIT_CODE = 77;

let serviceRegistry = null;

function getServiceRegistry() {
  if (serviceRegistry == null) {
    serviceRegistry = new (_nuclideRpc || _load_nuclideRpc()).ServiceRegistry([(_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).localNuclideUriMarshalers], (0, (_nuclideRpc || _load_nuclideRpc()).loadServicesConfig)((_nuclideUri || _load_nuclideUri()).default.join(__dirname, '..')));
  }
  return serviceRegistry;
}

function logMessage(direction, message) {
  (_hackConfig || _load_hackConfig()).logger.logInfo(`Hack Connection message ${ direction }: '${ message }'`);
}

let HackProcess = class HackProcess extends (_nuclideRpc || _load_nuclideRpc()).RpcProcess {

  constructor(fileCache, name, createProcess, hhconfigPath) {
    super(name, getServiceRegistry(), createProcess, logMessage);
    this._fileCache = fileCache;
    this._fileVersionNotifier = new (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileVersionNotifier();
    this._hhconfigPath = hhconfigPath;

    const service = this.getConnectionService();
    this._fileSubscription = fileCache.observeFileEvents()
    // TODO: Filter on hhconfigPath
    .filter(fileEvent => {
      const fileExtension = (_nuclideUri || _load_nuclideUri()).default.extname(fileEvent.fileVersion.filePath);
      return (_hackConfig || _load_hackConfig()).HACK_FILE_EXTENSIONS.indexOf(fileExtension) !== -1;
    }).subscribe(fileEvent => {
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
          throw new Error(`Unexpected FileEvent kind: ${ JSON.stringify(fileEvent) }`);
      }
      this._fileVersionNotifier.onEvent(fileEvent);
    });
    this.observeExitCode().finally(() => {
      this.dispose();
    });
  }

  getRoot() {
    return this._hhconfigPath;
  }

  getConnectionService() {
    if (!!this.isDisposed()) {
      throw new Error('getService called on disposed hackProcess');
    }

    return this.getService('HackConnectionService');
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
      (_hackConfig || _load_hackConfig()).logger.logTrace(`Attempting Hack Autocomplete: ${ filePath }, ${ position.toString() }`);
      const buffer = yield _this2.getBufferAtVersion(fileVersion);
      if (buffer == null) {
        return [];
      }
      const contents = buffer.getText();
      const offset = buffer.characterIndexForPosition(position);

      const replacementPrefix = (0, (_Completions || _load_Completions()).findHackPrefix)(buffer, position);
      if (replacementPrefix === '' && !(0, (_Completions || _load_Completions()).hasPrefix)(buffer, position)) {
        return [];
      }

      const line = position.row + 1;
      const column = position.column + 1;
      const service = _this2.getConnectionService();

      (_hackConfig || _load_hackConfig()).logger.logTrace('Got Hack Service');
      return (0, (_Completions || _load_Completions()).convertCompletions)(contents, offset, replacementPrefix, (
      // TODO: Include version number to ensure agreement on file version.
      yield service.getCompletions(filePath, { line: line, column: column })));
    })();
  }

  dispose() {
    if (!this.isDisposed()) {
      // Atempt to send disconnect message before shutting down connection
      try {
        (_hackConfig || _load_hackConfig()).logger.logTrace('Attempting to disconnect cleanly from HackProcess');
        this.getConnectionService().disconnect();
      } catch (e) {
        // Failing to send the shutdown is not fatal...
        // ... continue with shutdown.
        (_hackConfig || _load_hackConfig()).logger.logError('Hack Process died before disconnect() could be sent.');
      }
      super.dispose();
      this._fileVersionNotifier.dispose();
      this._fileSubscription.unsubscribe();
      if (processes.has(this._fileCache)) {
        processes.get(this._fileCache).delete(this._hhconfigPath);
      }
    }
  }
};

// Maps FileCache => hack config dir => HackProcess

const processes = new (_cache || _load_cache()).Cache(fileCache => new (_cache || _load_cache()).Cache(hackRoot => createHackProcess(fileCache, hackRoot), value => {
  value.then(process => {
    if (process != null) {
      process.dispose();
    }
  });
}), (_cache || _load_cache()).DISPOSE_VALUE);

// TODO: Is there any situation where these can be disposed before the
//       remote connection is terminated?
// Remove fileCache when the remote connection shuts down
processes.observeKeys().subscribe(fileCache => {
  fileCache.observeFileEvents().ignoreElements().subscribe(undefined, // next
  undefined, // error
  () => {
    processes.delete(fileCache);
  });
});

function ensureProcesses(fileCache, configPaths) {
  processes.get(fileCache).setKeys(configPaths);
}

function editToHackEdit(editEvent) {
  var _editEvent$oldRange = editEvent.oldRange;
  const start = _editEvent$oldRange.start,
        end = _editEvent$oldRange.end;

  return {
    range: {
      start: { line: start.row + 1, column: start.column + 1 },
      end: { line: end.row + 1, column: end.column + 1 }
    },
    text: editEvent.newText
  };
}

function observeConnections(fileCache) {
  (_hackConfig || _load_hackConfig()).logger.logInfo('observing connections');
  return processes.get(fileCache).observeValues().switchMap(process => _rxjsBundlesRxMinJs.Observable.fromPromise(process)).filter(process => process != null).map(process => {
    if (!(process != null)) {
      throw new Error('Invariant violation: "process != null"');
    }

    (_hackConfig || _load_hackConfig()).logger.logInfo(`Observing process ${ process._hhconfigPath }`);
    return process.getConnectionService();
  });
}