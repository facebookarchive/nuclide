"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createAutocompleteProvider;

function _performanceNow() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/performanceNow"));

  _performanceNow = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../../modules/nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
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
const E2E_SAMPLE_RATE = 10;
const ON_GET_SUGGESTIONS_SAMPLE_RATE = 10;
const durationBySuggestion = new WeakMap();
/**
 * Receives a provider and returns a proxy provider that applies time limit to
 * `getSuggestions` calls and stop unhandled exceptions on to cascade.
 */

function createAutocompleteProvider(provider, getTimeout) {
  // The `eventNames` could be computed in deep functions, but we don't want
  // to change the logger if a provider decides to changes its name.
  const eventNames = getAnalytics(provider);
  const proxy = new Proxy(provider, {
    get: (target, prop, receiver) => {
      switch (prop) {
        case 'getSuggestions':
          return getSuggestions.bind(null, target, eventNames, getTimeout);

        case 'onDidInsertSuggestion':
          return onDidInsertSuggestion.bind(null, target, eventNames);

        case 'getSuggestionDetailsOnSelect':
          if (target.getSuggestionDetailsOnSelect != null) {
            return getSuggestionDetailsOnSelect.bind(null, target, eventNames);
          } else {
            return () => Promise.resolve(null);
          }

        default:
          return Reflect.get(target, prop, receiver);
      }
    }
  }); // It is safe to cast it to any since AutocompleteProvider is a super type of
  // atom$AutocompleteProvider

  return proxy;
}

const requestTrackers = new WeakMap();

function _getRequestTracker(request, provider, timeout) {
  // Kind of hacky.. but the bufferPosition is a unique object per request.
  const key = request.bufferPosition;
  const tracker = requestTrackers.get(key);

  if (tracker != null) {
    return tracker;
  }

  const startTime = (0, _performanceNow().default)();
  const newTracker = {
    timeoutPromise: (0, _promise().sleep)(timeout).then(() => {
      if (newTracker.pendingProviders) {
        (0, _nuclideAnalytics().trackSampled)('e2e-autocomplete', E2E_SAMPLE_RATE, {
          path: request.editor.getPath(),
          duration: timeout,
          slowestProvider: 'timeout',
          pendingProviders: newTracker.pendingProviders
        });
        throw new (_promise().TimedOutError)(timeout);
      }

      const {
        slowestProvider,
        slowestProviderTime
      } = newTracker;
      (0, _nuclideAnalytics().trackSampled)('e2e-autocomplete', E2E_SAMPLE_RATE, {
        path: request.editor.getPath(),
        duration: Math.round(slowestProviderTime - startTime),
        slowestProvider: slowestProvider.analytics.eventName
      });
    }),
    slowestProvider: provider,
    slowestProviderTime: startTime,
    pendingProviders: 0
  };
  requestTrackers.set(key, newTracker);
  return newTracker;
}

function getSuggestions(provider, eventNames, getTimeout, request) {
  const logObject = {};
  const timeout = getTimeout();

  const requestTracker = _getRequestTracker(request, provider, timeout);

  requestTracker.pendingProviders++;
  return (0, _nuclideAnalytics().trackTimingSampled)(eventNames.onGetSuggestions, async () => {
    let result = null;
    const startTime = (0, _performanceNow().default)();

    if (request.activatedManually) {
      try {
        result = await provider.getSuggestions(request);
      } catch (e) {
        (0, _nuclideAnalytics().track)(eventNames.errorOnGetSuggestions);
      }
    } else {
      try {
        result = await Promise.race([Promise.resolve(provider.getSuggestions(request)), requestTracker.timeoutPromise]);
      } catch (e) {
        if (e instanceof _promise().TimedOutError) {
          (0, _nuclideAnalytics().track)(eventNames.timeoutOnGetSuggestions, {
            timeout
          });
        } else {
          (0, _nuclideAnalytics().track)(eventNames.errorOnGetSuggestions, {
            timeout
          });
        }
      }
    }

    logObject.isEmpty = result == null || result.length === 0;
    const endTime = (0, _performanceNow().default)();
    requestTracker.slowestProvider = provider;
    requestTracker.slowestProviderTime = endTime;
    requestTracker.pendingProviders--;

    if (result) {
      result.forEach(suggestion => durationBySuggestion.set(suggestion, endTime - startTime));
    }

    return result;
  }, ON_GET_SUGGESTIONS_SAMPLE_RATE, logObject);
}

function getSuggestionDetailsOnSelect(provider, eventNames, suggestion) {
  const logObject = {};
  return (0, _nuclideAnalytics().trackTiming)(eventNames.onGetSuggestionDetailsOnSelect, async () => {
    let result = null;

    if (provider.getSuggestionDetailsOnSelect != null) {
      try {
        result = await provider.getSuggestionDetailsOnSelect(suggestion);
      } catch (e) {
        (0, _nuclideAnalytics().track)(eventNames.errorOnGetSuggestionDetailsOnSelect);
      }
    }

    logObject.isEmpty = result == null;
    return result;
  }, logObject);
}

function onDidInsertSuggestion(provider, eventNames, insertedSuggestionArgument) {
  trackOnDidInsertSuggestion(eventNames.onDidInsertSuggestion, provider.analytics.shouldLogInsertedSuggestion, insertedSuggestionArgument);

  if (provider.onDidInsertSuggestion) {
    provider.onDidInsertSuggestion(insertedSuggestionArgument);
  }
}

function trackOnDidInsertSuggestion(eventName, shouldLogInsertedSuggestion, insertedSuggestionArgument) {
  const duration = durationBySuggestion.get(insertedSuggestionArgument.suggestion);

  if (!shouldLogInsertedSuggestion) {
    (0, _nuclideAnalytics().track)(eventName, {
      duration
    });
    return;
  }

  const {
    suggestion
  } = insertedSuggestionArgument;
  const suggestionText = suggestion.text != null ? suggestion.text : suggestion.snippet;
  (0, _nuclideAnalytics().track)(eventName, {
    duration,
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
    timeoutOnGetSuggestions: eventNameFor('timeout-on-get-suggestions'),
    errorOnGetSuggestionDetailsOnSelect: eventNameFor('error-on-get-suggestion-details-on-select'),
    onGetSuggestionDetailsOnSelect: eventNameFor('on-get-suggestion-details-on-select')
  };
}