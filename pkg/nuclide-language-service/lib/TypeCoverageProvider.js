'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.TypeCoverageProvider = undefined;var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));var _nuclideRemoteConnection;















function _load_nuclideRemoteConnection() {return _nuclideRemoteConnection = require('../../nuclide-remote-connection');}var _nuclideAnalytics;
function _load_nuclideAnalytics() {return _nuclideAnalytics = require('../../nuclide-analytics');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}








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
 */class TypeCoverageProvider {constructor(
  name,
  selector,
  priority,
  analyticsEventName,
  icon,
  connectionToLanguageService)
  {var _this = this;
    this.displayName = name;
    this.priority = priority;
    this.grammarScopes = selector;
    this.icon = icon;
    this._analyticsEventName = analyticsEventName;
    this._connectionToLanguageService = connectionToLanguageService;
    this._onToggleValue = false;
    this._connectionToLanguageService.
    observeValues().
    subscribe((() => {var _ref = (0, _asyncToGenerator.default)(function* (languageService) {
        const ls = yield languageService;
        ls.onToggleCoverage(_this._onToggleValue);
      });return function (_x) {return _ref.apply(this, arguments);};})());
  }

  static register(
  name,
  selector,
  config,
  connectionToLanguageService)
  {
    return atom.packages.serviceHub.provide(
    'nuclide-type-coverage',
    config.version,
    new TypeCoverageProvider(
    name,
    selector,
    config.priority,
    config.analyticsEventName,
    config.icon,
    connectionToLanguageService));


  }

  getCoverage(path) {var _this2 = this;return (0, _asyncToGenerator.default)(function* () {
      return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(_this2._analyticsEventName, (0, _asyncToGenerator.default)(function* () {
        const languageService = _this2._connectionToLanguageService.getForUri(path);
        if (languageService == null) {
          return null;
        }

        return (yield languageService).getCoverage(path);
      }));})();
  }

  onToggle(on) {var _this3 = this;return (0, _asyncToGenerator.default)(function* () {
      _this3._onToggleValue = on;
      yield Promise.all(
      Array.from(_this3._connectionToLanguageService.values()).map((() => {var _ref3 = (0, _asyncToGenerator.default)(
        function* (languageService) {
          const ls = yield languageService;
          ls.onToggleCoverage(on);
        });return function (_x2) {return _ref3.apply(this, arguments);};})()));})();


  }}exports.TypeCoverageProvider = TypeCoverageProvider;