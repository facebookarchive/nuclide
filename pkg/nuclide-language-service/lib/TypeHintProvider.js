'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeHintProvider = undefined;

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

  async typeHint(editor, position) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(this._analyticsEventName, async () => {
      const fileVersion = await (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);
      const languageService = this._connectionToLanguageService.getForUri(editor.getPath());
      if (languageService == null || fileVersion == null) {
        return null;
      }

      return (await languageService).typeHint(fileVersion, position);
    });
  }
}
exports.TypeHintProvider = TypeHintProvider; /**
                                              * Copyright (c) 2015-present, Facebook, Inc.
                                              * All rights reserved.
                                              *
                                              * This source code is licensed under the license found in the LICENSE file in
                                              * the root directory of this source tree.
                                              *
                                              *  strict-local
                                              * @format
                                              */