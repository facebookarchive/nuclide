'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeCoverageProvider = undefined;

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

// Provides Diagnostics for un-typed regions of Hack code.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
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
    this._onToggleValue = false;
    this._connectionToLanguageService.observeValues().subscribe(async languageService => {
      const ls = await languageService;
      ls.onToggleCoverage(this._onToggleValue);
    });
  }

  static register(name, selector, config, connectionToLanguageService) {
    return atom.packages.serviceHub.provide('nuclide-type-coverage', config.version, new TypeCoverageProvider(name, selector, config.priority, config.analyticsEventName, config.icon, connectionToLanguageService));
  }

  async getCoverage(path) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(this._analyticsEventName, async () => {
      const languageService = this._connectionToLanguageService.getForUri(path);
      if (languageService == null) {
        return null;
      }

      return (await languageService).getCoverage(path);
    });
  }

  async onToggle(on) {
    this._onToggleValue = on;
    await Promise.all(Array.from(this._connectionToLanguageService.values()).map(async languageService => {
      const ls = await languageService;
      ls.onToggleCoverage(on);
    }));
  }
}
exports.TypeCoverageProvider = TypeCoverageProvider;