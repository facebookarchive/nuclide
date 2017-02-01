"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require("async-to-generator"));

let getNewFirstResult = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (firstResultPromise, resultFromLanguageService) {
    const firstResult = yield firstResultPromise;
    if (firstResult != null) {
      return firstResult;
    } else {
      return resultFromLanguageService;
    }
  });

  return function getNewFirstResult(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

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

  constructor(
  // If getSuggestions returns null or undefined, it means that we should not filter that result
  // to serve later queries, even if shouldFilter returns true. If there are truly no results, it
  getSuggestions, config) {
    this._getSuggestions = getSuggestions;
    this._config = config;
  }

  getSuggestions(request) {
    const session = this._session;
    if (session != null && this._canMaybeFilterResults(session, request)) {
      // We need to send this request speculatively because if firstResult resolves to `null`, we'll
      // need this result. If we wait for firstResult to resolve before sending it, satisfying this
      // request could take as much as two round trips to the server. We could avoid this in some
      // cases by checking if firstResult has already been resolved. If it has already resolved to a
      // non-null value, we can skip this request.
      const resultFromLanguageService = this._getSuggestions(request);
      const result = this._filterSuggestionsIfPossible(request, session.firstResult, resultFromLanguageService);
      this._session = {
        firstResult: getNewFirstResult(session.firstResult, resultFromLanguageService),
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

  _filterSuggestionsIfPossible(request, firstResultPromise, resultFromLanguageService) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const firstResult = yield firstResultPromise;
      if (firstResult != null) {
        return _this._config.updateResults(request, firstResult);
      } else {
        return resultFromLanguageService;
      }
    })();
  }

  // This doesn't guarantee we can filter results -- if the previous result turns out to be null, we
  // may still have to use the results from the language service.
  _canMaybeFilterResults(session, currentRequest) {
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