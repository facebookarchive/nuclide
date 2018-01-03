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

import type {AutocompleteProvider} from './types';

import createAutocompleteProvider from './createAutocompleteProvider';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

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
