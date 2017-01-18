"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require("async-to-generator"));

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

class AutocompleteCacher {

  constructor(getSuggestions, config) {
    this._getSuggestions = getSuggestions;
    this._config = config;
  }

  getSuggestions(request) {
    const session = this._session;
    if (session != null && this._canFilterResults(session, request)) {
      const result = this._filterSuggestions(request, session.firstResult);
      this._session = {
        firstResult: session.firstResult,
        lastRequest: request
      };
      return result;
    } else {
      const result = this._getSuggestions(request);
      this._session = {
        firstResult: result,
        lastRequest: request
      };
      return result;
    }
  }

  _filterSuggestions(request, firstResult) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this._config.updateResults(request, (yield firstResult));
    })();
  }

  _canFilterResults(session, currentRequest) {
    const { lastRequest } = session;
    const shouldFilter = this._config.shouldFilter != null ? this._config.shouldFilter : defaultShouldFilter;
    return lastRequest.bufferPosition.row === currentRequest.bufferPosition.row && lastRequest.bufferPosition.column + 1 === currentRequest.bufferPosition.column && shouldFilter(lastRequest, currentRequest);
  }
}

exports.default = AutocompleteCacher;
const IDENTIFIER_CHAR_REGEX = /[a-zA-Z_]/;

function defaultShouldFilter(lastRequest, currentRequest) {
  return currentRequest.prefix.startsWith(lastRequest.prefix) && IDENTIFIER_CHAR_REGEX.test(currentRequest.prefix.charAt(currentRequest.prefix.length - 1));
}
module.exports = exports["default"];