'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ServerLanguageService = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.ensureInvalidations = ensureInvalidations;

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This is a version of the LanguageService interface which operates on a
// single modified file at a time. This provides a simplified interface
// for LanguageService implementors, at the cost of providing language analysis
// which can not reflect multiple edited files.
class ServerLanguageService {

  constructor(fileNotifier, service) {
    if (!(fileNotifier instanceof (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileCache)) {
      throw new Error('Invariant violation: "fileNotifier instanceof FileCache"');
    }

    this._fileCache = fileNotifier;
    this._service = service;
  }

  getSingleFileLanguageService() {
    return this._service;
  }

  getDiagnostics(fileVersion) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filePath = fileVersion.filePath;
      const buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      if (buffer == null) {
        return null;
      }
      return _this._service.getDiagnostics(filePath, buffer);
    })();
  }

  observeDiagnostics() {
    return this._service.observeDiagnostics().publish();
  }

  getAutocompleteSuggestions(fileVersion, position, request) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filePath = fileVersion.filePath;
      const buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      if (buffer == null) {
        // TODO: this should return null so the empty list doesn't get cached
        return { isIncomplete: false, items: [] };
      }
      return _this2._service.getAutocompleteSuggestions(filePath, buffer, position, request.activatedManually, request.prefix);
    })();
  }

  getDefinition(fileVersion, position) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filePath = fileVersion.filePath;
      const buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      if (buffer == null) {
        return null;
      }
      return _this3._service.getDefinition(filePath, buffer, position);
    })();
  }

  findReferences(fileVersion, position) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filePath = fileVersion.filePath;
      const buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      if (buffer == null) {
        return null;
      }
      return _this4._service.findReferences(filePath, buffer, position);
    })();
  }

  getCoverage(filePath) {
    return this._service.getCoverage(filePath);
  }

  getCodeActions(fileVersion, range, diagnostics) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { filePath } = fileVersion;
      return _this5._service.getCodeActions(filePath, range, diagnostics);
    })();
  }

  getOutline(fileVersion) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filePath = fileVersion.filePath;
      const buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      if (buffer == null) {
        return null;
      }
      return _this6._service.getOutline(filePath, buffer);
    })();
  }

  typeHint(fileVersion, position) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filePath = fileVersion.filePath;
      const buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      if (buffer == null) {
        return null;
      }
      return _this7._service.typeHint(filePath, buffer, position);
    })();
  }

  highlight(fileVersion, position) {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filePath = fileVersion.filePath;
      const buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      if (buffer == null) {
        return [];
      }
      return _this8._service.highlight(filePath, buffer, position);
    })();
  }

  formatSource(fileVersion, range, options) {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filePath = fileVersion.filePath;
      const buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      if (buffer == null) {
        return null;
      }
      return _this9._service.formatSource(filePath, buffer, range, options);
    })();
  }

  formatEntireFile(fileVersion, range, options) {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filePath = fileVersion.filePath;
      const buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      if (buffer == null) {
        return null;
      }
      return _this10._service.formatEntireFile(filePath, buffer, range, options);
    })();
  }

  formatAtPosition(fileVersion, position, triggerCharacter, options) {
    var _this11 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filePath = fileVersion.filePath;
      const buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      if (buffer == null) {
        return null;
      }
      return _this11._service.formatAtPosition(filePath, buffer, position, triggerCharacter, options);
    })();
  }

  getEvaluationExpression(fileVersion, position) {
    var _this12 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filePath = fileVersion.filePath;
      const buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      if (buffer == null) {
        return null;
      }
      return _this12._service.getEvaluationExpression(filePath, buffer, position);
    })();
  }

  supportsSymbolSearch(directories) {
    return Promise.resolve(false);
    // A single-file language service by definition cannot offer
    // "project-wide symbol search". If you want your language to offer
    // symbols, you'll have to implement LanguageService directly.
  }

  symbolSearch(query, directories) {
    return Promise.resolve(null);
  }

  getProjectRoot(fileUri) {
    return this._service.getProjectRoot(fileUri);
  }

  isFileInProject(fileUri) {
    var _this13 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this13._service.isFileInProject(fileUri);
    })();
  }

  dispose() {
    this._service.dispose();
  }
}

exports.ServerLanguageService = ServerLanguageService; // Assert that ServerLanguageService satisifes the LanguageService interface:
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

null;

function ensureInvalidations(logger, diagnostics) {
  const filesWithErrors = new Set();
  const trackedDiagnostics = diagnostics.do(diagnosticArray => {
    for (const diagnostic of diagnosticArray) {
      const filePath = diagnostic.filePath;
      if (diagnostic.messages.length === 0) {
        logger.debug(`Removing ${filePath} from files with errors`);
        filesWithErrors.delete(filePath);
      } else {
        logger.debug(`Adding ${filePath} to files with errors`);
        filesWithErrors.add(filePath);
      }
    }
  });

  const fileInvalidations = _rxjsBundlesRxMinJs.Observable.defer(() => {
    logger.debug('Clearing errors after stream closed');
    return _rxjsBundlesRxMinJs.Observable.of(Array.from(filesWithErrors).map(file => {
      logger.debug(`Clearing errors for ${file} after connection closed`);
      return {
        filePath: file,
        messages: []
      };
    }));
  });

  return trackedDiagnostics.concat(fileInvalidations);
}