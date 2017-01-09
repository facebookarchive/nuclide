'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DefinitionProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideOpenFiles;

function _load_nuclideOpenFiles() {
  return _nuclideOpenFiles = require('../../nuclide-open-files');
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
 */

class DefinitionProvider {

  constructor(name, grammars, priority, definitionEventName, definitionByIdEventName, connectionToLanguageService) {
    this.name = name;
    this.priority = priority;
    this.grammarScopes = grammars;
    this._definitionEventName = definitionEventName;
    this._definitionByIdEventName = definitionByIdEventName;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(name, grammars, config, connectionToLanguageService) {
    return atom.packages.serviceHub.provide('nuclide-definition-provider', config.version, new DefinitionProvider(name, grammars, config.priority, config.definitionEventName, config.definitionByIdEventName, connectionToLanguageService));
  }

  getDefinition(editor, position) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(_this._definitionEventName, (0, _asyncToGenerator.default)(function* () {
        const fileVersion = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);
        const languageService = _this._connectionToLanguageService.getForUri(editor.getPath());
        if (languageService == null || fileVersion == null) {
          return null;
        }
        return (yield languageService).getDefinition(fileVersion, position);
      }));
    })();
  }

  getDefinitionById(filePath, id) {
    var _this2 = this;

    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(this._definitionByIdEventName, (0, _asyncToGenerator.default)(function* () {
      const languageService = _this2._connectionToLanguageService.getForUri(filePath);
      if (languageService == null) {
        return null;
      }

      return (yield languageService).getDefinitionById(filePath, id);
    }));
  }
}
exports.DefinitionProvider = DefinitionProvider;