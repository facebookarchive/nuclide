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

import passesGK from '../commons-node/passesGK';
import {PromiseWithState} from 'nuclide-commons/promise';

export type AutocompleteCacherConfig<T> = {|
  // Return null here to indicate that we should fall back to `getSuggestions`.
  updateResults: (request: atom$AutocompleteRequest, firstResult: T) => ?T,
  // If this is provided, we will ask it whether we can filter on the given request after first
  // verifying that the cursor has only moved by one column since the last request.
  shouldFilter?: (
    lastRequest: atom$AutocompleteRequest,
    currentRequest: atom$AutocompleteRequest,
    // autocomplete-plus does some debouncing so if the user types quickly enough we may not see a
    // request for every character. This indicates how many columns the cursor has moved since the
    // last request. Typically, within an autocomplete session this will be 1, but it may be greater
    // if the user typed quickly. It is also possible that the cursor moved for another reason, so
    // take care to avoid returning `true` when we are in fact not in the same autocomplete session.
    charsSinceLastRequest: number,
  ) => boolean,
  gatekeeper?: string,
|};

type AutocompleteSession<T> = {
  firstResultPromise: PromiseWithState<?T>,
  lastRequest: atom$AutocompleteRequest,
};

export default class AutocompleteCacher<T> {
  _getSuggestions: (request: atom$AutocompleteRequest) => Promise<?T>;
  _config: AutocompleteCacherConfig<T>;

  _enabled: boolean;
  _session: ?AutocompleteSession<T>;

  constructor(
    // If getSuggestions returns null or undefined, it means that we should not filter that result
    // to serve later queries, even if shouldFilter returns true. If there are truly no results, it
    // is recommended that getSuggestions return an empty Array.
    getSuggestions: (request: atom$AutocompleteRequest) => Promise<?T>,
    config: AutocompleteCacherConfig<T>,
  ) {
    this._getSuggestions = getSuggestions;
    this._config = config;
    this._setEnabled();
  }

  async _setEnabled(): Promise<void> {
    const gk = this._config.gatekeeper;
    if (gk == null) {
      this._enabled = true;
    } else {
      this._enabled = false;
      this._enabled = await passesGK(gk);
    }
  }

  getSuggestions(request: atom$AutocompleteRequest): Promise<?T> {
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
          this._session = {...this._session, lastRequest: request};
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
      const result = this._filterSuggestionsIfPossible(
        request,
        session.firstResultPromise.getPromise(),
        resultFromLanguageService,
      );
      this._session = {
        firstResultPromise: new PromiseWithState(
          getNewFirstResult(
            session.firstResultPromise.getPromise(),
            resultFromLanguageService,
          ),
        ),
        lastRequest: request,
      };
      return result;
    } else {
      const result = this._getSuggestions(request);
      this._session = {
        firstResultPromise: new PromiseWithState(result),
        lastRequest: request,
      };
      return result;
    }
  }

  async _filterSuggestionsIfPossible(
    request: atom$AutocompleteRequest,
    firstResultPromise: Promise<?T>,
    resultFromLanguageService: Promise<?T>,
  ): Promise<?T> {
    const firstResult = await firstResultPromise;
    if (firstResult != null) {
      const updated = this._config.updateResults(request, firstResult);
      if (updated != null) {
        return updated;
      }
    }
    return resultFromLanguageService;
  }

  // This doesn't guarantee we can filter results -- if the previous result turns out to be null, we
  // may still have to use the results from the language service.
  _canMaybeFilterResults(
    session: AutocompleteSession<T>,
    currentRequest: atom$AutocompleteRequest,
  ): boolean {
    const {lastRequest} = session;
    const shouldFilter =
      this._config.shouldFilter != null
        ? this._config.shouldFilter
        : defaultShouldFilter;
    const charsSinceLastRequest =
      currentRequest.bufferPosition.column - lastRequest.bufferPosition.column;
    return (
      lastRequest.bufferPosition.row === currentRequest.bufferPosition.row &&
      charsSinceLastRequest > 0 &&
      shouldFilter(lastRequest, currentRequest, charsSinceLastRequest)
    );
  }
}

async function getNewFirstResult<T>(
  firstResultPromise: Promise<?T>,
  resultFromLanguageService: Promise<?T>,
): Promise<?T> {
  const firstResult = await firstResultPromise;
  if (firstResult != null) {
    return firstResult;
  } else {
    return resultFromLanguageService;
  }
}

const IDENTIFIER_REGEX = /^[a-zA-Z_]+$/;

function defaultShouldFilter(
  lastRequest: atom$AutocompleteRequest,
  currentRequest: atom$AutocompleteRequest,
  charsSinceLastRequest: number,
) {
  return (
    currentRequest.prefix.startsWith(lastRequest.prefix) &&
    currentRequest.prefix.length ===
      lastRequest.prefix.length + charsSinceLastRequest &&
    IDENTIFIER_REGEX.test(currentRequest.prefix)
  );
}
