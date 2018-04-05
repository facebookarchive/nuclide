'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getNewFirstResult = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (firstResultPromise, resultFromLanguageService) {
    const firstResult = yield firstResultPromise;
    if (firstResult != null) {
      return firstResult;
    } else {
      return resultFromLanguageService;
    }
  });

  return function getNewFirstResult(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
})();

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../commons-node/passesGK'));
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
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
 * @format
 */

class AutocompleteCacher {

  constructor(
  // If getSuggestions returns null or undefined, it means that we should not filter that result
  // to serve later queries, even if shouldFilter returns true. If there are truly no results, it
  getSuggestions, config) {
    this._getSuggestions = (() => {
      var _ref = (0, _asyncToGenerator.default)(function* (request) {
        const results = yield getSuggestions(request);
        return config.updateFirstResults == null || results == null ? results : config.updateFirstResults(request, results);
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    })();
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
      const state = session.firstResultPromise.getState();
      if (state.kind === 'fulfilled' && state.value != null) {
        // Maybe an earlier request had already resolved to not-null so we can use
        // it right now, synchronously?
        const firstResult = state.value;
        const result = this._config.updateResults(request, firstResult);
        if (result != null) {
          this._session = Object.assign({}, this._session, { lastRequest: request });
          return Promise.resolve(result);
        }
      }

      // If it hasn't already resolved, or if it had resolved to not-null,
      // or if the updateResults function decided synchronously that it wasn't
      // able to do anything, then in all cases we'll send an additional request
      // speculatively right now (to reduce overall latency) and defer the
      // decision about whether to use the existing response or
      // the speculative one.
      const resultFromLanguageService = this._getSuggestions(request);
      const result = this._filterSuggestionsIfPossible(request, session.firstResultPromise.getPromise(), resultFromLanguageService);
      this._session = {
        firstResultPromise: new (_promise || _load_promise()).PromiseWithState(getNewFirstResult(session.firstResultPromise.getPromise(), resultFromLanguageService)),
        lastRequest: request
      };
      return result;
    } else {
      const result = this._getSuggestions(request);
      this._session = {
        firstResultPromise: new (_promise || _load_promise()).PromiseWithState(result),
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

exports.default = AutocompleteCacher;


const IDENTIFIER_REGEX = /^[a-zA-Z_]+$/;

function defaultShouldFilter(lastRequest, currentRequest, charsSinceLastRequest) {
  // This function's goal is to check whether the currentRequest represents
  // additional typing to do further filtering, or whether it represents an
  // entirely new autocomplete request.
  // It does this by checking the request.prefix that AutocompletePlus had
  // computed for the previous request vs the currentRequest. How
  // AutocompletePlus computes this prefix is via a 'word regex' to see what
  // word the caret is on, and take the portion of it to the left of the caret.
  // Its word regex is roughly [a-zA-Z0-9_-]+. If the currentRequest.prefix
  // is strictly longer than the lastRequest.prefix, by the right number
  // of characters, then we should continue to do further filtering.
  // NOTE: the prefix computed by AutocompletePlus is not necessarily the
  // replacementPrefix that will be used if the user accepts a suggestion.
  // And it's not necessarily appropriate for the language (e.g. flow
  // disallows hyphens, and php allows $). But that doesn't matter. We're merely
  // using it as a convenient consistent source of a good enough word regex.
  // We do further filtering to only accept [a-zA-Z_], so no numerals or
  // hyphens. This makes us very conservative. When we're too conservative
  // (e.g. always failing to cache for identifiers that have numerals or
  // hyphens), the only bad effect is more autocomplete requests to the
  // language server than is strictly necessary.
  return currentRequest.prefix.startsWith(lastRequest.prefix) && currentRequest.prefix.length === lastRequest.prefix.length + charsSinceLastRequest && IDENTIFIER_REGEX.test(currentRequest.prefix);
}