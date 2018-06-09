/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {
  AutocompleteProvider,
  AutocompleteAnalyticEventNames,
  AtomSuggestionInsertedRequest,
} from './types';

import performanceNow from 'nuclide-commons/performanceNow';
import {sleep, TimedOutError} from 'nuclide-commons/promise';
import {
  track,
  trackSampled,
  trackTiming,
  trackTimingSampled,
} from '../../nuclide-analytics';

/**
 * Autocomplete is extremely critical to the user experience!
 * Don't tolerate anything longer than AUTOCOMPLETE_TIMEOUT seconds; just fail
 * fast and let the fallback providers provide something at least.
 *
 * NOTE: We keep a higher time limit for only testing envirnoment since the
 * autocomplete check happens right after you open the file and providers don't
 * have enough time to initialize.
 */
const AUTOCOMPLETE_TIMEOUT = atom.inSpecMode() ? 3000 : 500;
const E2E_SAMPLE_RATE = 10;
const ON_GET_SUGGESTIONS_SAMPLE_RATE = 10;

const durationBySuggestion = new WeakMap();

/**
 * Receives a provider and returns a proxy provider that applies time limit to
 * `getSuggestions` calls and stop unhandled exceptions on to cascade.
 */
export default function createAutocompleteProvider<
  Suggestion: atom$AutocompleteSuggestion,
>(provider: AutocompleteProvider<Suggestion>): atom$AutocompleteProvider {
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
        case 'getSuggestionDetailsOnSelect':
          if (target.getSuggestionDetailsOnSelect != null) {
            return getSuggestionDetailsOnSelect.bind(null, target, eventNames);
          } else {
            return () => Promise.resolve(null);
          }
        default:
          return Reflect.get(target, prop, receiver);
      }
    },
  });

  // It is safe to cast it to any since AutocompleteProvider is a super type of
  // atom$AutocompleteProvider
  return (proxy: any);
}

type RequestTracker = {|
  // Share a single "timeout" promise among all fetches for the same request.
  // The timeout doubles as the trigger to log the slowest provider time.
  timeoutPromise: Promise<void>,
  slowestProvider: AutocompleteProvider<any>,
  slowestProviderTime: number,
  pendingProviders: number,
|};
const requestTrackers: WeakMap<atom$Point, RequestTracker> = new WeakMap();

function _getRequestTracker(
  request: atom$AutocompleteRequest,
  provider: AutocompleteProvider<any>,
): RequestTracker {
  // Kind of hacky.. but the bufferPosition is a unique object per request.
  const key = request.bufferPosition;
  const tracker = requestTrackers.get(key);
  if (tracker != null) {
    return tracker;
  }
  const startTime = performanceNow();
  const newTracker = {
    timeoutPromise: sleep(AUTOCOMPLETE_TIMEOUT).then(() => {
      if (newTracker.pendingProviders) {
        trackSampled('e2e-autocomplete', E2E_SAMPLE_RATE, {
          path: request.editor.getPath(),
          duration: AUTOCOMPLETE_TIMEOUT,
          slowestProvider: 'timeout',
          pendingProviders: newTracker.pendingProviders,
        });
        throw new TimedOutError(AUTOCOMPLETE_TIMEOUT);
      }
      const {slowestProvider, slowestProviderTime} = newTracker;
      trackSampled('e2e-autocomplete', E2E_SAMPLE_RATE, {
        path: request.editor.getPath(),
        duration: Math.round(slowestProviderTime - startTime),
        slowestProvider: slowestProvider.analytics.eventName,
      });
    }),
    slowestProvider: provider,
    slowestProviderTime: startTime,
    pendingProviders: 0,
  };
  requestTrackers.set(key, newTracker);
  return newTracker;
}

