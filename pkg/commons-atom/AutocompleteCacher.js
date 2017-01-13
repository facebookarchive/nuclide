/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

export type AutocompleteCacherConfig<T> = {|
 updateResults: (
   request: atom$AutocompleteRequest,
   firstResult: T,
 ) => T,
 // If this is provided, we will ask it whether we can filter on the given request after first
 // verifying that the cursor has only moved by one column since the last request.
 shouldFilter?: (
   lastRequest: atom$AutocompleteRequest,
   currentRequest: atom$AutocompleteRequest,
   // TODO pass originalResult here if any client requires it
 ) => boolean,
|};

type AutocompleteSession<T> = {
  firstResult: Promise<T>,
  lastRequest: atom$AutocompleteRequest,
};

export default class AutocompleteCacher<T> {
  _getSuggestions: (request: atom$AutocompleteRequest) => Promise<T>;
  _config: AutocompleteCacherConfig<T>;

  _session: ?AutocompleteSession<T>;

  constructor(
    getSuggestions: (request: atom$AutocompleteRequest) => Promise<T>,
    config: AutocompleteCacherConfig<T>,
  ) {
    this._getSuggestions = getSuggestions;
    this._config = config;
  }

  getSuggestions(request: atom$AutocompleteRequest): Promise<T> {
    const session = this._session;
    if (session != null && this._canFilterResults(session, request)) {
      const result = this._filterSuggestions(request, session.firstResult);
      this._session = {
        firstResult: session.firstResult,
        lastRequest: request,
      };
      return result;
    } else {
      const result = this._getSuggestions(request);
      this._session = {
        firstResult: result,
        lastRequest: request,
      };
      return result;
    }
  }

  async _filterSuggestions(
    request: atom$AutocompleteRequest,
    firstResult: Promise<T>,
  ): Promise<T> {
    return this._config.updateResults(request, await firstResult);
  }

  _canFilterResults(
    session: AutocompleteSession<T>,
    currentRequest: atom$AutocompleteRequest,
  ): boolean {
    const {lastRequest} = session;
    const shouldFilter = this._config.shouldFilter != null ?
      this._config.shouldFilter :
      defaultShouldFilter;
    return lastRequest.bufferPosition.row === currentRequest.bufferPosition.row &&
        lastRequest.bufferPosition.column + 1 === currentRequest.bufferPosition.column &&
        shouldFilter(lastRequest, currentRequest);
  }
}

const IDENTIFIER_CHAR_REGEX = /[a-zA-Z_]/;

function defaultShouldFilter(
  lastRequest: atom$AutocompleteRequest,
  currentRequest: atom$AutocompleteRequest,
) {
  return currentRequest.prefix.startsWith(lastRequest.prefix) &&
    IDENTIFIER_CHAR_REGEX.test(currentRequest.prefix.charAt(currentRequest.prefix.length - 1));
}
