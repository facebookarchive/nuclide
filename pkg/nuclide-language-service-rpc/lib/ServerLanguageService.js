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
exports.ServerLanguageService = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let ServerLanguageService = exports.ServerLanguageService = class ServerLanguageService {

  constructor(fileNotifier, analyzer) {
    if (!(fileNotifier instanceof (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileCache)) {
      throw new Error('Invariant violation: "fileNotifier instanceof FileCache"');
    }

    this._fileCache = fileNotifier;
    this._analyzer = analyzer;
  }

  getDiagnostics(fileVersion) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filePath = fileVersion.filePath;
      const buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      if (buffer == null) {
        return null;
      }
      return yield _this._analyzer.getDiagnostics(filePath, buffer);
    })();
  }

  observeDiagnostics() {
    return this._analyzer.observeDiagnostics().publish();
  }

  getAutocompleteSuggestions(fileVersion, position, activatedManually) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filePath = fileVersion.filePath;
      const buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      if (buffer == null) {
        return [];
      }
      return yield _this2._analyzer.getAutocompleteSuggestions(filePath, buffer, position, activatedManually);
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
      return yield _this3._analyzer.getDefinition(filePath, buffer, position);
    })();
  }

  getDefinitionById(file, id) {
    return this._analyzer.getDefinitionById(file, id);
  }

  findReferences(fileVersion, position) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filePath = fileVersion.filePath;
      const buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      if (buffer == null) {
        return null;
      }
      return yield _this4._analyzer.findReferences(filePath, buffer, position);
    })();
  }

  getCoverage(filePath) {
    return this._analyzer.getCoverage(filePath);
  }

  getOutline(fileVersion) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filePath = fileVersion.filePath;
      const buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      if (buffer == null) {
        return null;
      }
      return yield _this5._analyzer.getOutline(filePath, buffer);
    })();
  }

  typeHint(fileVersion, position) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filePath = fileVersion.filePath;
      const buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      if (buffer == null) {
        return null;
      }
      return yield _this6._analyzer.typeHint(filePath, buffer, position);
    })();
  }

  highlight(fileVersion, position) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filePath = fileVersion.filePath;
      const buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      if (buffer == null) {
        return [];
      }
      return yield _this7._analyzer.highlight(filePath, buffer, position);
    })();
  }

  formatSource(fileVersion, range) {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filePath = fileVersion.filePath;
      const buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      if (buffer == null) {
        return null;
      }
      return yield _this8._analyzer.formatSource(filePath, buffer, range);
    })();
  }

  getEvaluationExpression(fileVersion, position) {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filePath = fileVersion.filePath;
      const buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      if (buffer == null) {
        return null;
      }
      return yield _this9._analyzer.getEvaluationExpression(filePath, buffer, position);
    })();
  }

  getProjectRoot(fileUri) {
    return this._analyzer.getProjectRoot(fileUri);
  }

  isFileInProject(fileUri) {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this10._analyzer.isFileInProject(fileUri);
    })();
  }

  dispose() {
    this._analyzer.dispose();
  }
};