'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.default = createAutocompleteProvider;

var _promise;

function _load_promise() {
  return _promise = require('../../../modules/nuclide-commons/promise');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Autocomplete is extremely critical to the user experience!
 * Don't tolerate anything longer than three seconds; just fail fast and
 * let the fallback providers provide something at least.
 */
const AUTOCOMPLETE_TIMEOUT = 3000;

/**
 * Receives a provider and returns a proxy provider that applies time limit to
 * `getSuggestions` calls and stop unhandled exceptions on to cascade.
 */
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

function createAutocompleteProvider(provider) {
  // The `eventNames` could be computed in deep functions, but we don't want
  // to change the logger if a provider decides to changes its name.
  const eventNames = getAnalytics(provider);
  const proxy = new Proxy(provider, {
    get: (target, prop, receiver) => {
      switch (prop) {
        case 'getSuggestions':
          return getSuggestions.bind(null, target, eventNames);
        case 'onDidInsertSuggestion':
          return onDidInsertSuggestion.bind(null, target, eventNames);
        default:
          return Reflect.get(target, prop, receiver);
      }
    }
  });

  // It is safe to cast it to any since AutocompleteProvider is a super type of
  // atom$AutocompleteProvider
  return proxy;
}

function getSuggestions(provider, eventNames, request) {
  const logObject = {};

  return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(eventNames.onGetSuggestions, (0, _asyncToGenerator.default)(function* () {
    let result = null;
    if (request.activatedManually) {
      try {
        result = yield provider.getSuggestions(request);
      } catch (e) {
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(eventNames.errorOnGetSuggestions);
      }
    } else {
      try {
        result = yield (0, (_promise || _load_promise()).timeoutPromise)(Promise.resolve(provider.getSuggestions(request)), AUTOCOMPLETE_TIMEOUT);
      } catch (e) {
        if (e instanceof (_promise || _load_promise()).TimedOutError) {
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(eventNames.timeoutOnGetSuggestions);
        } else {
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(eventNames.errorOnGetSuggestions);
        }
      }
    }
    logObject.isEmpty = result == null || result.length === 0;
    return result;
  }), logObject);
}

function onDidInsertSuggestion(provider, eventNames, insertedSuggestionArgument) {
  trackOnDidInsertSuggestion(eventNames.onDidInsertSuggestion, provider.analytics.shouldLogInsertedSuggestion, insertedSuggestionArgument);
  if (provider.onDidInsertSuggestion) {
    provider.onDidInsertSuggestion(insertedSuggestionArgument);
  }
}

function trackOnDidInsertSuggestion(eventName, shouldLogInsertedSuggestion, insertedSuggestionArgument) {
  if (!shouldLogInsertedSuggestion) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(eventName);
    return;
  }

  const { suggestion } = insertedSuggestionArgument;
  const suggestionText = suggestion.text != null ? suggestion.text : suggestion.snippet;
  (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(eventName, {
    replacementPrefix: suggestion.replacementPrefix,
    suggestionText
  });
}

function getAnalytics(provider) {
  const eventNameFor = eventType => `${provider.analytics.eventName}:autocomplete:${eventType}`;

  return {
    errorOnGetSuggestions: eventNameFor('error-on-get-suggestions'),
    onDidInsertSuggestion: eventNameFor('on-did-insert-suggestion'),
    onGetSuggestions: eventNameFor('on-get-suggestions'),
    timeoutOnGetSuggestions: eventNameFor('timeout-on-get-suggestions')
  };
}