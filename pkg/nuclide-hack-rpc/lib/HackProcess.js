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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var getHackProcess = _asyncToGenerator(function* (fileCache, filePath) {
  var configDir = yield (0, (_hackConfig2 || _hackConfig()).findHackConfigDir)(filePath);
  if (configDir == null) {
    return null;
  }

  var processCache = processes.get(fileCache);
  var hackProcess = processCache.get(configDir);
  hackProcess.then(function (result) {
    // If we fail to connect to hack, then retry on next request.
    if (result == null) {
      processCache.delete(configDir);
    }
  });
  return yield hackProcess;
});

exports.getHackProcess = getHackProcess;

var createHackProcess = _asyncToGenerator(function* (fileCache, configDir) {
  var command = yield (0, (_hackConfig2 || _hackConfig()).getHackCommand)();
  if (command === '') {
    return null;
  }

  (_hackConfig4 || _hackConfig3()).logger.logInfo('Creating new hack connection for ' + configDir + ': ' + command);
  (_hackConfig4 || _hackConfig3()).logger.logInfo('Current PATH: ' + (0, (_commonsNodeString2 || _commonsNodeString()).maybeToString)(process.env.PATH));
  var startServerResult = yield (0, (_commonsNodeProcess2 || _commonsNodeProcess()).asyncExecute)(command, ['start', configDir]);
  (_hackConfig4 || _hackConfig3()).logger.logInfo('Hack connection start server results:\n' + JSON.stringify(startServerResult, null, 2) + '\n');
  if (startServerResult.exitCode !== 0 && startServerResult.exitCode !== HACK_SERVER_ALREADY_EXISTS_EXIT_CODE) {
    return null;
  }
  var createProcess = function createProcess() {
    return (0, (_commonsNodeProcess2 || _commonsNodeProcess()).safeSpawn)(command, ['ide', configDir]);
  };
  return new HackProcess(fileCache, 'HackProcess-' + configDir, createProcess, configDir);
});

exports.observeConnections = observeConnections;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../commons-node/process');
}

var _commonsNodeString2;

function _commonsNodeString() {
  return _commonsNodeString2 = require('../../commons-node/string');
}

var _nuclideRpc2;

function _nuclideRpc() {
  return _nuclideRpc2 = require('../../nuclide-rpc');
}

var _hackConfig2;

function _hackConfig() {
  return _hackConfig2 = require('./hack-config');
}

var _nuclideRpc4;

function _nuclideRpc3() {
  return _nuclideRpc4 = require('../../nuclide-rpc');
}

var _nuclideMarshalersCommon2;

function _nuclideMarshalersCommon() {
  return _nuclideMarshalersCommon2 = require('../../nuclide-marshalers-common');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideOpenFilesRpc2;

function _nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc2 = require('../../nuclide-open-files-rpc');
}

var _commonsNodeCache2;