function getSuggestions<Suggestion: atom$AutocompleteSuggestion>(
  provider: AutocompleteProvider<Suggestion>,
  eventNames: AutocompleteAnalyticEventNames,
  request: atom$AutocompleteRequest,
): Promise<?Array<*>> | ?Array<*> {
  const logObject = {};
  const requestTracker = _getRequestTracker(request, provider);
  requestTracker.pendingProviders++;

  return trackTimingSampled(
    eventNames.onGetSuggestions,
    async () => {
      let result = null;
      const startTime = performanceNow();
      if (request.activatedManually) {
        try {
          result = await provider.getSuggestions(request);
        } catch (e) {
          track(eventNames.errorOnGetSuggestions);
        }
      } else {
        try {
          result = await Promise.race([
            Promise.resolve(provider.getSuggestions(request)),
            requestTracker.timeoutPromise,
          ]);
        } catch (e) {
          if (e instanceof TimedOutError) {
            track(eventNames.timeoutOnGetSuggestions);
          } else {
            track(eventNames.errorOnGetSuggestions);
          }
        }
      }
      logObject.isEmpty = result == null || result.length === 0;
      const endTime = performanceNow();
      requestTracker.slowestProvider = provider;
      requestTracker.slowestProviderTime = endTime;
      requestTracker.pendingProviders--;
      if (result) {
        result.forEach(suggestion =>
          durationBySuggestion.set(suggestion, endTime - startTime),
        );
      }
      return result;
    },
    ON_GET_SUGGESTIONS_SAMPLE_RATE,
    logObject,
  );
}

function getSuggestionDetailsOnSelect<Suggestion: atom$AutocompleteSuggestion>(
  provider: AutocompleteProvider<Suggestion>,
  eventNames: AutocompleteAnalyticEventNames,
  suggestion: Suggestion,
): Promise<?Suggestion> {
  const logObject = {};

  return trackTiming(
    eventNames.onGetSuggestionDetailsOnSelect,
    async () => {
      let result = null;
      if (provider.getSuggestionDetailsOnSelect != null) {
        try {
          result = await provider.getSuggestionDetailsOnSelect(suggestion);
        } catch (e) {
          track(eventNames.errorOnGetSuggestionDetailsOnSelect);
        }
      }
      logObject.isEmpty = result == null;

      return result;
    },
    logObject,
  );
}

function onDidInsertSuggestion<Suggestion: atom$AutocompleteSuggestion>(
  provider: AutocompleteProvider<Suggestion>,
  eventNames: AutocompleteAnalyticEventNames,
  insertedSuggestionArgument: AtomSuggestionInsertedRequest<Suggestion>,
): void {
  trackOnDidInsertSuggestion(
    eventNames.onDidInsertSuggestion,
    provider.analytics.shouldLogInsertedSuggestion,
    insertedSuggestionArgument,
  );
  if (provider.onDidInsertSuggestion) {
    provider.onDidInsertSuggestion(insertedSuggestionArgument);
  }
}

function trackOnDidInsertSuggestion<Suggestion: atom$AutocompleteSuggestion>(
  eventName: string,
  shouldLogInsertedSuggestion: boolean,
  insertedSuggestionArgument: AtomSuggestionInsertedRequest<Suggestion>,
) {
  const duration = durationBySuggestion.get(
    insertedSuggestionArgument.suggestion,
  );
  if (!shouldLogInsertedSuggestion) {
    track(eventName, {
      duration,
    });
    return;
  }

  const {suggestion} = insertedSuggestionArgument;
  const suggestionText =
    suggestion.text != null ? suggestion.text : suggestion.snippet;
  track(eventName, {
    duration,
    replacementPrefix: suggestion.replacementPrefix,
    suggestionText,
  });
}

function getAnalytics<Suggestion: atom$AutocompleteSuggestion>(
  provider: AutocompleteProvider<Suggestion>,
): AutocompleteAnalyticEventNames {
  const eventNameFor = eventType =>
    `${provider.analytics.eventName}:autocomplete:${eventType}`;

  return {
    errorOnGetSuggestions: eventNameFor('error-on-get-suggestions'),
    onDidInsertSuggestion: eventNameFor('on-did-insert-suggestion'),
    onGetSuggestions: eventNameFor('on-get-suggestions'),
    timeoutOnGetSuggestions: eventNameFor('timeout-on-get-suggestions'),
    errorOnGetSuggestionDetailsOnSelect: eventNameFor(
      'error-on-get-suggestion-details-on-select',
    ),
    onGetSuggestionDetailsOnSelect: eventNameFor(
      'on-get-suggestion-details-on-select',
    ),
  };
}
