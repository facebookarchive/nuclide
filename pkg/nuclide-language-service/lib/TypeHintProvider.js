'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeHintProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideOpenFiles;

function _load_nuclideOpenFiles() {
  return _nuclideOpenFiles = require('../../nuclide-open-files');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class TypeHintProvider {

  constructor(name, selector, priority, analyticsEventName, connectionToLanguageService) {
    this.providerName = name;
    this.selector = selector;
    this.inclusionPriority = priority;
    this._analyticsEventName = analyticsEventName;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(name, selector, config, connectionToLanguageService) {
    return atom.packages.serviceHub.provide('nuclide-type-hint.provider', config.version, new TypeHintProvider(name, selector, config.priority, config.analyticsEventName, connectionToLanguageService));
  }

  typeHint(editor, position) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(_this._analyticsEventName, (0, _asyncToGenerator.default)(function* () {
        const fileVersion = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);
        const languageService = _this._connectionToLanguageService.getForUri(editor.getPath());
        if (languageService == null || fileVersion == null) {
          return null;
        }

        return (yield languageService).typeHint(fileVersion, position);
      }));
    })();
  }
}
exports.TypeHintProvider = TypeHintProvider; /**
                                              * Copyright (c) 2015-present, Facebook, Inc.
                                              * All rights reserved.
                                              *
                                              * This source code is licensed under the license found in the LICENSE file in
                                              * the root directory of this source tree.
                                              *
                                              * 
                                              * @format
                                              */