function _commonsNodeCache() {
  return _commonsNodeCache2 = require('../../commons-node/cache');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var _nuclideOpenFilesRpc4;

function _nuclideOpenFilesRpc3() {
  return _nuclideOpenFilesRpc4 = require('../../nuclide-open-files-rpc');
}

var _Completions2;

function _Completions() {
  return _Completions2 = require('./Completions');
}

// From https://reviews.facebook.net/diffusion/HHVM/browse/master/hphp/hack/src/utils/exit_status.ml
var HACK_SERVER_ALREADY_EXISTS_EXIT_CODE = 77;

var _hackConfig4;

function _hackConfig3() {
  return _hackConfig4 = require('./hack-config');
}

var serviceRegistry = null;

function getServiceRegistry() {
  if (serviceRegistry == null) {
    serviceRegistry = new (_nuclideRpc4 || _nuclideRpc3()).ServiceRegistry([(_nuclideMarshalersCommon2 || _nuclideMarshalersCommon()).localNuclideUriMarshalers], (0, (_nuclideRpc4 || _nuclideRpc3()).loadServicesConfig)((_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(__dirname, '..')));
  }
  return serviceRegistry;
}

function logMessage(direction, message) {
  (_hackConfig4 || _hackConfig3()).logger.logInfo('Hack Connection message ' + direction + ': \'' + message + '\'');
}

// From hack/src/utils/findUtils.ml
var HACK_FILE_EXTENSIONS = ['.php', // normal php file
'.hh', // Hack extension some open source code is starting to use
'.phpt', // our php template files
'.hhi', // interface files only visible to the type checker
'.xhp'];

// XHP extensions

var HackProcess = (function (_RpcProcess) {
  _inherits(HackProcess, _RpcProcess);

  function HackProcess(fileCache, name, createProcess, hhconfigPath) {
    var _this = this;

    _classCallCheck(this, HackProcess);

    _get(Object.getPrototypeOf(HackProcess.prototype), 'constructor', this).call(this, name, getServiceRegistry(), createProcess, logMessage);
    this._fileCache = fileCache;
    this._fileVersionNotifier = new (_nuclideOpenFilesRpc2 || _nuclideOpenFilesRpc()).FileVersionNotifier();
    this._hhconfigPath = hhconfigPath;

    var service = this.getConnectionService();
    this._fileSubscription = fileCache.observeFileEvents()
    // TODO: Filter on hhconfigPath
    .filter(function (fileEvent) {
      var fileExtension = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.extname(fileEvent.fileVersion.filePath);
      return HACK_FILE_EXTENSIONS.indexOf(fileExtension) !== -1;
    }).subscribe(function (fileEvent) {
      var filePath = fileEvent.fileVersion.filePath;
      var version = fileEvent.fileVersion.version;
      switch (fileEvent.kind) {
        case 'open':
          service.didOpenFile(filePath);
          service.didChangeFile(filePath, version, [{ text: fileEvent.contents }]);
          break;
        case 'close':
          service.didCloseFile(filePath);
          break;
        case 'edit':
          service.didChangeFile(filePath, version, [editToHackEdit(fileEvent)]);
          break;
        default:
          throw new Error('Unexpected FileEvent kind: ' + JSON.stringify(fileEvent));
      }
      _this._fileVersionNotifier.onEvent(fileEvent);
    });
    this.observeExitCode().finally(function () {
      _this.dispose();
    });
  }

  // Maps FileCache => hack config dir => HackProcess

  _createClass(HackProcess, [{
    key: 'getRoot',
    value: function getRoot() {
      return this._hhconfigPath;
    }
  }, {
    key: 'getConnectionService',
    value: function getConnectionService() {
      (0, (_assert2 || _assert()).default)(!this.isDisposed(), 'getService called on disposed hackProcess');
      return this.getService('HackConnectionService');
    }
  }, {
    key: 'getBufferAtVersion',
    value: _asyncToGenerator(function* (fileVersion) {
      var buffer = yield (0, (_nuclideOpenFilesRpc4 || _nuclideOpenFilesRpc3()).getBufferAtVersion)(fileVersion);
      // Must also wait for edits to be sent to Hack
      yield this._fileVersionNotifier.waitForBufferAtVersion(fileVersion);
      (0, (_assert2 || _assert()).default)(buffer.changeCount === fileVersion.version, 'File changed waiting for edits to be sent to Hack');
      return buffer;
    })
  }, {
    key: 'getAutocompleteSuggestions',
    value: _asyncToGenerator(function* (fileVersion, position, activatedManually) {
      var filePath = fileVersion.filePath;
      (_hackConfig4 || _hackConfig3()).logger.logTrace('Attempting Hack Autocomplete: ' + filePath + ', ' + position.toString());
      var buffer = yield this.getBufferAtVersion(fileVersion);
      var contents = buffer.getText();
      var offset = buffer.characterIndexForPosition(position);

      var replacementPrefix = (0, (_Completions2 || _Completions()).findHackPrefix)(buffer, position);
      if (replacementPrefix === '' && !(0, (_Completions2 || _Completions()).hasPrefix)(buffer, position)) {
        return [];
      }

      var line = position.row + 1;
      var column = position.column + 1;
      var service = this.getConnectionService();

      (_hackConfig4 || _hackConfig3()).logger.logTrace('Got Hack Service');
      return (0, (_Completions2 || _Completions()).convertCompletions)(contents, offset, replacementPrefix, (
      // TODO: Include version number to ensure agreement on file version.
      yield service.getCompletions(filePath, { line: line, column: column })));
    })
  }, {
    key: 'dispose',
    value: function dispose() {
      if (!this.isDisposed()) {
        // Atempt to send disconnect message before shutting down connection
        this.getConnectionService().disconnect();
        _get(Object.getPrototypeOf(HackProcess.prototype), 'dispose', this).call(this);
        this._fileVersionNotifier.dispose();
        this._fileSubscription.unsubscribe();
        if (processes.has(this._fileCache)) {
          processes.get(this._fileCache).delete(this._hhconfigPath);
        }
      }
    }
  }]);

  return HackProcess;
})((_nuclideRpc2 || _nuclideRpc()).RpcProcess);

var processes = new (_commonsNodeCache2 || _commonsNodeCache()).Cache(function (fileCache) {
  return new (_commonsNodeCache2 || _commonsNodeCache()).Cache(function (hackRoot) {
    return createHackProcess(fileCache, hackRoot);
  }, function (value) {
    value.then(function (process) {
      if (process != null) {
        process.dispose();
      }
    });
  });
}, (_commonsNodeCache2 || _commonsNodeCache()).DISPOSE_VALUE);

// TODO: Is there any situation where these can be disposed before the
//       remote connection is terminated?
// Remove fileCache when the remote connection shuts down
processes.observeKeys().subscribe(function (fileCache) {
  fileCache.observeFileEvents().ignoreElements().subscribe(undefined, // next
  undefined, // error
  function () {
    processes.delete(fileCache);
  });
});

function editToHackEdit(editEvent) {
  var _editEvent$oldRange = editEvent.oldRange;
  var start = _editEvent$oldRange.start;
  var end = _editEvent$oldRange.end;

  return {
    range: {
      start: { line: start.row + 1, column: start.column + 1 },
      end: { line: end.row + 1, column: end.column + 1 }
    },
    text: editEvent.newText
  };
}

function observeConnections(fileCache) {
  (_hackConfig4 || _hackConfig3()).logger.logInfo('observing connections');
  return processes.get(fileCache).observeValues().switchMap(function (process) {
    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.fromPromise(process);
  }).filter(function (process) {
    return process != null;
  }).map(function (process) {
    (0, (_assert2 || _assert()).default)(process != null);
    (_hackConfig4 || _hackConfig3()).logger.logInfo('Observing process ' + process._hhconfigPath);
    return process.getConnectionService();
  });
}