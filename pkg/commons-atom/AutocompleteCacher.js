'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../commons-node/passesGK'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class AutocompleteCacher {

  constructor(
  // If getSuggestions returns null or undefined, it means that we should not filter that result
  // to serve later queries, even if shouldFilter returns true. If there are truly no results, it
  getSuggestions, config) {
    this._getSuggestions = getSuggestions;
    this._config = config;
    this._setEnabled();
  }

  _setEnabled() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const gk = _this._config.gatekeeper;
      if (gk == null) {
        _this._enabled = true;
      } else {
        _this._enabled = false;
        _this._enabled = yield (0, (_passesGK || _load_passesGK()).default)(gk);
      }
    })();
  }

  getSuggestions(request) {
    if (!this._enabled) {
      return this._getSuggestions(request);
    }
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
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const firstResult = yield firstResultPromise;
      if (firstResult != null) {
        const updated = _this2._config.updateResults(request, firstResult);
        if (updated != null) {
          return updated;
        }
      }
      return resultFromLanguageService;
    })();
  }

  // This doesn't guarantee we can filter results -- if the previous result turns out to be null, we
  // may still have to use the results from the language service.
  _canMaybeFilterResults(session, currentRequest) {
    const { lastRequest } = session;
    const shouldFilter = this._config.shouldFilter != null ? this._config.shouldFilter : defaultShouldFilter;
    const charsSinceLastRequest = currentRequest.bufferPosition.column - lastRequest.bufferPosition.column;
    return lastRequest.bufferPosition.row === currentRequest.bufferPosition.row && charsSinceLastRequest > 0 && shouldFilter(lastRequest, currentRequest, charsSinceLastRequest);
  }
}

exports.default = AutocompleteCacher; /**
                                       * Copyright (c) 2015-present, Facebook, Inc.
                                       * All rights reserved.
                                       *
                                       * This source code is licensed under the license found in the LICENSE file in
                                       * the root directory of this source tree.
                                       *
                                       * 
                                       */

const IDENTIFIER_REGEX = /^[a-zA-Z_]+$/;

function defaultShouldFilter(lastRequest, currentRequest, charsSinceLastRequest) {
  return currentRequest.prefix.startsWith(lastRequest.prefix) && currentRequest.prefix.length === lastRequest.prefix.length + charsSinceLastRequest && IDENTIFIER_REGEX.test(currentRequest.prefix);
}