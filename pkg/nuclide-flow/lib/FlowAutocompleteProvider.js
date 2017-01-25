/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import invariant from 'assert';
import fuzzaldrinPlus from 'fuzzaldrin-plus';

import {trackTiming} from '../../nuclide-analytics';
import AutocompleteCacher from '../../commons-atom/AutocompleteCacher';

import {getFlowServiceByNuclideUri} from './FlowServiceFactory';
import {
  getReplacementPrefix,
  JAVASCRIPT_WHOLE_STRING_IDENTIFIER_REGEX,
} from '../../nuclide-flow-common';

export default class FlowAutocompleteProvider {
  _cacher: AutocompleteCacher<?Array<atom$AutocompleteSuggestion>>;
  constructor() {
    this._cacher = new AutocompleteCacher(getSuggestionsFromFlow, {
      updateResults,
      shouldFilter,
    });
  }

  getSuggestions(
    request: atom$AutocompleteRequest,
  ): Promise<?Array<atom$AutocompleteSuggestion>> {
    return trackTiming(
      'flow.autocomplete',
      () => this._getSuggestions(request),
    );
  }

  _getSuggestions(
    request: atom$AutocompleteRequest,
  ): Promise<?Array<atom$AutocompleteSuggestion>> {
    return this._cacher.getSuggestions(request);
  }
}

// Exported only for testing
export function shouldFilter(
  lastRequest: atom$AutocompleteRequest,
  currentRequest: atom$AutocompleteRequest,
): boolean {
  const prefixIsIdentifier = JAVASCRIPT_WHOLE_STRING_IDENTIFIER_REGEX.test(currentRequest.prefix);
  const previousPrefixIsDot = /^\s*\.\s*$/.test(lastRequest.prefix);
  const currentPrefixIsSingleChar = currentRequest.prefix.length === 1;
  const startsWithPrevious = currentRequest.prefix.length - 1 === lastRequest.prefix.length &&
      currentRequest.prefix.startsWith(lastRequest.prefix);
  return prefixIsIdentifier &&
      ((previousPrefixIsDot && currentPrefixIsSingleChar) || startsWithPrevious);
}

async function getSuggestionsFromFlow(
  request: atom$AutocompleteRequest,
): Promise<?Array<atom$AutocompleteSuggestion>> {
  const {activatedManually, bufferPosition, editor, prefix} = request;
  const filePath = editor.getPath();
  const contents = editor.getText();
  if (filePath == null) {
    return null;
  }

  const flowService = getFlowServiceByNuclideUri(filePath);
  invariant(flowService);
  const suggestions = await flowService.flowGetAutocompleteSuggestions(
    filePath,
    contents,
    bufferPosition,
    activatedManually,
    prefix,
  );

  if (suggestions == null) {
    return null;
  }

  return updateResults(request, suggestions);
}

// Exported for testing
export function updateResults(
  request: atom$AutocompleteRequest,
  results: ?Array<atom$AutocompleteSuggestion>,
): ?Array<atom$AutocompleteSuggestion> {
  if (results == null) {
    return null;
  }
  const replacementPrefix = getReplacementPrefix(request.prefix);
  const resultsWithCurrentPrefix = results.map(result => {
    return {
      ...result,
      replacementPrefix,
    };
  });
  // fuzzaldrin-plus filters everything when the query is empty.
  if (replacementPrefix === '') {
    return resultsWithCurrentPrefix;
  }
  return fuzzaldrinPlus.filter(resultsWithCurrentPrefix, replacementPrefix, {key: 'displayText'});
}
