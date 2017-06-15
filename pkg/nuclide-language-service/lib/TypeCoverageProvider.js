'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeCoverageProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Provides Diagnostics for un-typed regions of Hack code.
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

class TypeCoverageProvider {

  constructor(name, selector, priority, analyticsEventName, icon, connectionToLanguageService) {
    this.displayName = name;
    this.priority = priority;
    this.grammarScopes = selector;
    this.icon = icon;
    this._analyticsEventName = analyticsEventName;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(name, selector, config, connectionToLanguageService) {
    return atom.packages.serviceHub.provide('nuclide-type-coverage', config.version, new TypeCoverageProvider(name, selector, config.priority, config.analyticsEventName, config.icon, connectionToLanguageService));
  }

  getCoverage(path) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(_this._analyticsEventName, (0, _asyncToGenerator.default)(function* () {
        const languageService = _this._connectionToLanguageService.getForUri(path);
        if (languageService == null) {
          return null;
        }

        return (yield languageService).getCoverage(path);
      }));
    })();
  }
}
exports.TypeCoverageProvider = TypeCoverageProvider;