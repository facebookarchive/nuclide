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

import {
  timeoutPromise,
  TimedOutError,
} from '../../../modules/nuclide-commons/promise';
import {track, trackTiming} from '../../nuclide-analytics';

/**
 * Autocomplete is extremely critical to the user experience!
 * Don't tolerate anything longer than three seconds; just fail fast and
 * let the fallback providers provide something at least.
 */
const AUTOCOMPLETE_TIMEOUT = 3000;

export default function createAutocompleteProvider<
  Suggestion: atom$AutocompleteSuggestion,
>(provider: AutocompleteProvider<Suggestion>): atom$AutocompleteProvider {
  const eventNames = getAnalytics(provider);
  // It is safe to cast it to any since AutocompleteProvider is a super type of
  // atom$AutocompleteProvider
  return ({
    ...provider,
    getSuggestions(
      request: atom$AutocompleteRequest,
    ): Promise<?Array<*>> | ?Array<*> {
      const logObject = {};

      return trackTiming(
        eventNames.onGetSuggestions,
        async () => {
          let result = null;
          if (request.activatedManually) {
            try {
              result = await provider.getSuggestions(request);
            } catch (e) {
              track(eventNames.errorOnGetSuggestions);
            }
          } else {
            try {
              result = await timeoutPromise(
                Promise.resolve(provider.getSuggestions(request)),
                AUTOCOMPLETE_TIMEOUT,
              );
            } catch (e) {
              if (e instanceof TimedOutError) {
                track(eventNames.timeoutOnGetSuggestions);
              } else {
                track(eventNames.errorOnGetSuggestions);
              }
            }
          }
          logObject.isEmpty = result == null || result.length === 0;
          return result;
        },
        logObject,
      );
    },
    onDidInsertSuggestion(
      insertedSuggestionArgument: AtomSuggestionInsertedRequest<Suggestion>,
    ): void {
      trackOnDidInsertSuggestion(
        eventNames.onDidInsertSuggestion,
        provider.analytics.shouldLogInsertedSuggestion,
        insertedSuggestionArgument,
      );
      const {onDidInsertSuggestion} = provider;
      if (onDidInsertSuggestion) {
        onDidInsertSuggestion(insertedSuggestionArgument);
      }
    },
  }: any);
}

function trackOnDidInsertSuggestion<Suggestion: atom$AutocompleteSuggestion>(
  eventName: string,
  shouldLogInsertedSuggestion: boolean,
  insertedSuggestionArgument: AtomSuggestionInsertedRequest<Suggestion>,
) {
  if (!shouldLogInsertedSuggestion) {
    track(eventName);
    return;
  }

  const {suggestion} = insertedSuggestionArgument;
  const suggestionText =
    suggestion.text != null ? suggestion.text : suggestion.snippet;
  track(eventName, {
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
  };
}
