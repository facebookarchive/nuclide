'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {LinterProvider} from '../../nuclide-diagnostics-base';
import type {TypeHintProvider as TypeHintProviderType} from '../../nuclide-type-hint-interfaces';

import {GRAMMARS} from './constants';

export function activate(): void {
}

export function getHyperclickProvider() {
  return require('./HyperclickProvider');
}

export function createAutocompleteProvider(): mixed {
  const {trackOperationTiming} = require('../../nuclide-analytics');
  const getSuggestions = request => {
    return trackOperationTiming(
      'nuclide-ocaml:getAutocompleteSuggestions',
      () => require('./AutoComplete').getAutocompleteSuggestions(request));
  };
  return {
    selector: '.source.ocaml',
    inclusionPriority: 1,
    disableForSelector: '.source.ocaml .comment',
    getSuggestions,
  };
}

export function provideLinter(): LinterProvider {
  const MerlinLinterProvider = require('./LinterProvider');
  return MerlinLinterProvider;
}

export function createTypeHintProvider(): TypeHintProviderType {
  const {TypeHintProvider} = require('./TypeHintProvider');
  const typeHintProvider = new TypeHintProvider();
  const typeHint = typeHintProvider.typeHint.bind(typeHintProvider);

  return {
    inclusionPriority: 1,
    providerName: 'nuclide-ocaml',
    selector: Array.from(GRAMMARS).join(', '),
    typeHint,
  };
}
