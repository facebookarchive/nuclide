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

import type {ProjectSymbolSearchProvider} from '../../fb-go-to-project-symbol-omni2-provider/lib/types';
import type {SymbolResult, Provider} from '../../nuclide-quick-open/lib/types';

import {HackSymbolProvider} from './HackSymbolProvider';
import {hackLanguageService, resetHackLanguageService} from './HackLanguage';
import Omni2ProjectSymbolProvider from './Omni2ProjectSymbolProvider';

export function activate() {
  hackLanguageService.then(value => value.activate());
}

export function deactivate(): void {
  resetHackLanguageService();
}

export function registerQuickOpenProvider(): Provider<SymbolResult> {
  return HackSymbolProvider;
}

export function registerProjectSymbolSearchProvider(): ProjectSymbolSearchProvider {
  return Omni2ProjectSymbolProvider;
}
