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

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {track, trackTiming} from '../../nuclide-analytics';

function createAutocompleteProvider<Suggestion: atom$AutocompleteSuggestion>(
  provider: AutocompleteProvider<Suggestion>,
): atom$AutocompleteProvider {
  const eventNames = getAnalytics(provider);
  // It is safe to cast it to any since AutocompleteProvider is a super type of
  // atom$AutocompleteProvider
  return ({
    ...provider,
    getSuggestions(
      request: atom$AutocompleteRequest,
    ): Promise<?Array<*>> | ?Array<*> {
      const values = {};
      return trackTiming(
        eventNames.onGetSuggestions,
        async () => {
          const result = await provider.getSuggestions(request);
          values.isEmpty = result == null || result.length === 0;
          return result;
        },
        values,
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
  const {analytics} = provider;
  const {eventName} = analytics;
  const onGetSuggestions = `nuclide-autocomplete:${eventName}:on-get-suggestions`;
  const onDidInsertSuggestion = `nuclide-autocomplete:${eventName}:on-did-insert-suggestion`;
  return {
    onGetSuggestions,
    onDidInsertSuggestion,
  };
}

export function consumeProvider<Suggestion: atom$AutocompleteSuggestion>(
  _provider:
    | AutocompleteProvider<Suggestion>
    | Array<AutocompleteProvider<Suggestion>>,
): IDisposable {
  const providers = Array.isArray(_provider) ? _provider : [_provider];
  const disposables = providers.map(provider =>
    atom.packages.serviceHub.provide(
      'autocomplete.provider',
      '2.0.0',
      createAutocompleteProvider(provider),
    ),
  );
  return new UniversalDisposable(...disposables);
}
