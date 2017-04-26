'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EvaluationExpressionProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.getEvaluationExpressionFromRegexp = getEvaluationExpressionFromRegexp;

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideOpenFiles;

function _load_nuclideOpenFiles() {
  return _nuclideOpenFiles = require('../../nuclide-open-files');
}

var _range;

function _load_range() {
  return _range = require('../../commons-atom/range');
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

class EvaluationExpressionProvider {

  constructor(name, selector, analyticsEventName, regexp, connectionToLanguageService) {
    this.name = name;
    this.selector = selector;
    this._analyticsEventName = analyticsEventName;
    this._regexp = regexp;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(name, selector, config, connectionToLanguageService) {
    return atom.packages.serviceHub.provide('nuclide-evaluation-expression.provider', config.version, new EvaluationExpressionProvider(name, selector, config.analyticsEventName, config.regexp == null ? null : config.regexp, // turn string|void into string|null
    connectionToLanguageService));
  }

  getEvaluationExpression(editor, position) {
    var _this = this;

    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(this._analyticsEventName, (0, _asyncToGenerator.default)(function* () {
      if (_this._regexp != null) {
        return getEvaluationExpressionFromRegexp(editor, position, _this._regexp);
      }

      const fileVersion = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);
      const languageService = _this._connectionToLanguageService.getForUri(editor.getPath());
      if (languageService == null || fileVersion == null) {
        return null;
      }

      return (yield languageService).getEvaluationExpression(fileVersion, position);
    }));
  }
}

exports.EvaluationExpressionProvider = EvaluationExpressionProvider;
function getEvaluationExpressionFromRegexp(editor, position, regexp) {
  const extractedIdentifier = (0, (_range || _load_range()).wordAtPosition)(editor, position, regexp);
  if (extractedIdentifier == null) {
    return null;
  }
  const { range, wordMatch } = extractedIdentifier;
  const [expression] = wordMatch;
  return expression == null ? null : { expression, range };
}