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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _nuclideOpenFilesRpc2;

function _load_nuclideOpenFilesRpc2() {
  return _nuclideOpenFilesRpc2 = require('../../nuclide-open-files-rpc');
}

var ServerLanguageService = (function () {
  function ServerLanguageService(fileNotifier, analyzer) {
    _classCallCheck(this, ServerLanguageService);

    (0, (_assert || _load_assert()).default)(fileNotifier instanceof (_nuclideOpenFilesRpc2 || _load_nuclideOpenFilesRpc2()).FileCache);
    this._fileCache = fileNotifier;
    this._analyzer = analyzer;
  }

  _createClass(ServerLanguageService, [{
    key: 'getDiagnostics',
    value: _asyncToGenerator(function* (fileVersion) {
      var filePath = fileVersion.filePath;
      var buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      return yield this._analyzer.getDiagnostics(filePath, buffer);
    })
  }, {
    key: 'observeDiagnostics',
    value: function observeDiagnostics() {
      return this._analyzer.observeDiagnostics().publish();
    }
  }, {
    key: 'getAutocompleteSuggestions',
    value: _asyncToGenerator(function* (fileVersion, position, activatedManually) {
      var filePath = fileVersion.filePath;
      var buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      return yield this._analyzer.getAutocompleteSuggestions(filePath, buffer, position, activatedManually);
    })
  }, {
    key: 'getDefinition',
    value: _asyncToGenerator(function* (fileVersion, position) {
      var filePath = fileVersion.filePath;
      var buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      return yield this._analyzer.getDefinition(filePath, buffer, position);
    })
  }, {
    key: 'getDefinitionById',
    value: function getDefinitionById(file, id) {
      return this._analyzer.getDefinitionById(file, id);
    }
  }, {
    key: 'findReferences',
    value: _asyncToGenerator(function* (fileVersion, position) {
      var filePath = fileVersion.filePath;
      var buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      return yield this._analyzer.findReferences(filePath, buffer, position);
    })
  }, {
    key: 'getCoverage',
    value: function getCoverage(filePath) {
      return this._analyzer.getCoverage(filePath);
    }
  }, {
    key: 'getOutline',
    value: _asyncToGenerator(function* (fileVersion) {
      var filePath = fileVersion.filePath;
      var buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      return yield this._analyzer.getOutline(filePath, buffer);
    })
  }, {
    key: 'typeHint',
    value: _asyncToGenerator(function* (fileVersion, position) {
      var filePath = fileVersion.filePath;
      var buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      return yield this._analyzer.typeHint(filePath, buffer, position);
    })
  }, {
    key: 'highlight',
    value: _asyncToGenerator(function* (fileVersion, position) {
      var filePath = fileVersion.filePath;
      var buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      return yield this._analyzer.highlight(filePath, buffer, position);
    })
  }, {
    key: 'formatSource',
    value: _asyncToGenerator(function* (fileVersion, range) {
      var filePath = fileVersion.filePath;
      var buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      return yield this._analyzer.formatSource(filePath, buffer, range);
    })
  }, {
    key: 'getEvaluationExpression',
    value: _asyncToGenerator(function* (fileVersion, position) {
      var filePath = fileVersion.filePath;
      var buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      return yield this._analyzer.getEvaluationExpression(filePath, buffer, position);
    })
  }, {
    key: 'getProjectRoot',
    value: function getProjectRoot(fileUri) {
      return this._analyzer.getProjectRoot(fileUri);
    }
  }, {
    key: 'isFileInProject',
    value: _asyncToGenerator(function* (fileUri) {
      return this._analyzer.isFileInProject(fileUri);
    })
  }, {
    key: 'dispose',
    value: function dispose() {
      this._analyzer.dispose();
    }
  }]);

  return ServerLanguageService;
})();

exports.ServerLanguageService = ServerLanguageService;