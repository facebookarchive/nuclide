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

class DefinitionProvider {

  constructor(name, grammars, priority, definitionEventName, connectionToLanguageService) {
    this.name = name;
    this.priority = priority;
    this.grammarScopes = grammars;
    this._definitionEventName = definitionEventName;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(name, grammars, config, connectionToLanguageService) {
    return atom.packages.serviceHub.provide('definitions', config.version, new DefinitionProvider(name, grammars, config.priority, config.definitionEventName, connectionToLanguageService));
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
}
exports.DefinitionProvider = DefinitionProvider; /**
                                                  * Copyright (c) 2015-present, Facebook, Inc.
                                                  * All rights reserved.
                                                  *
                                                  * This source code is licensed under the license found in the LICENSE file in
                                                  * the root directory of this source tree.
                                                  *
                                                  * 
                                                  * @format
                                                  */