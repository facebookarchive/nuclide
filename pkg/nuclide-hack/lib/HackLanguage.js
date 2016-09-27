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

var getHackLanguageForUri = _asyncToGenerator(function* (uri) {
  return yield connectionToHackLanguage.getForUri(uri);
});

exports.getHackLanguageForUri = getHackLanguageForUri;
exports.clearHackLanguageCache = clearHackLanguageCache;

var getHackServiceByNuclideUri = _asyncToGenerator(function* (fileUri) {
  var language = yield getHackLanguageForUri(fileUri);
  if (language == null) {
    return null;
  }
  return language.getLanguageService();
});

exports.getHackServiceByNuclideUri = getHackServiceByNuclideUri;

var isFileInHackProject = _asyncToGenerator(function* (fileUri) {
  var language = yield getHackLanguageForUri(fileUri);
  if (language == null) {
    return false;
  }
  return yield language.isFileInHackProject(fileUri);
}

/**
 * @return HackService for the specified directory if it is part of a Hack project.
 */
);

exports.isFileInHackProject = isFileInHackProject;

var getHackServiceForProject = _asyncToGenerator(function* (directory) {
  var directoryPath = directory.getPath();
  return (yield isFileInHackProject(directoryPath)) ? (yield getHackServiceByNuclideUri(directoryPath)) : null;
});

exports.getHackServiceForProject = getHackServiceForProject;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var _config2;

function _config() {
  return _config2 = require('./config');
}

var _nuclideOpenFiles2;

function _nuclideOpenFiles() {
  return _nuclideOpenFiles2 = require('../../nuclide-open-files');
}

/**
 * Serves language requests from HackService.
 * Note that all line/column values are 1 based.
 */

var HackLanguage = (function () {

  /**
   * `basePath` should be the directory where the .hhconfig file is located.
   */

  function HackLanguage(hackService) {
    _classCallCheck(this, HackLanguage);

    this._hackService = hackService;
  }

  _createClass(HackLanguage, [{
    key: 'dispose',
    value: function dispose() {}
  }, {
    key: 'getLanguageService',
    value: function getLanguageService() {
      return this._hackService;
    }
  }, {
    key: 'getProjectRoot',
    value: function getProjectRoot(filePath) {
      return this._hackService.getProjectRoot(filePath);
    }
  }, {
    key: 'isFileInHackProject',
    value: function isFileInHackProject(fileUri) {
      return this._hackService.isFileInHackProject(fileUri);
    }
  }, {
    key: 'getAutocompleteSuggestions',
    value: function getAutocompleteSuggestions(fileVersion, position, activatedManually) {
      return this._hackService.getAutocompleteSuggestions(fileVersion, position, activatedManually);
    }
  }, {
    key: 'formatSource',
    value: _asyncToGenerator(function* (fileVersion, range) {
      return this._hackService.formatSource(fileVersion, range);
    })
  }, {
    key: 'highlight',
    value: _asyncToGenerator(function* (fileVersion, position) {
      return this._hackService.highlight(fileVersion, position);
    })
  }, {
    key: 'getDiagnostics',
    value: _asyncToGenerator(function* (fileVersion) {
      return this._hackService.getDiagnostics(fileVersion);
    })
  }, {
    key: 'getCoverage',
    value: _asyncToGenerator(function* (filePath) {
      return yield this._hackService.getCoverage(filePath);
    })
  }, {
    key: 'getOutline',
    value: function getOutline(fileVersion) {
      return this._hackService.getOutline(fileVersion);
    }
  }, {
    key: 'getDefinition',
    value: function getDefinition(fileVersion, position) {
      return this._hackService.getDefinition(fileVersion, position);
    }
  }, {
    key: 'getDefinitionById',
    value: function getDefinitionById(filePath, id) {
      return this._hackService.getDefinitionById(filePath, id);
    }
  }, {
    key: 'typeHint',
    value: function typeHint(fileVersion, position) {
      return this._hackService.typeHint(fileVersion, position);
    }
  }, {
    key: 'findReferences',
    value: function findReferences(fileVersion, position) {
      return this._hackService.findReferences(fileVersion, position);
    }
  }]);

  return HackLanguage;
})();

exports.HackLanguage = HackLanguage;

var HACK_SERVICE_NAME = 'HackService';

var connectionToHackLanguage = new (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).ConnectionCache(_asyncToGenerator(function* (connection) {
  var hackService = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getServiceByConnection)(HACK_SERVICE_NAME, connection);
  var config = (0, (_config2 || _config()).getConfig)();
  var useIdeConnection = config.useIdeConnection;
  // TODO:     || (await passesGK('nuclide_hack_use_persistent_connection'));
  var fileNotifier = yield (0, (_nuclideOpenFiles2 || _nuclideOpenFiles()).getNotifierByConnection)(connection);
  var languageService = yield hackService.initialize(config.hhClientPath, useIdeConnection, config.logLevel, fileNotifier);

  return new HackLanguage(languageService);
}));

function clearHackLanguageCache() {
  connectionToHackLanguage.dispose();
}